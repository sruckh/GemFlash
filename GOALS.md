I would like to have a containerized app (WebUI) that uses Google 2.5 Flash Image SDK to generate and to edit images.
The user should be able to select appropriate resolutions supported by the model. The options will be selected from a drop down list box.
In image generation mode the user should supply an AI image prompt. Which the API will use to generate an image.
In edit mode the user should either be able to supply a URL to an image, or upload an image from their local device to be the source image to be edited.  The user should then be able to prompt for the edits they would like to make to the uploaded image.  The ability to add multiple pictures should be supported.  For example, A user and a Product.  The user can prompt to put picture 1 and Picture 2 together to make a new composition.  See, https://ai.studio/apps/bundled/home_canvas, for an example of using multiple source images.
The users should be able to save/download the generated or edited images to their local machine.
This container will only expose ports to the docker network, shared_net.
This web interface will be accessed from Nginx Proxy Manager.

Resources and documentation for using Python SDK for Google 2.5 Flash Image.
[How to Use Nano Banana via API (Gemini-2-5-flash-image)](https://apidog.com/blog/nano-banana-via-api/)
[raw.githubusercontent.com/google-gemini/cookbook/main/quickstarts-js/Image_out.js](https://raw.githubusercontent.com/google-gemini/cookbook/main/quickstarts-js/Image_out.js)
[Generate images with Gemini | Generative AI on Vertex AI | Google Cloud](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/image-generation#googlegenaisdk_imggen_mmflash_with_txt-python_genai_sdk)

Here is an example of a feature rich application utilizing the Google 2.5 Flash Image API:  https://ai.studio/apps/bundled/pixshop .

Google Cloud Project Name: GoogleImage
I will supply a GOOGLE_API_KEY in an .env file
(API key provided separately for security)

Write the app using ShadCN ([The Foundation for your Design System - shadcn/ui](https://ui.shadcn.com/)) components, Tailwind CSS ([Installing Tailwind CSS with Vite - Tailwind CSS](https://tailwindcss.com/docs/installation/using-vite)), react ([React Reference Overview – React](https://react.dev/reference/react)), JavaScript, and HTML.

Use serena MCP to read memories for Context.
Use Context7 to get more documentation necessary to build enterprise grade system.
Turn this image into a favicon image: ![Gemneye Banana Logo](https://snipshot.io/wlHDlHC.jpg)

**Do NOT** install modules and dependencies on the localhost.  It is OK to install the necessary files within the container.
**DO NOT** use docker-compose as it has been deprecated.  Instead use docker compose.
Ask questions if there is any doubt about implementation.

