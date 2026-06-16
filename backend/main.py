from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import google.genai as genai
from google.genai import types
import httpx
import os
import base64
import io
import json
import math
import requests
from typing import List, Optional

# Create main app
app = FastAPI()

# Create API sub-application
api = FastAPI()

# Serve static files
app.mount("/static", StaticFiles(directory="frontend/public"), name="static")

# ── Gemini / Nano Banana configuration ──────────────────────────────────────
api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY or GEMINI_API_KEY environment variable is required")

GEMINI_MODELS = {
    "nano_banana_2": "gemini-3.1-flash-image",
    "nano_banana_pro": "gemini-3-pro-image",
    "gemini_flash": "gemini-flash-latest",
}

GEMINI_MODEL = os.environ.get("GEMINI_MODEL", GEMINI_MODELS["nano_banana_2"])

client = genai.Client(
    api_key=api_key,
    http_options=types.HttpOptions(
        client_args={'timeout': httpx.Timeout(120.0, connect=60.0)}
    )
)

# ── Fal.AI configuration ─────────────────────────────────────────────────────
FAL_KEY = os.environ.get("FAL_KEY", "")
FAL_BASE_URL = "https://fal.run"
FAL_STORAGE_URL = "https://storage.fal.ai/upload"

# Aspect ratio numerators/denominators used to compute Fal.AI image sizes
_ASPECT_RATIOS = {
    "1:1": (1, 1),  "16:9": (16, 9), "9:16": (9, 16),
    "4:3": (4, 3),  "3:4": (3, 4),   "3:2": (3, 2),
    "2:3": (2, 3),  "4:5": (4, 5),   "5:4": (5, 4),
    "21:9": (21, 9),
}


