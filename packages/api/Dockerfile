FROM node:24.18-alpine

WORKDIR /server
COPY package.json package-lock.json ./
COPY packages/api/package.json packages/api/package.json
RUN npm ci --omit=dev --workspace=api

WORKDIR /server/packages/api
COPY packages/api/src ./src/

EXPOSE 3001

ENTRYPOINT ["node", "src/server.mjs"]
