FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./

RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm i; fi

FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache wget

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD wget -qO- http://localhost:4000/health/live || exit 1

EXPOSE 4000

CMD sh -c "npx prisma migrate deploy && node dist/server.js"