def compute_fal_image_size(aspect_ratio: str, resolution: str) -> dict:
    """
    Map an aspect ratio + resolution label to a valid Fal.AI {width, height}.

    Fal.AI GPT-Image-2 constraints:
      - Both dimensions must be multiples of 16
      - Max edge: 3840 px
      - Aspect ratio ≤ 3:1
      - Total pixels: 655,360 – 8,294,400

    Resolution targets mirror the Nano Banana naming convention:
      1K ≈ 1M px, 2K ≈ 4M px, 4K ≈ 8.29M px (Fal.AI ceiling)
    """
    TARGET_PIXELS = {"1K": 1_048_576, "2K": 4_194_304, "4K": 8_294_400}
    MAX_EDGE   = 3840
    MIN_PIXELS = 655_360
    MAX_PIXELS = 8_294_400

    w_r, h_r = _ASPECT_RATIOS.get(aspect_ratio, (1, 1))
    target = max(MIN_PIXELS, min(TARGET_PIXELS.get(resolution, 1_048_576), MAX_PIXELS))

    # Ideal float dimensions
    w_ideal = math.sqrt(target * w_r / h_r)
    h_ideal = math.sqrt(target * h_r / w_r)

    width  = max(16, round(w_ideal / 16) * 16)
    height = max(16, round(h_ideal / 16) * 16)

    # Clamp to max edge
    if width > MAX_EDGE:
        width  = MAX_EDGE
        height = max(16, round(h_ideal * (MAX_EDGE / w_ideal) / 16) * 16)
    if height > MAX_EDGE:
        height = MAX_EDGE
        width  = max(16, round(w_ideal * (MAX_EDGE / h_ideal) / 16) * 16)

    # Enforce ≤ 3:1 aspect ratio
    if width and height:
        if width / height > 3.0:
            height = max(16, (width // 3 // 16) * 16)
        elif height / width > 3.0:
            width  = max(16, (height // 3 // 16) * 16)

    # Clamp total pixels
    total = width * height
    if total < MIN_PIXELS:
        scale  = (MIN_PIXELS / total) ** 0.5
        width  = max(16, math.ceil(width  * scale / 16) * 16)
        height = max(16, math.ceil(height * scale / 16) * 16)
    elif total > MAX_PIXELS:
        scale  = (MAX_PIXELS / total) ** 0.5
        width  = max(16, math.floor(width  * scale / 16) * 16)
        height = max(16, math.floor(height * scale / 16) * 16)

    return {"width": max(16, width), "height": max(16, height)}


async def upload_to_fal_storage(image_bytes: bytes, content_type: str = "image/png") -> str:
    """Upload raw image bytes to Fal.AI storage and return the hosted URL."""
    async with httpx.AsyncClient(timeout=60.0) as http:
        resp = await http.post(
            FAL_STORAGE_URL,
            content=image_bytes,
            headers={
                "Authorization": f"Key {FAL_KEY}",
                "Content-Type": content_type,
            },
        )
        resp.raise_for_status()
        return resp.json()["url"]


# ── Pydantic models ───────────────────────────────────────────────────────────
class ImageGenerationRequest(BaseModel):
    prompt: str
    aspect_ratio: str = "1:1"
    output_resolution: str = "1K"
    output_format: str = "png"


class ImageEditRequest(BaseModel):
    prompt: str
    image_urls: List[str] = []
    aspect_ratio: str = "1:1"
    output_resolution: str = "1K"
    output_format: str = "png"


# ── Gemini response helper ────────────────────────────────────────────────────
def process_image_response(response):
    """Extract base64 image data and mime type from a Gemini response."""
    image_data = None
    mime_type = "image/png"
    try:
        if hasattr(response, 'candidates') and response.candidates:
            first_candidate = response.candidates[0]
            if hasattr(first_candidate, 'content') and first_candidate.content:
                if hasattr(first_candidate.content, 'parts') and first_candidate.content.parts:
                    for part in first_candidate.content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data:
                            if hasattr(part.inline_data, 'mime_type') and part.inline_data.mime_type:
                                mime_type = part.inline_data.mime_type
                            if hasattr(part.inline_data, 'data'):
                                raw = part.inline_data.data
                                image_data = base64.b64encode(raw).decode('utf-8') if isinstance(raw, bytes) else raw
                                break
                        elif hasattr(part, 'inlineData') and part.inlineData:
                            if hasattr(part.inlineData, 'mime_type') and part.inlineData.mime_type:
                                mime_type = part.inlineData.mime_type
                            if hasattr(part.inlineData, 'data'):
                                raw = part.inlineData.data
                                image_data = base64.b64encode(raw).decode('utf-8') if isinstance(raw, bytes) else raw
                                break
    except Exception as e:
        print(f"Error in process_image_response: {e}")
        import traceback
        traceback.print_exc()
    return image_data, mime_type


# ═══════════════════════════════════════════════════════════════════════════════
# Nano Banana (Gemini) endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@api.post("/generate_image")
async def generate_image(request: ImageGenerationRequest):
    try:
        aspect_ratio_info = {
            "1:1":  {"cinematic": "centered square composition"},
            "2:3":  {"cinematic": "vertical portrait composition"},
            "3:2":  {"cinematic": "horizontal landscape composition"},
            "3:4":  {"cinematic": "vertical portrait composition"},
            "4:3":  {"cinematic": "classic landscape composition"},
            "4:5":  {"cinematic": "vertical portrait composition"},
            "5:4":  {"cinematic": "horizontal landscape composition"},
            "9:16": {"cinematic": "vertical portrait orientation"},
            "16:9": {"cinematic": "cinematic widescreen shot"},
            "21:9": {"cinematic": "cinematic ultra-wide shot"},
        }
        aspect_info = aspect_ratio_info.get(request.aspect_ratio, {"cinematic": f"{request.aspect_ratio} composition"})

        final_prompt = f"""{request.prompt}

Technical Specifications:
- Use {aspect_info['cinematic']} framing
- Photorealistic, highly detailed, professional quality
- Sharp focus, perfect lighting

Output: Return ONLY the final generated image. Do not return text."""

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[types.Content(role="user", parts=[types.Part.from_text(text=final_prompt)])],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                image_config=types.ImageConfig(
                    aspect_ratio=request.aspect_ratio,
                    image_size=request.output_resolution,
                )
            )
        )

        image_data, mime_type = process_image_response(response)

        if image_data:
            return {
                "message": "Image generated successfully",
                "prompt": request.prompt,
                "aspect_ratio": request.aspect_ratio,
                "image": image_data,
                "mime_type": mime_type,
            }
        return {
            "message": "Image generation completed, but no image data found",
            "prompt": request.prompt,
            "aspect_ratio": request.aspect_ratio,
            "response": str(response),
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "error_type": type(e).__name__}


@api.post("/edit_image")
async def edit_image(
    prompt: str = Form(...),
    aspect_ratio: str = Form(default="1:1"),
    output_resolution: str = Form(default="1K"),
    output_format: str = Form(default="png"),
    image_urls: str = Form(default=""),
    image_file: UploadFile = File(default=None)
):
    try:
        if not image_urls.strip() and (not image_file or not image_file.filename):
            return {"error": "No image provided. Please upload an image file or provide an image URL."}

        parts = []

        if image_urls.strip():
            try:
                img_resp = requests.get(image_urls, timeout=30)
                img_resp.raise_for_status()
                image_data = base64.b64encode(img_resp.content).decode('utf-8')
                parts.append({"inlineData": {"mimeType": "image/jpeg", "data": image_data}})
            except Exception as e:
                return {"error": f"Failed to fetch image from URL: {e}"}

        if image_file and image_file.filename:
            content = await image_file.read()
            image_data = base64.b64encode(content).decode('utf-8')
            parts.append({"inlineData": {"mimeType": image_file.content_type, "data": image_data}})

        detailed_prompt = f"""You are an expert photo editor AI. Your task is to perform a natural edit on the provided image based on the user's request.

User Request: "{prompt}"

Editing Guidelines:
- Apply the requested edit to the image while maintaining photorealism
- Keep the overall composition and style consistent
- Make the edit blend seamlessly with the rest of the image

Output: Return ONLY the final edited image. Do not return text."""

        parts.append({"text": detailed_prompt})

        content_parts = []
        for part in parts:
            if "inlineData" in part:
                content_parts.append(types.Part(
                    inline_data=types.Blob(mime_type=part["inlineData"]["mimeType"], data=part["inlineData"]["data"])
                ))
            elif "text" in part:
                content_parts.append(types.Part.from_text(text=part["text"]))

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[types.Content(role="user", parts=content_parts)],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                image_config=types.ImageConfig(
                    aspect_ratio=aspect_ratio,
                    image_size=output_resolution,
                )
            )
        )

        image_data, mime_type = process_image_response(response)

        if image_data:
            return {
                "message": "Image edited successfully",
                "prompt": prompt,
                "aspect_ratio": aspect_ratio,
                "image": image_data,
                "mime_type": mime_type,
            }
        return {
            "message": "Image editing completed, but no image data found",
            "prompt": prompt,
            "response": str(response),
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "error_type": type(e).__name__}


