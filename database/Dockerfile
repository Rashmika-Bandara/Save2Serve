# MongoDB Database Image
FROM mongo:6

# Set environment variables
ENV MONGO_INITDB_DATABASE=Save2Serve

# Expose MongoDB port
EXPOSE 27017

# Copy initialization scripts
COPY mongo-init/init-mongo.js /docker-entrypoint-initdb.d/

# Start MongoDB
CMD ["mongod"]
