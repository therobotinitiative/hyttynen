FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY index.js .
COPY devices.list .
COPY ws/ ws/
EXPOSE 5000
EXPOSE 8088
CMD ["node", "index.js"]
