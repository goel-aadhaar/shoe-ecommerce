# syntax=docker/dockerfile:1
FROM python:3.11-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/home/app/.cache/huggingface

# Build tools needed by lightfm / implicit / scikit-surprise
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --uid 1000 app
WORKDIR /app

# Install core deps first (better layer caching), then heavy ML deps
COPY requirements.txt requirements-ml.txt ./
RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    && pip install -r requirements-ml.txt

COPY app ./app
COPY scripts ./scripts

# Create the artifacts directory in the IMAGE, owned by the runtime user.
# A named volume mounted here inherits the image's ownership when it is first
# created; without this it is created root-owned and the unprivileged `app`
# user cannot write the trained model:
#   PermissionError: [Errno 13] Permission denied: '/artifacts/recmodel-*.pkl'
RUN mkdir -p /artifacts && chown -R app:app /artifacts /app
USER app

# Pre-download the embedding model into the image. Otherwise the first shopper
# to search triggers a ~90MB HuggingFace download inside the request.
ARG EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('${EMBEDDINGS_MODEL}')"

EXPOSE 8000

# Default: API server. The worker service overrides the command in docker-compose.
CMD ["gunicorn", "app.main:app", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--workers", "2", "--bind", "0.0.0.0:8000", \
     "--timeout", "120", "--graceful-timeout", "30"]
