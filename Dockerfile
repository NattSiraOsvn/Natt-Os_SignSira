FROM nginx:alpine

# Copy toàn bộ src/ui-app vào nginx
COPY src/ui-app/ /usr/share/nginx/html/

# nginx config — serve static files, SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
