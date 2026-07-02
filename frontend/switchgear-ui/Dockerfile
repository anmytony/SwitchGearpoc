FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

FROM nginx:alpine AS final
RUN apk add --no-cache bash
COPY --from=build /app/dist/switchgear-ui/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

# envsubst replaces ${BACKEND_URL} in nginx.conf at container startup
# Default to localhost for local docker-compose use
ENV BACKEND_URL=http://localhost:5195
EXPOSE 80
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
