# Build stage
FROM node:20-alpine as builder

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/tsconfig.json ./
COPY backend/src ./src

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copiar .dockerignore
COPY .dockerignore.backend .dockerignore

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8001', (res) => { if (res.statusCode !== 404) throw new Error(res.statusCode) })"

CMD ["node", "dist/server.js"]
