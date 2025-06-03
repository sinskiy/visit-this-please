FROM node:22
WORKDIR /app/backend
COPY . .
RUN npm ci --only=production
CMD ["npm", "start", "--", "--host"]