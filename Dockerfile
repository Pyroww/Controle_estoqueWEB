FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]