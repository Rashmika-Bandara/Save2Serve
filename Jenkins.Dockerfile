# Jenkins Dockerfile for Save2Serve Project
FROM jenkins/jenkins:lts

# Switch to root user to install dependencies
USER root

# Install Docker CLI
RUN apt-get update && \
    apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Note: Docker Compose is not included in this image
# It should be installed on the host system where Jenkins runs

# Create docker group and add jenkins user to it
RUN groupadd -f docker && usermod -aG docker jenkins

# Switch back to jenkins user
USER jenkins

# Install Jenkins plugins
RUN jenkins-plugin-cli --plugins \
    git \
    docker-workflow \
    docker-plugin \
    pipeline-stage-view \
    credentials \
    credentials-binding \
    github \
    github-branch-source

# Set working directory
WORKDIR /var/jenkins_home

# Expose Jenkins port
EXPOSE 8080 50000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8080/login || exit 1
