FROM mysql:8.0
ENV MYSQL_DATABASE=bowy \
    MYSQL_USER=bowy \
    MYSQL_PASSWORD=secret \
    MYSQL_ROOT_PASSWORD=rootpassword
# Initialize database with SQL script
COPY init.sql /docker-entrypoint-initdb.d/
EXPOSE 3306