FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend
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
CMD ["node", "backend/src/server.js"]
