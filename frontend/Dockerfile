FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm install
EXPOSE 5173
COPY ./*.html .
COPY ./vite.config.js .
COPY src/ src/
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0||tail -f /dev/null"]