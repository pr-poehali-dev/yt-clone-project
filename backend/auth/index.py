"""
Авторизация пользователей: регистрация, вход, выход, получение профиля.
"""
import json
import os
import uuid
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p93453192_yt_clone_project")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def make_token() -> str:
    return secrets.token_hex(32)


def response(status: int, data: dict) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False, default=str)}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    token = event.get("headers", {}).get("X-Auth-Token") or event.get("headers", {}).get("x-auth-token")

    conn = get_db()
    cur = conn.cursor()

    try:
        # POST /register
        if method == "POST" and path.endswith("/register"):
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            username = body.get("username", "").strip()
            display_name = body.get("display_name", username)

            if not email or not password or not username:
                return response(400, {"error": "Заполни все поля"})
            if len(password) < 6:
                return response(400, {"error": "Пароль минимум 6 символов"})

            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email=%s OR username=%s", (email, username))
            if cur.fetchone():
                return response(409, {"error": "Пользователь с таким email или именем уже существует"})

            user_id = str(uuid.uuid4())
            pwd_hash = hash_password(password)
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (id, email, password_hash, username, display_name, is_author) VALUES (%s,%s,%s,%s,%s,%s)",
                (user_id, email, pwd_hash, username, display_name, False)
            )

            token_val = make_token()
            expires = datetime.utcnow() + timedelta(days=30)
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s,%s,%s)",
                (user_id, token_val, expires)
            )
            conn.commit()
            return response(200, {"token": token_val, "user": {"id": user_id, "email": email, "username": username, "display_name": display_name, "is_author": False}})

        # POST /login
        if method == "POST" and path.endswith("/login"):
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            pwd_hash = hash_password(password)

            cur.execute(f"SELECT id, email, username, display_name, avatar_url, bio, is_author FROM {SCHEMA}.users WHERE email=%s AND password_hash=%s", (email, pwd_hash))
            user = cur.fetchone()
            if not user:
                return response(401, {"error": "Неверный email или пароль"})

            user_id = user[0]
            token_val = make_token()
            expires = datetime.utcnow() + timedelta(days=30)
            cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s,%s,%s)", (user_id, token_val, expires))
            conn.commit()
            return response(200, {"token": token_val, "user": {"id": user_id, "email": user[1], "username": user[2], "display_name": user[3], "avatar_url": user[4], "bio": user[5], "is_author": user[6]}})

        # GET /me — получить профиль по токену
        if method == "GET" and path.endswith("/me"):
            if not token:
                return response(401, {"error": "Не авторизован"})
            cur.execute(
                f"""SELECT u.id, u.email, u.username, u.display_name, u.avatar_url, u.bio, u.is_author
                    FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON s.user_id=u.id
                    WHERE s.token=%s AND s.expires_at > NOW()""",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return response(401, {"error": "Сессия истекла"})
            return response(200, {"user": {"id": row[0], "email": row[1], "username": row[2], "display_name": row[3], "avatar_url": row[4], "bio": row[5], "is_author": row[6]}})

        # POST /logout
        if method == "POST" and path.endswith("/logout"):
            if token:
                cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at=NOW() WHERE token=%s", (token,))
                conn.commit()
            return response(200, {"ok": True})

        # POST /become-author — стать автором и создать канал
        if method == "POST" and path.endswith("/become-author"):
            if not token:
                return response(401, {"error": "Не авторизован"})
            cur.execute(
                f"""SELECT u.id FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON s.user_id=u.id
                    WHERE s.token=%s AND s.expires_at > NOW()""",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return response(401, {"error": "Сессия истекла"})
            user_id = row[0]

            channel_name = body.get("channel_name", "")
            description = body.get("description", "")
            if not channel_name:
                return response(400, {"error": "Укажи название канала"})

            cur.execute(f"SELECT id FROM {SCHEMA}.channels WHERE user_id=%s", (user_id,))
            if cur.fetchone():
                return response(409, {"error": "Канал уже создан"})

            channel_id = str(uuid.uuid4())
            cur.execute(
                f"INSERT INTO {SCHEMA}.channels (id, user_id, name, description) VALUES (%s,%s,%s,%s)",
                (channel_id, user_id, channel_name, description)
            )
            cur.execute(f"UPDATE {SCHEMA}.users SET is_author=TRUE WHERE id=%s", (user_id,))

            # Начальные записи заработка для демо
            for i, (amount, source, desc) in enumerate([
                (1250.50, "views", "Заработок за просмотры"),
                (3400.00, "subscriptions", "Платные подписки"),
                (500.00, "donations", "Донаты зрителей"),
            ]):
                cur.execute(
                    f"INSERT INTO {SCHEMA}.earnings_log (channel_id, amount, source, description, created_at) VALUES (%s,%s,%s,%s,%s)",
                    (channel_id, amount, source, desc, datetime.utcnow() - timedelta(days=i*10))
                )

            conn.commit()
            return response(200, {"ok": True, "channel_id": channel_id})

        return response(404, {"error": "Не найдено"})

    finally:
        cur.close()
        conn.close()
