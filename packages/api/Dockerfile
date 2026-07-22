FROM node:24.18-alpine

WORKDIR /server
COPY package.json package-lock.json ./
RUN npm install --verbose

COPY src/ ./
COPY .env.local ./

EXPOSE 3000

ENTRYPOINT ["node", "server.mjs"]
