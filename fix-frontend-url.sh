#!/bin/bash
# Fix API URL in running frontend container on EC2

# Replace localhost:4000 with EC2 IP in the main JavaScript file
docker exec save2serve-frontend sed -i 's|http://localhost:4000|http://44.209.80.166:4000|g' /usr/share/nginx/html/static/js/main.15815c76.js

echo "✅ API URL updated in frontend container"
echo "🔄 You may need to clear browser cache and refresh"