@api.post("/compose_images")
async def compose_images(
    prompt: str = Form(...),
    aspect_ratio: str = Form(default="1:1"),
    output_resolution: str = Form(default="1K"),
    output_format: str = Form(default="png"),
    image_files: List[UploadFile] = File(default=[])
):
    try:
        parts = []

        for image_file in image_files:
            if image_file.filename:
                content = await image_file.read()
                image_data = base64.b64encode(content).decode('utf-8')
                parts.append({"inlineData": {"mimeType": image_file.content_type, "data": image_data}})

        detailed_prompt = f"""You are an expert photo editor AI. Your task is to compose the provided images into a single cohesive image based on the user's request.

User Request: "{prompt}"

Composition Guidelines:
- Combine the provided images in a natural, realistic way
- Maintain consistent lighting and style across the composition
- Create a seamless blend that looks professional and natural

Output: Return ONLY the final composed image. Do not return text."""

        parts.append({"text": detailed_prompt})

        content_parts = []
        for part in parts:
            if "inlineData" in part:
                content_parts.append(types.Part(
                    inline_data=types.Blob(mime_type=part["inlineData"]["mimeType"], data=part["inlineData"]["data"])
                ))
            elif "text" in part:
                content_parts.append(types.Part.from_text(text=part["text"]))

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[types.Content(role="user", parts=content_parts)],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                image_config=types.ImageConfig(
                    aspect_ratio=aspect_ratio,
                    image_size=output_resolution,
                )
            )
        )

        image_data, mime_type = process_image_response(response)

        if image_data:
            return {
                "message": "Images composed successfully",
                "prompt": prompt,
                "image": image_data,
                "mime_type": mime_type,
            }
        return {
            "message": "Image composition completed, but no image data found",
            "prompt": prompt,
            "response": str(response),
        }
    except Exception as e:
        return {"error": str(e)}


# ═══════════════════════════════════════════════════════════════════════════════
# Fal.AI (GPT Image 2) endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@api.post("/fal/generate_image")
async def fal_generate_image(request: ImageGenerationRequest):
    if not FAL_KEY:
        return {"error": "FAL_KEY environment variable is not configured"}
    try:
        image_size = compute_fal_image_size(request.aspect_ratio, request.output_resolution)
        payload = {
            "prompt": request.prompt,
            "image_size": image_size,
            "quality": "high",
            "output_format": request.output_format,
            "num_images": 1,
        }
        async with httpx.AsyncClient(timeout=120.0) as http:
            resp = await http.post(
                f"{FAL_BASE_URL}/openai/gpt-image-2",
                json=payload,
                headers={"Authorization": f"Key {FAL_KEY}"},
            )
            resp.raise_for_status()
            data = resp.json()

        images = data.get("images", [])
        if not images:
            return {"error": "No images returned from Fal.AI"}

        return {
            "message": "Image generated successfully",
            "prompt": request.prompt,
            "aspect_ratio": request.aspect_ratio,
            "image_url": images[0]["url"],
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "error_type": type(e).__name__}


