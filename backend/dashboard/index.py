"""
Личный кабинет автора: статистика заработка, видео, аналитика.
"""
import json
import os
from datetime import datetime, timedelta
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p93453192_yt_clone_project")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def response(status: int, data: dict) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False, default=str)}


def get_user_from_token(cur, token):
    cur.execute(
        f"""SELECT u.id, u.username, u.display_name, u.avatar_url, u.is_author
            FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON s.user_id=u.id
            WHERE s.token=%s AND s.expires_at > NOW()""",
        (token,)
    )
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    token = event.get("headers", {}).get("X-Auth-Token") or event.get("headers", {}).get("x-auth-token")

    if not token:
        return response(401, {"error": "Не авторизован"})

    conn = get_db()
    cur = conn.cursor()

    try:
        user = get_user_from_token(cur, token)
        if not user:
            return response(401, {"error": "Сессия истекла"})

        user_id, username, display_name, avatar_url, is_author = user

        # GET /stats — общая статистика канала
        if method == "GET" and path.endswith("/stats"):
            cur.execute(f"SELECT id, name, description, subscribers_count, total_views, total_earnings FROM {SCHEMA}.channels WHERE user_id=%s", (user_id,))
            channel = cur.fetchone()
            if not channel:
                return response(404, {"error": "Канал не найден"})

            ch_id, ch_name, ch_desc, subs, total_views, total_earn = channel

            # Заработок по источникам
            cur.execute(f"SELECT source, SUM(amount) FROM {SCHEMA}.earnings_log WHERE channel_id=%s GROUP BY source", (ch_id,))
            earnings_by_source = {row[0]: float(row[1]) for row in cur.fetchall()}

            # Последние 6 месяцев заработка
            monthly = []
            for i in range(5, -1, -1):
                dt = datetime.utcnow() - timedelta(days=30 * i)
                month_start = dt.replace(day=1, hour=0, minute=0, second=0)
                month_end = (month_start + timedelta(days=32)).replace(day=1)
                cur.execute(
                    f"SELECT COALESCE(SUM(amount),0) FROM {SCHEMA}.earnings_log WHERE channel_id=%s AND created_at >= %s AND created_at < %s",
                    (ch_id, month_start, month_end)
                )
                val = float(cur.fetchone()[0])
                monthly.append({"month": month_start.strftime("%b"), "amount": val})

            # Видео канала
            cur.execute(
                f"SELECT id, title, thumbnail_url, views_count, likes_count, comments_count, earnings, created_at FROM {SCHEMA}.videos WHERE channel_id=%s ORDER BY created_at DESC LIMIT 10",
                (ch_id,)
            )
            vids = []
            for v in cur.fetchall():
                vids.append({"id": v[0], "title": v[1], "thumbnail_url": v[2], "views": v[3], "likes": v[4], "comments": v[5], "earnings": float(v[6]), "created_at": v[7]})

            # Подписчики за 30 дней (из таблицы subscriptions)
            cur.execute(
                f"SELECT COUNT(*) FROM {SCHEMA}.subscriptions WHERE channel_id=%s AND created_at >= NOW() - INTERVAL '30 days'",
                (ch_id,)
            )
            new_subs = cur.fetchone()[0]

            return response(200, {
                "channel": {"id": ch_id, "name": ch_name, "description": ch_desc, "subscribers": subs, "total_views": total_views, "total_earnings": float(total_earn)},
                "earnings_by_source": earnings_by_source,
                "monthly_earnings": monthly,
                "videos": vids,
                "new_subscribers_30d": new_subs,
            })

        # POST /upload-video — сохранить видео
        if method == "POST" and path.endswith("/upload-video"):
            body = json.loads(event.get("body") or "{}")
            cur.execute(f"SELECT id FROM {SCHEMA}.channels WHERE user_id=%s", (user_id,))
            ch = cur.fetchone()
            if not ch:
                return response(404, {"error": "Сначала создай канал"})
            ch_id = ch[0]

            title = body.get("title", "")
            description = body.get("description", "")
            thumbnail_url = body.get("thumbnail_url", "")
            category = body.get("category", "Другое")

            if not title:
                return response(400, {"error": "Укажи название видео"})

            import uuid
            vid_id = str(uuid.uuid4())
            cur.execute(
                f"INSERT INTO {SCHEMA}.videos (id, channel_id, title, description, thumbnail_url, category) VALUES (%s,%s,%s,%s,%s,%s)",
                (vid_id, ch_id, title, description, thumbnail_url, category)
            )
            conn.commit()
            return response(200, {"ok": True, "video_id": vid_id})

        return response(404, {"error": "Не найдено"})

    finally:
        cur.close()
        conn.close()
