# syntax=docker/dockerfile:1

FROM node:20
WORKDIR /dapp/src/Dockerfile
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]