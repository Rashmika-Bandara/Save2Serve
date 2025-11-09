FROM node:18

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose backend port
EXPOSE 4000

# Set environment variable for MongoDB connection
# This will be overridden by docker-compose.yaml
ENV MONGO_URI=mongodb://mongo:27017/Save2Serve

# Start the application
CMD ["node", "app.js"]