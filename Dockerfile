# ---------- Stage 1: build Vite assets ----------
FROM node:20-alpine AS assets
WORKDIR /app

# Install deps
COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend

# Build
COPY frontend ./frontend
RUN npm run build --prefix frontend


# ---------- Stage 2: Django app image ----------
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Minimal build tools (gunicorn wheels + any future C deps)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY . .

# Copy built frontend artifacts from Stage 1
COPY --from=assets /app/frontend/dist ./frontend/dist

# Collect static (WhiteNoise will serve)
RUN python manage.py collectstatic --noinput

# Vercel provides $PORT
EXPOSE 8000
CMD ["sh","-c","gunicorn otaku_oracle.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 120"]