# Build stage
FROM node:22-alpine as builder

WORKDIR /app

ARG NEXT_PUBLIC_WS_URL=ws://localhost:8001/v1/ws/chat

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/tsconfig.json frontend/postcss.config.js frontend/tailwind.config.ts ./
COPY frontend/public ./public
COPY frontend/src ./src

ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
RUN npm run build
RUN npm prune --omit=dev

# Production stage
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY frontend/package*.json ./
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["npm", "start"]
