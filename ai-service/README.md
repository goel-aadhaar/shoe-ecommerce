# urban-sole AI service

The Python/FastAPI AI tier for the urban-sole shoe platform: recommendations,
semantic search, a conversational copilot, RAG, and analytics. It is an
**internal** service — the browser never calls it. The Express BFF authenticates
the user and proxies `/api/v1/ai/*` here with a shared service token.

> Architecture blueprint: see the Phase 0 design doc for the full HLD/LLD,
> data model, and rationale.

## Stack

| Concern        | Choice                                           |
| -------------- | ------------------------------------------------ |
| API            | FastAPI + Uvicorn/Gunicorn                       |
| Vectors        | Qdrant                                           |
| Cache / memory | Redis                                            |
| Jobs           | Celery (+ beat)                                  |
| Data           | MongoDB (read-only catalog/events, via Motor)    |
| LLM            | OpenAI-compatible gateway (MiniMax) — chat/tools |
| Embeddings     | SentenceTransformers (local; gateway has none)   |

## Layout (clean architecture)

```
app/
  main.py            FastAPI factory + lifespan (builds the DI container)
  core/              config · logging · exceptions · security · container (composition root)
  api/v1/            routers: health, search, recommend, chat, content, events, analytics
  schemas/           Pydantic request/response contracts
  services/          business logic (search, recommender, copilot, rag, content, analytics)
  llm/               gateway client · prompts/tools · reasoning-strip
  clients/           pluggable embedder (sbert | hash | gateway)
  repositories/      mongo · qdrant · redis · catalog
  workers/           celery app · tasks · catalog indexer
scripts/             index_catalog · seed_interactions
tests/               unit + API tests
```

Dependency direction: **routers → services → repositories/clients**. Everything
is wired once in `core/container.py` and pulled via `api/deps.py`.

## Run it

> **Port note:** the service listens on **8001** on this machine, because port
> 8000 is already taken by another project's container (`ttk-backend`). The
> Express BFF's `AI_SERVICE_URL` is set to `http://localhost:8001` to match. If
> you free up 8000, change both together.

### With Docker (recommended)

From the repo root:

```bash
cp ai-service/.env.example ai-service/.env      # then fill in LLM_GATEWAY_API_KEY + SERVICE_TOKEN
docker compose up -d qdrant redis mongo         # infra
docker compose up --build ai-service worker     # API + Celery
```

- Swagger UI: http://localhost:8001/docs
- Health: http://localhost:8001/health · Readiness: http://localhost:8001/ready

### Locally (without Docker)

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate                              # Windows (cmd/PowerShell)
# source .venv/bin/activate                         # macOS/Linux
pip install -r requirements.txt                     # core only
pip install -r requirements-ml.txt                  # + embeddings/ML (heavier)
copy .env.example .env
python -m uvicorn app.main:app --reload --port 8001
```

On Windows **cmd.exe** do not prefix commands with `./` — that is Git Bash /
PowerShell syntax and cmd rejects it. Once `.venv\Scripts\activate` has run
(your prompt shows `(.venv)`), plain `python` already points at the venv.

For a lightweight dev loop with no model download, set `EMBEDDINGS_PROVIDER=hash`.

## Data setup

```bash
# 1) Seed synthetic interactions (needs products already in Mongo)
python -m scripts.seed_interactions --users 80

# 2) Embed the catalog into Qdrant (powers semantic search — Phase 2)
python -m scripts.index_catalog
```

## Test

```bash
pytest            # hermetic: uses the hash embedder, no infra required
```

## Auth

Every `/v1/*` route requires the `X-Service-Token` header matching `SERVICE_TOKEN`.
`/health` and `/ready` are open for orchestrator probes.

## Endpoint surface

`POST /v1/semantic-search` · `POST /v1/similar-products` · `POST /v1/recommend` ·
`GET /v1/home/{userId}` · `POST /v1/rerank` · `POST /v1/chat` ·
`POST /v1/extract-filters` · `POST /v1/compare-products` ·
`POST /v1/summarize-reviews` · `POST /v1/bundles` · `POST /v1/ask` ·
`POST /v1/events` · `GET /v1/analytics/{metric}`

Endpoints whose feature ships in a later phase return `501` with the target
phase, so the contract is stable and Express can bind against it today.
