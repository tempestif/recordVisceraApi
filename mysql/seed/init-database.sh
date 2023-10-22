#!/bin/sh
filepath="docker-entrypoint-initdb.d/sql/*"
dirs=$(find $filepath -maxdepth 0 -type f -name *.sql)
for file in $dirs; do
    mysql -u root -ppassword record-viscera-api < $file
done
