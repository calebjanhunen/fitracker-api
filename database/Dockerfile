FROM node:18-alpine
WORKDIR /usr/src/app
RUN npm install db-migrate db-migrate-pg
COPY ./migrations ./migrations
COPY ./database.js ./database.js
CMD ["npx", "db-migrate", "up", "--config", "./database.js", "--migrations-dir", "./migrations"]