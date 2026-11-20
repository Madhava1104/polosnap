# ---- Stage 1: build the Vite/React frontend ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: runtime (Express server + built files) ----
FROM node:24-alpine
ENV NODE_ENV=production \
    PORT=9201
WORKDIR /app

# Production dependencies only (express etc.)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY server.js ./

# Upload folder, writable by the non-root "node" user.
# Mount a volume here so uploads survive container updates.
RUN mkdir -p public/uploads && chown -R node:node public/uploads
USER node

EXPOSE 9201
CMD ["node", "server.js"]
