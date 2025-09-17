<div align="center">
  <h1>🗡️⛩️🌸 OTĀKU ORACLE 🍥☯🍜</h1>
  <p><i>Anime-grade Q&A — stylish Django + Vite app with 3D, micro-anims, and resilient LLM fallbacks</i></p>
</div>

<br>

<div align="center">

  <!-- Repo badges -->
  <a href="https://github.com/brej-29/otaku-oracle">
    <img alt="Last Commit" src="https://img.shields.io/github/last-commit/brej-29/otaku-oracle?logo=github">
  </a>
  <img alt="License" src="https://img.shields.io/badge/License-MIT-informational">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white">
  <img alt="Django" src="https://img.shields.io/badge/Django-5.x-0C4B33?logo=django&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white">
  <img alt="Three.js" src="https://img.shields.io/badge/three.js-0.180-000000?logo=three.js&logoColor=white">
  <img alt="GSAP" src="https://img.shields.io/badge/GSAP-ScrollTrigger-88CE02">
  <img alt="Railway" src="https://img.shields.io/badge/Deployed%20on-Railway-0B0D0E?logo=railway&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white">

</div>

<div align="center">
  <br>
  <b>Stack</b><br><br>
  <code>Django</code> • <code>Gunicorn</code> • <code>Whitenoise</code> • <code>Vite</code> • <code>Tailwind (utility classes)</code> • <code>Three.js</code> • <code>GSAP + ScrollTrigger</code> • <code>Lottie</code> • <code>FilePond</code> • <code>DOMPurify</code> • <code>OpenRouter (OpenAI SDK)</code> • <code>Docker</code>
</div>

---

