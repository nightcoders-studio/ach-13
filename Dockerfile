# Stage 1: Build frontend
FROM node:22-slim AS frontend-build

WORKDIR /app

# Firebase config build args (needed at build time for Vite)
ARG VITE_FIREBASE_API_KEY=AIzaSyAIEP_66H8edlIAiMuLV--Lgt6GIeefe0c
ARG VITE_FIREBASE_AUTH_DOMAIN=probable-force-311023.firebaseapp.com
ARG VITE_FIREBASE_PROJECT_ID=probable-force-311023
ARG VITE_API_BASE_URL=

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy root package files for workspace setup
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install all dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./frontend/

# Build frontend
RUN npm run build --prefix frontend

# Stage 2: Production backend
FROM node:22-slim AS production

WORKDIR /app

# Copy backend package files
COPY backend/package.json ./

# Install only production dependencies for backend
RUN npm install --omit=dev

# Copy backend source
COPY backend/ ./

# Copy built frontend static files
COPY --from=frontend-build /app/frontend/dist ./public

# Cloud Run uses PORT env variable
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server.js"]
