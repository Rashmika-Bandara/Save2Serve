# Backend Node.js application
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create uploads directory for food images
RUN mkdir -p /usr/src/app/uploads

# Expose backend port
EXPOSE 4000

# Set environment variable for MongoDB connection
# This will be overridden by docker-compose.yaml
ENV MONGO_URI=mongodb://mongo:27017/Save2Serve
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "app.js"]
