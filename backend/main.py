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
import requests
from typing import List, Optional

# Create main app
app = FastAPI()

# Create API sub-application
api = FastAPI()

# Serve static files
app.mount("/static", StaticFiles(directory="frontend/public"), name="static")

# Configure Gemini API - Load from environment variables
api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY or GEMINI_API_KEY environment variable is required")

# Get model name from environment, with fallback to default
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3-pro-image-preview")

# Create client with extended timeout for image generation (120 seconds)
# Pass timeout to httpx client via client_args in http_options
client = genai.Client(
    api_key=api_key,
    http_options=types.HttpOptions(
        client_args={'timeout': httpx.Timeout(120.0, connect=60.0)}
    )
)

# Models
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

# Utility function to process image data
def process_image_response(response):
    image_data = None
    try:
        print(f"Processing response: {type(response)}")
        if hasattr(response, 'candidates') and response.candidates:
            print(f"Candidates found: {len(response.candidates)}")
            first_candidate = response.candidates[0]
            if hasattr(first_candidate, 'content') and first_candidate.content:
                print(f"Content found: {type(first_candidate.content)}")
                if hasattr(first_candidate.content, 'parts') and first_candidate.content.parts:
                    print(f"Parts found: {len(first_candidate.content.parts)}")
                    for i, part in enumerate(first_candidate.content.parts):
                        print(f"Part {i}: {type(part)}")
                        # Check for inline_data (new API format)
                        if hasattr(part, 'inline_data') and part.inline_data:
                            print(f"Inline data found: {type(part.inline_data)}")
                            if hasattr(part.inline_data, 'data'):
                                # Convert binary data to base64 string
                                raw_data = part.inline_data.data
                                if isinstance(raw_data, bytes):
                                    image_data = base64.b64encode(raw_data).decode('utf-8')
                                else:
                                    image_data = raw_data  # Already a string
                                print(f"Image data extracted and encoded successfully")
                                break
                        # Also check for inlineData (alternative format)
                        elif hasattr(part, 'inlineData') and part.inlineData:
                            print(f"InlineData found: {type(part.inlineData)}")
                            if hasattr(part.inlineData, 'data'):
                                # Convert binary data to base64 string
                                raw_data = part.inlineData.data
                                if isinstance(raw_data, bytes):
                                    image_data = base64.b64encode(raw_data).decode('utf-8')
                                else:
                                    image_data = raw_data  # Already a string
                                print(f"Image data extracted and encoded successfully")
                                break
                        else:
                            print(f"Part {i} has no inline_data or inlineData")
                else:
                    print("No parts found in content")
            else:
                print("No content found in first candidate")
        else:
            print("No candidates found in response")
    except Exception as e:
        print(f"Error in process_image_response: {str(e)}")
        import traceback
        traceback.print_exc()
    return image_data

# API routes will be handled before static file serving
# The React app will be served by the StaticFiles mount above

