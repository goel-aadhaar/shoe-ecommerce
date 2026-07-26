# Deploying urban-sole to DigitalOcean

Single Droplet running the whole stack under Docker Compose, behind NGINX.

## Why a Droplet and not App Platform

App Platform is the usual first choice, but it does not fit this stack:

- **Shared model artifacts.** The Celery worker trains the recommendation model
  and the API loads it from a shared volume. App Platform components have no
  shared filesystem, so the API would never see the trained model and every
  recommendation would silently fall back to popularity ranking, forever, with
  no error.
- **Qdrant needs persistent storage.** Vectors must survive restarts.
- **Memory.** `sentence-transformers` pulls in torch; the AI service and the
  worker each hold a model in memory. Instance sizes that fit are priced above
  an equivalent Droplet.

Kubernetes (DOKS) works but is disproportionate for a single-node workload.

## Sizing

Measured, not estimated — the AI service is the only component anyone worries
about, and it is lighter than it looks:

| Stage | Resident |
| --- | --- |
| python baseline | 17 MB |
| + torch | 191 MB |
| + sentence-transformers | 395 MB |
| + MiniLM loaded | 418 MB |
| + after encoding a query | **463 MB** |

Whole-stack, steady state:

| Component | Approx. RAM |
| --- | --- |
| ai-service | ~500 MB |
| frontend (Next standalone) | ~150 MB |
| backend (Express) | ~120 MB |
| Qdrant (30 products) | ~150 MB |
| Redis + NGINX | ~50 MB |
| **Total without worker** | **~1.0 GB** |
| worker, if always-on | +500 MB |

**Default recommendation: `s-2vcpu-4gb` (~$24/mo)** — comfortable headroom,
worker always-on, room for the catalog to grow.

**On a tight budget (student credit): `s-1vcpu-2gb` (~$12/mo)** — see below.

MongoDB stays on Atlas — there is no reason to self-host it.

---

## Low-budget deployment (student credit)

The GitHub Student Pack DigitalOcean credit is **$200 over 12 months ≈ $16/mo**.
A `s-1vcpu-2gb` Droplet at **$12/mo = $144/year** fits with ~$56 to spare.

Two changes make the stack comfortable in 2 GB:

**1. Don't run the Celery worker always-on.** It idles at ~500 MB just waiting
for a nightly job. The `worker` service is behind a compose profile, so it stays
off by default. Run the same jobs from cron instead — a one-shot container that
exits:

```bash
crontab -e
```

```cron
# Nightly AI maintenance (03:00–04:10 UTC). Each container exits when done.
0  3 * * *  cd /opt/urban-sole && docker compose -f docker-compose.prod.yml --env-file .env.production run --rm ai-service python -m scripts.index_catalog    >> /var/log/urban-sole-ai.log 2>&1
30 3 * * *  cd /opt/urban-sole && docker compose -f docker-compose.prod.yml --env-file .env.production run --rm ai-service python -m scripts.ingest_knowledge >> /var/log/urban-sole-ai.log 2>&1
0  4 * * *  cd /opt/urban-sole && docker compose -f docker-compose.prod.yml --env-file .env.production run --rm ai-service python -m scripts.train_models     >> /var/log/urban-sole-ai.log 2>&1
```

This writes to the same `ai_artifacts` volume the API reads, so the trained model
still reaches the running service.

**2. Add swap and build carefully.** `next build` is the memory peak, and 1 vCPU
makes it slow:

```bash
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Better still, **build the images somewhere else and pull them**, so the Droplet
never runs a build at all:

```bash
# On your laptop or in CI, pushing to DigitalOcean Container Registry
doctl registry login
docker compose -f docker-compose.prod.yml --env-file .env.production build
docker compose -f docker-compose.prod.yml push

# On the Droplet
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

DOCR's free "Starter" tier allows one repository; the $5/mo "Basic" tier is
enough for all three images and still leaves the year within budget.

### Keeping inside the credit

- **Set a billing alert** at $150 (Billing → Alerts). Credit does not stop usage
  when it runs out — it bills your card.
- **Skip Droplet backups** ($1.20/mo here) if the $56 buffer matters. Qdrant and
  the artifacts volume are both rebuildable from Mongo with the step-7 commands,
  so the only irreplaceable data is in Atlas, which has its own backups.
- **One Droplet, no load balancer.** A DO Load Balancer is $12/mo and would
  double your spend for no benefit at this scale.
- **Watch the free-tier bandwidth** (2 TB on this Droplet) — product images are
  served from Cloudinary/superkicks, not your box, so this is unlikely to bind.

### If 2 GB proves tight

Symptoms are the OOM killer terminating `ai-service` under load. In order of
preference: drop the always-on worker (above), then set
`EMBEDDINGS_PROVIDER=hash` temporarily (removes torch entirely, ~400 MB saved,
but semantic search quality degrades badly — this is a stopgap, not a setting to
run on), then resize to `s-2vcpu-4gb`. Resizing RAM/CPU on DO is reversible;
resizing disk is not.

---

## 1. Create the Droplet

