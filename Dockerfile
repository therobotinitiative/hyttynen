FROM node:20-alpine AS frontend-build
WORKDIR /build
COPY frontend/package.json .
RUN npm install
COPY frontend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY server/package.json .
RUN npm install
COPY server/server.js .
COPY --from=frontend-build /build/dist/ ./public/hyttynen/
EXPOSE 80
CMD ["node", "server.js"]
