FROM node:20-alpine AS builder

WORKDIR /app/server

COPY server/package*.json ./
COPY server/prisma ./prisma

RUN npm ci

COPY server/ ./

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/prisma ./prisma
COPY server/package*.json ./

EXPOSE 4000

CMD ["node", "dist/server.js"]