- Ubuntu 24.04 LTS, `s-4vcpu-8gb`, region nearest your users (Bangalore for India).
- Add your SSH key. Enable backups if this is real.
- Point your domain's `A` record at the Droplet IP (and `www` if you use it).

## 2. Prepare the server

```bash
ssh root@YOUR_DROPLET_IP

# Docker
curl -fsSL https://get.docker.com | sh

# Firewall — only SSH and web. Nothing else is exposed anyway, but defence in depth.
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable

# Swap (cheap insurance during nightly model training)
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 3. Allowlist the Droplet in MongoDB Atlas

**Atlas → Network Access → Add IP Address → the Droplet's public IP.**

Skipping this is the most common cause of a deploy that builds fine and then
hangs on every request. Do not use `0.0.0.0/0`.

## 4. Get the code and configure

```bash
git clone YOUR_REPO_URL /opt/urban-sole && cd /opt/urban-sole

cp .env.production.example .env.production
nano .env.production        # fill in every value

# Strong secrets:
openssl rand -base64 48     # ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET
openssl rand -base64 36     # SERVICE_TOKEN
```

Set `PUBLIC_ORIGIN=https://yourdomain.com` (no trailing slash), then put your
domain into `nginx/nginx.conf` — replace every `example.com`.

## 5. TLS certificate

```bash
mkdir -p nginx/certbot/conf nginx/certbot/www

# Temporarily serve HTTP only so certbot can complete the challenge.
docker run --rm -p 80:80 \
  -v $PWD/nginx/certbot/conf:/etc/letsencrypt \
  -v $PWD/nginx/certbot/www:/var/www/certbot \
  certbot/certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com \
  --email you@example.com --agree-tos --no-eff-email
```

## 6. Launch

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml ps
```

The first build is slow (torch, and the embedding model is baked into the image
so it never downloads during a request).

## 7. One-time data setup

```bash
cd /opt/urban-sole
run() { docker compose -f docker-compose.prod.yml exec ai-service python -m "$@"; }

run scripts.index_catalog        # embed the catalog into Qdrant
run scripts.ingest_knowledge     # build the RAG knowledge base
run scripts.train_models         # train CF + association rules
```

Only if you want synthetic behavioural data in production:

```bash
run scripts.seed_interactions --users 600
run scripts.train_models
# Undo with: run scripts.seed_interactions --reset-only
```

## 8. Verify

```bash
curl -I https://yourdomain.com                                  # 200
curl -s https://yourdomain.com/api/v1/products | head -c 200    # catalog
curl -s https://yourdomain.com/api/v1/ai/home | head -c 200     # AI rails

# The AI service must NOT be reachable from outside:
curl -m 5 http://YOUR_DROPLET_IP:8000/health   # must fail/refuse
```

Internal health check:

```bash
docker compose -f docker-compose.prod.yml exec ai-service curl -s localhost:8000/ready
# {"ready":true,"dependencies":{"mongo":true,"redis":true,"qdrant":true}}
```

## 9. Stripe webhook

Stripe Dashboard → Developers → Webhooks → add endpoint:

```
https://yourdomain.com/api/v1/payments/webhook
```

Copy the signing secret into `STRIPE_WEBHOOK_SECRET`, then
`docker compose -f docker-compose.prod.yml up -d backend`.

---

## Operations

**Deploy an update**

```bash
cd /opt/urban-sole && git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker image prune -f
```

**Certificate renewal** (Let's Encrypt expires every 90 days) — `crontab -e`:

```
0 3 * * 1 cd /opt/urban-sole && docker run --rm -v $PWD/nginx/certbot/conf:/etc/letsencrypt -v $PWD/nginx/certbot/www:/var/www/certbot certbot/certbot renew --webroot -w /var/www/certbot && docker compose -f docker-compose.prod.yml restart nginx
```

**Logs**

```bash
docker compose -f docker-compose.prod.yml logs -f ai-service
docker compose -f docker-compose.prod.yml logs -f worker
```

**Backups.** Enable Droplet backups for the volumes (`qdrant_data`, `ai_artifacts`);
Atlas handles database backups. Both Qdrant and the artifacts are rebuildable
from Mongo with the step-7 commands, so they are recoverable rather than critical.

---

## Gotchas specific to this project

1. **`NEXT_PUBLIC_API_URL` is baked at build time.** Changing the domain requires
   `--build`; a restart alone leaves the old URL inside the client bundle.
2. **The AI service must never be published.** `docker-compose.prod.yml`
   deliberately gives it `expose:` and not `ports:`. If you add a port mapping,
   anyone can reach it with only the service token in the way.
3. **`SERVICE_TOKEN` must match on both sides.** The compose file feeds one
   variable to both services, so keep it that way. In production the AI service
   refuses to start if it is still the placeholder.
4. **Atlas IP allowlist** — see step 3.
5. **Nightly jobs** run at 03:00/03:30/04:00 UTC (catalog re-index, knowledge
   re-ingest, model retrain). Adjust in `app/workers/celery_app.py` if that
   collides with your traffic peak.
6. **Rotate credentials before going live** if any were ever pasted into a chat,
   commit, or screenshot — the Atlas password and the LLM gateway key especially.