@api.post("/fal/edit_image")
async def fal_edit_image(
    prompt: str = Form(...),
    aspect_ratio: str = Form(default="1:1"),
    output_resolution: str = Form(default="1K"),
    output_format: str = Form(default="png"),
    image_url: str = Form(default=""),       # https:// URL or data: URI
    image_file: UploadFile = File(default=None)
):
    if not FAL_KEY:
        return {"error": "FAL_KEY environment variable is not configured"}
    try:
        fal_url = None

        if image_url.strip():
            if image_url.startswith("data:"):
                # Decode base64 data URI and upload to Fal.AI storage
                header, b64data = image_url.split(",", 1)
                content_type = header.split(";")[0].split(":")[1]
                image_bytes = base64.b64decode(b64data)
                fal_url = await upload_to_fal_storage(image_bytes, content_type)
            else:
                # Already a publicly accessible URL — use directly
                fal_url = image_url.strip()
        elif image_file and image_file.filename:
            content = await image_file.read()
            fal_url = await upload_to_fal_storage(content, image_file.content_type or "image/png")
        else:
            return {"error": "No image provided"}

        image_size = compute_fal_image_size(aspect_ratio, output_resolution)
        payload = {
            "prompt": prompt,
            "image_urls": [fal_url],
            "image_size": image_size,
            "quality": "high",
            "output_format": output_format,
            "num_images": 1,
        }
        async with httpx.AsyncClient(timeout=120.0) as http:
            resp = await http.post(
                f"{FAL_BASE_URL}/openai/gpt-image-2/edit",
                json=payload,
                headers={"Authorization": f"Key {FAL_KEY}"},
            )
            resp.raise_for_status()
            data = resp.json()

        images = data.get("images", [])
        if not images:
            return {"error": "No images returned from Fal.AI"}

        return {
            "message": "Image edited successfully",
            "prompt": prompt,
            "image_url": images[0]["url"],
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "error_type": type(e).__name__}


@api.post("/fal/compose_images")
async def fal_compose_images(
    prompt: str = Form(...),
    aspect_ratio: str = Form(default="1:1"),
    output_resolution: str = Form(default="1K"),
    output_format: str = Form(default="png"),
    image_urls: str = Form(default=""),          # JSON array of URL / data: URI strings
    image_files: List[UploadFile] = File(default=[])
):
    if not FAL_KEY:
        return {"error": "FAL_KEY environment variable is not configured"}
    try:
        fal_urls = []

        # Resolve URL / data-URI images
        if image_urls.strip():
            try:
                url_list = json.loads(image_urls)
                for url in url_list:
                    if url.startswith("data:"):
                        header, b64data = url.split(",", 1)
                        content_type = header.split(";")[0].split(":")[1]
                        image_bytes = base64.b64decode(b64data)
                        fal_urls.append(await upload_to_fal_storage(image_bytes, content_type))
                    else:
                        fal_urls.append(url)
            except (json.JSONDecodeError, ValueError):
                pass

        # Upload file attachments
        for image_file in image_files:
            if image_file.filename:
                content = await image_file.read()
                fal_urls.append(await upload_to_fal_storage(content, image_file.content_type or "image/png"))

        if not fal_urls:
            return {"error": "No images provided"}

        image_size = compute_fal_image_size(aspect_ratio, output_resolution)
        payload = {
            "prompt": prompt,
            "image_urls": fal_urls,
            "image_size": image_size,
            "quality": "high",
            "output_format": output_format,
            "num_images": 1,
        }
        async with httpx.AsyncClient(timeout=120.0) as http:
            resp = await http.post(
                f"{FAL_BASE_URL}/openai/gpt-image-2/edit",
                json=payload,
                headers={"Authorization": f"Key {FAL_KEY}"},
            )
            resp.raise_for_status()
            data = resp.json()

        images = data.get("images", [])
        if not images:
            return {"error": "No images returned from Fal.AI"}

        return {
            "message": "Images composed successfully",
            "prompt": prompt,
            "image_url": images[0]["url"],
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "error_type": type(e).__name__}


# ── Utility ───────────────────────────────────────────────────────────────────

@api.get("/download_image/{image_data}")
async def download_image(image_data: str):
    try:
        image_bytes = base64.b64decode(image_data)
        return StreamingResponse(
            io.BytesIO(image_bytes),
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=generated_image.png"}
        )
    except Exception as e:
        return {"error": str(e)}


# ── Mount apps ────────────────────────────────────────────────────────────────
app.mount("/api", api, name="api")

try:
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")
except Exception as e:
    print(f"Warning: Could not mount frontend static files: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
