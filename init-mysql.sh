#!/bin/sh
docker-compose exec mysql bash -c "chmod 0644 /etc/mysql/conf.d/my.cnf"
docker-compose exec mysql bash -c "chmod 0775 docker-entrypoint-initdb.d/init-database.sh"
docker-compose exec mysql bash -c "./docker-entrypoint-initdb.d/init-database.sh"