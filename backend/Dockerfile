# syntax=docker/dockerfile:1
# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# Drop dev dependencies for the runtime layer.
RUN npm prune --omit=dev

# ---- runtime ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

USER app
EXPOSE 5000

# The container listens on 5000; NGINX is the only thing that talks to it.
CMD ["node", "dist/index.js"]
