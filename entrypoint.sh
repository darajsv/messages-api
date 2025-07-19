#!/bin/sh

npx ts-node ./node_modules/typeorm/cli.js  migration:run -d ./dist/config/typeorm/typeorm.config.js

node dist/main