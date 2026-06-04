# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_WS_URL=http://127.0.0.1:8081/v1/chat

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/next.config.js frontend/tsconfig.json frontend/postcss.config.js frontend/tailwind.config.ts ./
COPY frontend/public ./public
COPY frontend/src ./src

ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
