# syntax=docker/dockerfile:1
# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# CRITICAL: NEXT_PUBLIC_* values are inlined into the client bundle at BUILD
# time, not read at runtime. Setting this only in docker-compose `environment`
# would leave the browser calling localhost:5000 in production. It must be a
# build arg, and the image must be rebuilt if the domain changes.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runtime ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

# `output: 'standalone'` emits a self-contained server bundle with only the
# node_modules it actually needs — a fraction of the full install.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER app
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
