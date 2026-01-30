#!/bin/bash
# Save2Serve EC2 User Data Script
# This script runs automatically when EC2 instance launches
# It installs Docker, Docker Compose, and deploys the application

set -e

# Update system packages
echo "🔄 Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install required dependencies
echo "📦 Installing dependencies..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    unzip

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start and enable Docker service
systemctl start docker
systemctl enable docker

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Install Docker Compose V2
echo "🔧 Installing Docker Compose..."
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
     -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/ubuntu/save2serve
cd /home/ubuntu/save2serve

# Create docker-compose.yml for Save2Serve
echo "📝 Creating docker-compose.yml..."
cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  # MongoDB Database
  mongo:
    image: ${dockerhub_username}/save2serve-database:latest
    container_name: save2serve-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=Save2Serve
    networks:
      - save2serve-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    image: ${dockerhub_username}/save2serve-backend:latest
    container_name: save2serve-backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/Save2Serve
      - PORT=4000
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - save2serve-network
    volumes:
      - backend_uploads:/usr/src/app/uploads
    restart: unless-stopped

  # Frontend React App
  frontend:
    image: ${dockerhub_username}/save2serve-frontend:latest
    container_name: save2serve-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - save2serve-network
    restart: unless-stopped

networks:
  save2serve-network:
    driver: bridge

volumes:
  mongo_data:
    driver: local
  backend_uploads:
    driver: local
EOF

# Set ownership
chown -R ubuntu:ubuntu /home/ubuntu/save2serve

# Pull Docker images and start containers
echo "🚀 Pulling Docker images from Docker Hub..."
docker compose pull

echo "🎬 Starting Save2Serve application..."
docker compose up -d

# Wait for containers to be healthy
echo "⏳ Waiting for containers to start..."
sleep 30

# Check container status
echo "✅ Container status:"
docker compose ps

# Create a startup script for easy management
cat > /home/ubuntu/save2serve/manage.sh <<'MANAGE'
#!/bin/bash
# Save2Serve Management Script

case "$1" in
  start)
    echo "Starting Save2Serve..."
    docker compose up -d
    ;;
  stop)
    echo "Stopping Save2Serve..."
    docker compose down
    ;;
  restart)
    echo "Restarting Save2Serve..."
    docker compose restart
    ;;
  status)
    echo "Save2Serve Status:"
    docker compose ps
    ;;
  logs)
    docker compose logs -f
    ;;
  update)
    echo "Updating Save2Serve images..."
    docker compose pull
    docker compose up -d
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs|update}"
    exit 1
    ;;
esac
MANAGE

chmod +x /home/ubuntu/save2serve/manage.sh
chown ubuntu:ubuntu /home/ubuntu/save2serve/manage.sh

echo "✅ Save2Serve deployment complete!"
echo "📍 Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo "📍 Backend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):4000"
