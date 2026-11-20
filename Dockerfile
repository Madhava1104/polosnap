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

# Pull the latest Alpine security patches
RUN apk upgrade --no-cache

# Production dependencies only (express etc.), then remove npm/yarn/corepack:
# the app runs with plain "node", and their bundled dependencies are where
# most of the scanner's High findings in the Node base image come from.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
 && npm cache clean --force \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
           /usr/local/bin/yarn /usr/local/bin/yarnpkg /opt/yarn-* /root/.npm

COPY --from=build /app/dist ./dist
COPY server.js ./

# Upload folder, writable by the non-root "node" user.
# Mount a volume here so uploads survive container updates.
RUN mkdir -p public/uploads && chown -R node:node public/uploads
USER node

EXPOSE 9201
CMD ["node", "server.js"]
