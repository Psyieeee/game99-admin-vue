FROM node:lts-alpine as build-stage
WORKDIR /opt/game99_admin_vue
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:stage