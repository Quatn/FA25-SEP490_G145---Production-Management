#!/bin/bash

mongoimport \
  --db "$MONGO_INITDB_DATABASE" \
  --collection roles \
  --file /docker-entrypoint-initdb.d/seeds/roles.json \
  --jsonArray

mongoimport \
  --db "$MONGO_INITDB_DATABASE" \
  --collection employees \
  --file /docker-entrypoint-initdb.d/seeds/employees.json \
  --jsonArray

mongoimport \
  --db "$MONGO_INITDB_DATABASE" \
  --collection users \
  --file /docker-entrypoint-initdb.d/seeds/users.json \
  --jsonArray
