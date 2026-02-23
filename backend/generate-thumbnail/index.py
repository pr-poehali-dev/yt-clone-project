"""
ИИ-генерация обложек для видео через fal.ai FLUX модель.
Принимает текстовый промпт, возвращает URL сгенерированного изображения.
"""
import json
import os
import urllib.request
import urllib.error
import boto3
import uuid
import base64

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def response(status: int, data: dict) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if event.get("httpMethod") != "POST":
        return response(405, {"error": "Method not allowed"})

    body = json.loads(event.get("body") or "{}")
    prompt = body.get("prompt", "").strip()

    if not prompt:
        return response(400, {"error": "Опиши обложку для видео"})

    fal_key = os.environ.get("FAL_API_KEY", "")
    if not fal_key:
        return response(500, {"error": "FAL_API_KEY не настроен"})

    # Улучшаем промпт для YouTube-обложки
    enhanced_prompt = f"YouTube video thumbnail, {prompt}, vibrant colors, high contrast, professional design, 16:9 aspect ratio, eye-catching, modern style, cinematic quality"

    # Запрос к fal.ai FLUX
    fal_payload = json.dumps({
        "prompt": enhanced_prompt,
        "image_size": "landscape_16_9",
        "num_inference_steps": 28,
        "guidance_scale": 3.5,
        "num_images": 1,
        "enable_safety_checker": True,
    }).encode()

    req = urllib.request.Request(
        "https://fal.run/fal-ai/flux/dev",
        data=fal_payload,
        headers={
            "Authorization": f"Key {fal_key}",
            "Content-Type": "application/json",
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read())

    images = result.get("images", [])
    if not images:
        return response(500, {"error": "Изображение не сгенерировано"})

    image_url = images[0].get("url", "")
    if not image_url:
        return response(500, {"error": "Пустой URL изображения"})

    # Скачиваем и загружаем в S3
    with urllib.request.urlopen(image_url, timeout=30) as img_resp:
        image_data = img_resp.read()

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

    file_key = f"thumbnails/{uuid.uuid4()}.jpg"
    s3.put_object(
        Bucket="files",
        Key=file_key,
        Body=image_data,
        ContentType="image/jpeg",
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/{file_key}"
    return response(200, {"url": cdn_url, "prompt": prompt})
