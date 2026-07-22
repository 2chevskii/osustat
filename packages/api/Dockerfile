FROM node:24.18-alpine

WORKDIR /server
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

EXPOSE 3001

ENTRYPOINT ["node", "src/server.mjs"]