# Image generation endpoint
@api.post("/generate_image")
async def generate_image(request: ImageGenerationRequest):
    try:
        print(f"Generating image with prompt: {request.prompt}, aspect_ratio: {request.aspect_ratio}")
        
        try:
            print("Step 1: Enhancing user prompt with Gemini 2.5 Flash...")
            
            # Map aspect ratios to composition hints and descriptions
            aspect_ratio_info = {
                "1:1": {
                    "composition": "square",
                    "description": "square format (1024×1024 pixels)",
                    "cinematic": "centered square composition"
                },
                "2:3": {
                    "composition": "portrait",
                    "description": "portrait format (832×1248 pixels)",
                    "cinematic": "vertical portrait composition"
                },
                "3:2": {
                    "composition": "landscape",
                    "description": "landscape format (1248×832 pixels)",
                    "cinematic": "horizontal landscape composition"
                },
                "3:4": {
                    "composition": "portrait",
                    "description": "portrait format (864×1184 pixels)",
                    "cinematic": "vertical portrait composition"
                },
                "4:3": {
                    "composition": "landscape",
                    "description": "landscape format (1184×864 pixels)",
                    "cinematic": "classic landscape composition"
                },
                "4:5": {
                    "composition": "portrait",
                    "description": "portrait format (896×1152 pixels)",
                    "cinematic": "vertical portrait composition"
                },
                "5:4": {
                    "composition": "landscape",
                    "description": "landscape format (1152×896 pixels)",
                    "cinematic": "horizontal landscape composition"
                },
                "9:16": {
                    "composition": "portrait",
                    "description": "portrait format (768×1344 pixels)",
                    "cinematic": "vertical portrait orientation"
                },
                "16:9": {
                    "composition": "widescreen",
                    "description": "widescreen landscape format (1344×768 pixels)",
                    "cinematic": "cinematic widescreen shot"
                },
                "21:9": {
                    "composition": "ultrawide",
                    "description": "ultra-wide format (1536×672 pixels)",
                    "cinematic": "cinematic ultra-wide shot"
                }
            }
            
            aspect_info = aspect_ratio_info.get(request.aspect_ratio, {
                "composition": "square", 
                "description": f"{request.aspect_ratio} aspect ratio",
                "cinematic": f"{request.aspect_ratio} composition"
            })
            
            # Step 1: SKIP Intelligent prompt optimization to ensure strict prompt adherence
            # The user reported that details were being lost/changed. Passing the prompt directly
            # fixes this issue.
            print(f"⏩ Skipping prompt enhancement to ensure strict adherence to user prompt")
            enhanced_prompt = request.prompt
            
            print("Step 2: Generating image with enhanced prompt...")

            # Step 2: Generate image with enhanced prompt
            # Gemini 2.5 Flash Image requires "aspect ratio is" followed by the ratio value
            final_prompt = f"""{enhanced_prompt}

Technical Specifications:
- Use {aspect_info['cinematic']} framing
- Photorealistic, highly detailed, professional quality
- Sharp focus, perfect lighting

Output: Return ONLY the final generated image. Do not return text."""

            # Use generate_content with IMAGE response modality for Gemini models
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=[
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=final_prompt)]
                    )
                ],
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"],
                    image_config=types.ImageConfig(
                        aspect_ratio=request.aspect_ratio,
                        image_size=request.output_resolution
                    )
                )
            )
            print(f"client.models.generate_content completed successfully")
        except Exception as e:
            print(f"Error calling model.generate_content: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e
        
        print(f"Response received: {type(response)}")

        # Check for prompt feedback and safety ratings
        if hasattr(response, 'prompt_feedback'):
            print(f"⚠️ Prompt Feedback: {response.prompt_feedback}")
            if hasattr(response.prompt_feedback, 'block_reason'):
                print(f"🚫 Block Reason: {response.prompt_feedback.block_reason}")
            if hasattr(response.prompt_feedback, 'safety_ratings'):
                print(f"🛡️ Prompt Safety Ratings: {response.prompt_feedback.safety_ratings}")

        if hasattr(response, 'candidates'):
            print(f"Candidates: {response.candidates}")
            if response.candidates:
                print(f"First candidate: {response.candidates[0]}")

                # Check safety ratings
                if hasattr(response.candidates[0], 'safety_ratings'):
                    print(f"🛡️ Candidate Safety Ratings: {response.candidates[0].safety_ratings}")

                # Check finish reason
                if hasattr(response.candidates[0], 'finish_reason'):
                    print(f"🏁 Finish Reason: {response.candidates[0].finish_reason}")

                if hasattr(response.candidates[0], 'content'):
                    print(f"Content: {response.candidates[0].content}")
                    if hasattr(response.candidates[0].content, 'parts'):
                        print(f"Parts: {response.candidates[0].content.parts}")
            else:
                print(f"❌ No candidates in response - checking for block/safety issues")
                print(f"📋 Full response: {response}")
        
        image_data = process_image_response(response)
        print(f"Image data extracted: {image_data is not None}")
        
        if image_data:
            return {
                "message": "Image generated successfully",
                "prompt": request.prompt,
                "aspect_ratio": request.aspect_ratio,
                "image": image_data
            }
        else:
            # Handle case where response might not have text attribute
            response_text = "No response text available"
            if hasattr(response, 'text') and response.text:
                response_text = response.text
            elif hasattr(response, '__dict__'):
                # Try to get text from response attributes
                response_text = str(response)
                
            return {
                "message": "Image generation completed, but no image data found",
                "prompt": request.prompt,
                "aspect_ratio": request.aspect_ratio,
                "response": response_text
            }
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        # Additional error handling to get more details
        error_details = {
            "error": str(e),
            "error_type": type(e).__name__,
            "request_prompt": request.prompt,
            "request_aspect_ratio": request.aspect_ratio
        }
        if "text" in str(e).lower():
            error_details["additional_info"] = "This error suggests an issue with text processing in the response"
        return error_details

# Image editing endpoint
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
        print(f"Edit image request received:")
        print(f"  Prompt: {prompt}")
        print(f"  Aspect Ratio: {aspect_ratio}")
        print(f"  Image URLs: {repr(image_urls)}")
        print(f"  Image file: {image_file.filename if image_file else 'None'}")
        
        # Validate that we have at least one image source
        if not image_urls.strip() and (not image_file or not image_file.filename):
            return {
                "error": "No image provided. Please upload an image file or provide an image URL."
            }
        
        # Prepare content parts using the working pixshop format
        parts = []
        
        # Add images from URLs first (like pixshop does)
        if image_urls.strip():
            try:
                print(f"Processing image URL: {image_urls}")
                image_response = requests.get(image_urls)
                image_response.raise_for_status()
                # Convert to base64 string for inline data
                image_data = base64.b64encode(image_response.content).decode('utf-8')
                parts.append({
                    "inlineData": {
                        "mimeType": "image/jpeg",
                        "data": image_data
                    }
                })
                print("Successfully added image from URL")
            except Exception as e:
                print(f"Error processing image URL {image_urls}: {str(e)}")
                return {
                    "error": f"Failed to fetch image from URL: {str(e)}"
                }
        
        # Add uploaded image
        if image_file and image_file.filename:
            content = await image_file.read()
            # Convert to base64 string for inline data
            image_data = base64.b64encode(content).decode('utf-8')
            parts.append({
                "inlineData": {
                    "mimeType": image_file.content_type,
                    "data": image_data
                }
            })
            print(f"Successfully added uploaded image: {image_file.filename}")
        
        # Create detailed prompt with aspect ratio specification
        # Map aspect ratios to expected pixel dimensions for user clarity
        aspect_ratio_descriptions = {
            "1:1": "square format (1024×1024 pixels)",
            "2:3": "portrait format (832×1248 pixels)",
            "3:2": "landscape format (1248×832 pixels)",
            "3:4": "portrait format (864×1184 pixels)",
            "4:3": "landscape format (1184×864 pixels)",
            "4:5": "portrait format (896×1152 pixels)",
            "5:4": "landscape format (1152×896 pixels)",
            "9:16": "portrait format (768×1344 pixels)",
            "16:9": "widescreen landscape format (1344×768 pixels)",
            "21:9": "ultra-wide format (1536×672 pixels)"
        }

        aspect_description = aspect_ratio_descriptions.get(aspect_ratio, f"{aspect_ratio} aspect ratio")
        
        detailed_prompt = f"""You are an expert photo editor AI. Your task is to perform a natural edit on the provided image based on the user's request.

User Request: "{prompt}"

Editing Guidelines:
- Apply the requested edit to the image while maintaining photorealism
- Keep the overall composition and style consistent
- Make the edit blend seamlessly with the rest of the image

Output: Return ONLY the final edited image. Do not return text."""

        # Add the detailed prompt as text part
        parts.append({"text": detailed_prompt})

        print(f"Sending {len(parts)} parts to API: {len([p for p in parts if 'inlineData' in p])} image(s) + 1 text prompt")

        # Use generate_content with multimodal input (images + text) for Gemini
        # Convert parts to proper Content structure
        content_parts = []
        for part in parts:
            if "inlineData" in part:
                content_parts.append(types.Part(
                    inline_data=types.Blob(
                        mime_type=part["inlineData"]["mimeType"],
                        data=part["inlineData"]["data"]
                    )
                ))
            elif "text" in part:
                content_parts.append(types.Part.from_text(text=part["text"]))

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Content(
                    role="user",
                    parts=content_parts
                )
            ],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                image_config=types.ImageConfig(
                    aspect_ratio=aspect_ratio,
                    image_size=output_resolution
                )
            )
        )

        image_data = process_image_response(response)

        if image_data:
            return {
                "message": "Image edited successfully",
                "prompt": prompt,
                "aspect_ratio": aspect_ratio,
                "image": image_data
            }
        else:
            # Handle case where response might not have text attribute
            response_text = "No response text available"
            if hasattr(response, 'text') and response.text:
                response_text = response.text
            elif hasattr(response, '__dict__'):
                # Try to get text from response attributes
                response_text = str(response)
                
            return {
                "message": "Image editing completed, but no image data found",
                "prompt": prompt,
                "response": response_text
            }
    except Exception as e:
        print(f"Exception in edit_image: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "error": str(e),
            "error_type": type(e).__name__,
            "prompt": prompt if 'prompt' in locals() else None,
            "aspect_ratio": aspect_ratio if 'aspect_ratio' in locals() else None,
            "has_image_file": image_file is not None and image_file.filename is not None,
            "has_image_urls": bool(image_urls.strip()) if 'image_urls' in locals() else False
        }

