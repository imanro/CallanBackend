#!/bin/sh

PORT=3002 pm2 start server/server.js -i 2 --env production --merge-logs --log-date-format="YYYY-MM-DD HH:mm Z" --name "callan_backend_stg"
