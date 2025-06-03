FROM node:22
WORKDIR /app/frontend
COPY . .
RUN npm install
CMD ["npm", "start", "--", "--host", "frontend"]