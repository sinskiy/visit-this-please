FROM node:22 AS base
WORKDIR /app/frontend
COPY . .
RUN npm ci
RUN npm run build