## Table of Contents
- [Overview](#overview)
- [Demo & Screenshots](#demo--screenshots)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Environment Variables](#environment-variables)
- [Production Builds](#production-builds)
  - [Run with Docker](#run-with-docker)
  - [Deploy on Railway](#deploy-on-railway)
- [How It Works](#how-it-works)
  - [Frontend](#frontend)
  - [3D Scene](#3d-scene)
  - [LLM Fallback Logic](#llm-fallback-logic)
- [Performance Notes](#performance-notes)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)
- [Contact](#contact)

---

## Overview

**Otaku Oracle** is a Django web app with a Vite-powered frontend that answers anime/manga questions in a fun, highly-styled interface. It blends:

- a **glass/neon UI** with Lottie micro-animations,
- a **Three.js** background with scroll-aware motion,
- a **resilient OpenRouter client** that automatically falls back across multiple models on rate limits or overloads,
- an accessible **Playground** with image URL support.

The goal is to be both **delightful** and **reliable** under load.

> **Live (Railway):** (https://otaku-oracle-production.up.railway.app/)

---

## Demo & Screenshots

**Home**

<img width="1917" height="908" alt="image" src="https://github.com/user-attachments/assets/a6c4354c-5a43-4674-a9bb-bf7e7cb84996" />

<img width="1919" height="917" alt="image" src="https://github.com/user-attachments/assets/8cb4687e-f841-4a49-8c50-7bedbc16e60c" />

**Playground**

<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/30b07bf0-10b3-48e3-ab13-0ed8f8bb1763" />

**About**

<img width="1919" height="920" alt="image" src="https://github.com/user-attachments/assets/a22c07c9-4427-48f9-981c-78a052df5627" />

**Mobile**

<img width="533" height="797" alt="image" src="https://github.com/user-attachments/assets/3333ba2c-926e-4781-a751-cf5ae6f9dc24" />

---

## Features

- 🎨 **Styled UI** — neon glass panels, kana branding, header theme toggle, toast notifications.
- 🧩 **Vite bundling** — modern JS, fast HMR; production assets collected via Django.
- 🗺️ **Three.js background** — two GLB characters with scroll-driven focus swap on desktop, lightweight spin on low-end/mobile.
- 🧠 **LLM client with tiered fallback** — tries `DEFAULT_MODEL → ALT_MODEL_1 → ALT_MODEL_2 → FALLBACK_MODEL`.
- 🖼️ **Vision-friendly input** — supports public image URL (optional) and local previews via FilePond.
- 🧼 **Safe rendering** — responses are parsed as Markdown and sanitized with DOMPurify.
- 🔒 **Prod-ready Django** — Gunicorn + Whitenoise, sensible `ALLOWED_HOSTS/CSRF` guidance.
- 🐳 **Dockerized** — reproducible builds for local and deployment.

---

## Project Structure

```
otaku-oracle/
├── core/
│ ├── openrouter_client.py # Tiered model fallback & API calls
│ ├── views.py # Django views and JSON API
│ └── ... # models, admin, etc (if any)
├── otaku_oracle/
│ ├── settings.py # Django settings (reads env)
│ ├── urls.py # Routes
│ └── wsgi.py / asgi.py
├── templates/ # base.html, home.html, playground.html, etc
├── static/ # fonts/images/lottie/models
│ ├── lottie/
│ ├── models/ # .glb assets
│ └── brand/ ...
├── frontend/ # Vite app (JS/CSS)
│ ├── src/
│ │ ├── main.js # init scripts (GSAP, 3D, toasts)
│ │ └── style.css # compiled styles
│ └── vite.config.js
├── requirements.txt
├── manage.py
├── Dockerfile
└── README.md
```
---

## Getting Started

### Prerequisites

- **Python** 3.11+ (3.13 works)
- **Node** 18/20 LTS
- **npm** 9/10
- (Optional) **Docker** 24+

### Local Development

> Run backend and frontend in **two terminals** for the best DX.

**1) Clone & Python setup**
```bash
git clone https://github.com/brej-29/otaku-oracle.git
cd otaku-oracle

python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env  # create and fill values (see next section)
```

**2) Frontend (Vite)**
```bash
git clone https://github.com/brej-29/otaku-oracle.git
cd otaku-oracle

python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env  # create and fill values (see next section)
```
Vite serves assets for HMR; django-vite takes care of tags in base.html.

**3) Django**
```bash
git clone https://github.com/brej-29/otaku-oracle.git
cd otaku-oracle

python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env  # create and fill values (see next section)
```
Open http://127.0.0.1:8000/
**Production asset build (local)**
```bash
npm run build --prefix frontend
python manage.py collectstatic --noinput
```

### Environment Variables

Create a `.env` in the repo root (or set these in Railway). **Required:**

| Key                    | Example                                                                                         | Notes                          |
|------------------------|--------------------------------------------------------------------------------------------------|--------------------------------|
| `SECRET_KEY`           | `long-random-string`                                                                             | Django secret                  |
| `DEBUG`                | `False`                                                                                          | `True` for local dev           |
| `ALLOWED_HOSTS`        | `*.up.railway.app,otaku-oracle-production.up.railway.app,127.0.0.1,localhost`                    | Comma-separated                |
| `CSRF_TRUSTED_ORIGINS` | `https://*.up.railway.app,https://otaku-oracle-production.up.railway.app,http://127.0.0.1,http://localhost` | **Include schemes**            |
| `OPENROUTER_API_KEY`   | `sk-...`                                                                                         | Your OpenRouter key            |
| `DEFAULT_MODEL`        | `google/gemini-2.0-flash-exp:free`                                                               | First choice                   |
| `ALT_MODEL_1`          | `meta-llama/llama-3.1-8b-instruct`                                                               | Second                         |
| `ALT_MODEL_2`          | `anthropic/claude-3-haiku`                                                                       | Third                          |
| `FALLBACK_MODEL`       | `openrouter/sonoma-dusk-alpha`                                                                   | Last resort                    |

**Optional hardening** (if referenced in `settings.py`):  
`CSRF_COOKIE_SECURE=True`, `SESSION_COOKIE_SECURE=True`, `SECURE_SSL_REDIRECT=True`, `DJANGO_LOG_LEVEL=INFO`.

### `.env` template (copy/paste)

```dotenv
# Django
SECRET_KEY=changeme
DEBUG=False
ALLOWED_HOSTS=*.up.railway.app,otaku-oracle-production.up.railway.app,127.0.0.1,localhost
CSRF_TRUSTED_ORIGINS=https://*.up.railway.app,https://otaku-oracle-production.up.railway.app,http://127.0.0.1,http://localhost

# OpenRouter / Models
OPENROUTER_API_KEY=sk-xxxx
DEFAULT_MODEL=google/gemini-2.0-flash-exp:free
ALT_MODEL_1=meta-llama/llama-3.1-8b-instruct
ALT_MODEL_2=anthropic/claude-3-haiku
FALLBACK_MODEL=openrouter/sonoma-dusk-alpha

# Optional security in production
CSRF_COOKIE_SECURE=True
SESSION_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True
DJANGO_LOG_LEVEL=INFO
```

---

## Production Builds

### Run with Docker

```bash
# Build a production image
docker build -t otaku-oracle:prod .

# Run the container (replace values or use --env-file .env)
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e SECRET_KEY=changeme \
  -e DEBUG=False \
  -e ALLOWED_HOSTS=127.0.0.1,localhost \
  -e CSRF_TRUSTED_ORIGINS=http://127.0.0.1,http://localhost \
  -e OPENROUTER_API_KEY=sk-xxxx \
  -e DEFAULT_MODEL=google/gemini-2.0-flash-exp:free \
  -e ALT_MODEL_1=meta-llama/llama-3.1-8b-instruct \
  -e ALT_MODEL_2=anthropic/claude-3-haiku \
  -e FALLBACK_MODEL=openrouter/sonoma-dusk-alpha \
  otaku-oracle:prod
```
The container starts Gunicorn and serves static files via Whitenoise.
Tip (Railway): Add your Railway domain to both ALLOWED_HOSTS and CSRF_TRUSTED_ORIGINS (with https://) to avoid 400 “Bad Request” during health checks.

### Deploy on Railway

1. **New Project → Deploy from Repo**  
   Import this GitHub repository. (Alternatively, deploy the **Dockerfile** directly.)

2. **Automatic Build & Run**  
   Railway detects the `Dockerfile`, builds the image, and starts your service using the container `CMD`.

3. **Set Environment Variables**  
   In the Railway dashboard, add the variables listed in the **Environment Variables** section of this README (e.g., `SECRET_KEY`, `OPENROUTER_API_KEY`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `DEFAULT_MODEL`, `ALT_MODEL_1`, `ALT_MODEL_2`, `FALLBACK_MODEL`, etc).

4. **Networking → Generate Domain**  
   Click **Generate Domain** to get a public URL (e.g., `https://your-app.up.railway.app`).

5. **(Optional) Health Check**

---

## How It Works

### Frontend

The frontend is bundled by **Vite** into a single entry (`frontend/src/main.js`) that initializes:

- **Theme toggle**, **toast system**, and **Lottie** micro-animations.  
- **GSAP** parallax and panel reveal effects  
- These are **disabled on small/low-end devices** to improve performance.  
- **Playground** form:  
- Sends `POST /api/ask/` to the Django backend.  
- Renders answers as Markdown via **marked**, then sanitizes with **DOMPurify**.  
- **FilePond** provides **local image preview**; for LLM vision, pass a **public image URL** instead.

**Request flow (simplified):**
```text
UI (Vite) -> POST /api/ask/ -> Django view -> OpenRouter client -> (tiered fallback models)
                                          <- JSON {text, model, fallback_used} <-
<- Rendered Markdown + toasts (client)
```
- If a call hits a **rate limit/overload** (HTTP **429** or vendor wording like *rate*, *quota*, *overloaded*), the client **automatically tries the next model** in the chain.
- Non-retryable errors (e.g., invalid request) are surfaced to the UI with a helpful toast.
- The server **returns JSON including the model that produced the answer**, so the UI can display a friendly notice like:

> “Using **{model}** while the main model trains for its next arc…”

---

## Performance Notes

- Mobile: we skip heavy scroll triggers and MSAA; reduce device pixel ratio to cap GPU load.

- 3D: models are centered and scaled once; shader compilation happens before first frame render to avoid popping.

- Static: built via Vite, served by Whitenoise; collectstatic runs in the Docker build.

---

## Roadmap

 - More compact Mini Timeline content with emoji beats and series callouts

 - Option to switch background character sets

 - Persistent conversation history

 - Unit tests for API error paths

 - Lighthouse audit + perf budget

---

## Contributing

PRs welcome! Please:

1. Open an issue describing the change.

2. Keep UI additions accessible (contrast, focus states).

3. Avoid shipping large assets; link to sources or compress.

---

## License

MIT LICENSE

---

## Credits

- 3D assets: your GLB sources/attributions

- Animations: LottieFiles
 (attribution per asset).

- Libraries: Three.js, GSAP, Vite, Django, OpenRouter.

---

## Contact

Brejesh Balakrishnan. If you have any questions or feedback, feel free to reach out via my [LinkedIn Profile](https://www.linkedin.com/in/brejesh-balakrishnan-7855051b9/).

If you build something cool with this stack, ping me — I’d love to feature it!
