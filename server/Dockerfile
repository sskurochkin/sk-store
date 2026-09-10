# SK Store API — production multi-stage image
FROM node:20.18-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build
# Compiled seed for `node dist/prisma/seed.js` in production containers
RUN npx tsc prisma/seed.ts \
    --outDir dist/prisma \
    --rootDir prisma \
    --module commonjs \
    --target ES2023 \
    --esModuleInterop \
    --skipLibCheck

FROM node:20.18-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system --gid 1001 nestjs && \
    useradd --system --uid 1001 --gid nestjs nestjs

COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Production runtime deps + Prisma CLI for `docker compose run ... migrate deploy`
RUN npm ci --omit=dev && \
    npm install prisma@6.19.3 --no-save && \
    npx prisma generate && \
    npm cache clean --force

COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist

USER nestjs

EXPOSE 3001

CMD ["node", "dist/src/main"]
