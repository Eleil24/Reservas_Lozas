FROM node:18-alpine

RUN apk add --no-cache netcat-openbsd

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Copy migrations to dist folder
COPY src/infrastructure/database/migrations dist/src/infrastructure/database/migrations

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

CMD ["/app/entrypoint.sh"]