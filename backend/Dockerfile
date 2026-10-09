FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY uploads ./uploads

EXPOSE 8080

CMD ["sh", "-c", "PORT=${PORT:-8080} node src/app.js"]
