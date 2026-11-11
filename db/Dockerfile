FROM mysql:latest

ENV MYSQL_ROOT_USER="root"
ENV MYSQL_ROOT_PASSWORD="root"

COPY init.sql /docker-entrypoint-initdb.d/init.sql

EXPOSE 3306
