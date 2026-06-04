# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/tsconfig.json backend/tsconfig.build.json ./
COPY backend/src ./src

RUN ./node_modules/.bin/tsc -p tsconfig.build.json
RUN cp -r src/data dist/data

# Production stage
FROM node:24-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY --from=builder /app/dist ./dist

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8081', () => process.exit(0)).on('error', () => process.exit(1))"

CMD ["node", "dist/server.js"]
