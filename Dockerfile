# ── Stage 1: Build ──
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ──
FROM nginx:1.27-alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run requires port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
