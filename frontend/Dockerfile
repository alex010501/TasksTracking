# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- runtime: nginx static + /api proxy ---
FROM nginx:1.27-alpine
# статика
COPY --from=build /app/dist /usr/share/nginx/html
# конфиг nginx
COPY nginx/conf.d/app.conf /etc/nginx/conf.d/default.conf