# Multiple image composition endpoint
@api.post("/compose_images")
async def compose_images(
    prompt: str = Form(...),
    aspect_ratio: str = Form(default="1:1"),
    output_resolution: str = Form(default="1K"),
    output_format: str = Form(default="png"),
    image_files: List[UploadFile] = File(default=[])
):
    try:
        # Prepare content parts using the working pixshop format
        parts = []
        
        # Add uploaded images first
        for image_file in image_files:
            if image_file.filename:
                content = await image_file.read()
                image_data = base64.b64encode(content).decode('utf-8')
                parts.append({
                    "inlineData": {
                        "mimeType": image_file.content_type,
                        "data": image_data
                    }
                })
        
        # Create detailed prompt for composition
        detailed_prompt = f"""You are an expert photo editor AI. Your task is to compose the provided images into a single cohesive image based on the user's request.

User Request: "{prompt}"

Composition Guidelines:
- Combine the provided images in a natural, realistic way
- Maintain consistent lighting and style across the composition
- Create a seamless blend that looks professional and natural

Output: Return ONLY the final composed image. Do not return text."""

        # Add the detailed prompt as text part
        parts.append({"text": detailed_prompt})

        # Use generate_content with multimodal input for Gemini composition
        # Convert parts to proper Content structure
        content_parts = []
        for part in parts:
            if "inlineData" in part:
                content_parts.append(types.Part(
                    inline_data=types.Blob(
                        mime_type=part["inlineData"]["mimeType"],
                        data=part["inlineData"]["data"]
                    )
                ))
            elif "text" in part:
                content_parts.append(types.Part.from_text(text=part["text"]))

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Content(
                    role="user",
                    parts=content_parts
                )
            ],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                image_config=types.ImageConfig(
                    aspect_ratio=aspect_ratio,
                    image_size=output_resolution
                )
            )
        )

        image_data = process_image_response(response)

        if image_data:
            return {
                "message": "Images composed successfully",
                "prompt": prompt,
                "image": image_data
            }
        else:
            # Handle case where response might not have text attribute
            response_text = "No response text available"
            if hasattr(response, 'text') and response.text:
                response_text = response.text
            elif hasattr(response, '__dict__'):
                # Try to get text from response attributes
                response_text = str(response)
                
            return {
                "message": "Image composition completed, but no image data found",
                "prompt": prompt,
                "response": response_text
            }
    except Exception as e:
        return {"error": str(e)}

# Download image endpoint
@api.get("/download_image/{image_data}")
async def download_image(image_data: str):
    try:
        # Decode base64 image data
        image_bytes = base64.b64decode(image_data)
        
        return StreamingResponse(
            io.BytesIO(image_bytes),
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=generated_image.png"}
        )
    except Exception as e:
        return {"error": str(e)}

# Mount API sub-application first
app.mount("/api", api, name="api")

# Mount React frontend at root - API routes are now protected under /api
try:
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")
except Exception as e:
    print(f"Warning: Could not mount frontend static files: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)