FROM node:22
WORKDIR /app/backend
COPY . .
RUN npm install
# RUN npm run seed
CMD ["npm", "run", "dev", "--host"]