FROM node:24.18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/profile-cards/package.json packages/profile-cards/package.json
RUN npm ci --workspace=@osustat/profile-cards

COPY packages/profile-cards ./packages/profile-cards
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build --workspace=@osustat/profile-cards

FROM alpine:3.22 AS runtime

RUN apk add --no-cache lighttpd

WORKDIR /var/www/localhost/htdocs
COPY --from=build /app/packages/profile-cards/dist ./

RUN cat > /etc/lighttpd/lighttpd.conf <<'EOF'
server.modules = (
    "mod_access",
    "mod_alias",
    "mod_compress",
    "mod_redirect",
    "mod_rewrite"
)

server.document-root = "/var/www/localhost/htdocs"
server.port = 80
index-file.names = ("index.html")

url.rewrite-if-not-file = (".*" => "/index.html")

mimetype.assign = (
  ".html" => "text/html",
  ".css" => "text/css",
  ".js" => "application/javascript",
  ".json" => "application/json",
  ".png" => "image/png",
  ".jpg" => "image/jpeg",
  ".jpeg" => "image/jpeg",
  ".gif" => "image/gif",
  ".svg" => "image/svg+xml",
  ".ico" => "image/x-icon",
  ".txt" => "text/plain",
  "" => "text/plain"
)
EOF

EXPOSE 80

CMD ["lighttpd", "-D", "-f", "/etc/lighttpd/lighttpd.conf"]
