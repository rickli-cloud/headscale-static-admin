FROM nginx:latest

LABEL maintainer=github/rickli-cloud

COPY ./build /usr/share/nginx/html/admin
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
