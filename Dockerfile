FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend

ARG VITE_API_URL
ARG VITE_ORG_NAME
ARG VITE_DEMO_MODE

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ORG_NAME=$VITE_ORG_NAME
ENV VITE_DEMO_MODE=$VITE_DEMO_MODE

COPY frontend/package.json ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY backend/package.json ./backend/package.json
RUN npm install --prefix backend
COPY backend ./backend
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

ENV STATIC_DIR=/app/frontend/dist
ENV PORT=3001

EXPOSE 3001
WORKDIR /app/backend
CMD ["npm", "run", "start"]
