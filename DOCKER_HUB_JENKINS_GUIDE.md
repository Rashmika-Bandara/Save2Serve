# Docker Hub & Jenkins CI/CD Setup Guide

## Part 1: Docker Hub Setup

### Step 1: Create Docker Hub Account

1. Go to https://hub.docker.com/signup
2. Fill in the form:
   - **Docker ID**: Choose a username (e.g., `rashmikabandara`)
   - **Email**: Your email address
   - **Password**: Create a strong password
3. Click **Sign Up**
4. Verify your email address

### Step 2: Create Repositories on Docker Hub

After logging in:

1. Click **Create Repository** button
2. Create **3 repositories**:

   **Repository 1: Frontend**
   - Name: `save2serve-frontend`
   - Visibility: Public (or Private if you prefer)
   - Click **Create**

   **Repository 2: Backend**
   - Name: `save2serve-backend`
   - Visibility: Public (or Private)
   - Click **Create**

   **Repository 3: Database**
   - Name: `save2serve-database`
   - Visibility: Public (or Private)
   - Click **Create**

### Step 3: Login to Docker Hub from Command Line

Open your **WSL terminal**:

```bash
sudo docker login
```

Enter:
- **Username**: Your Docker Hub username
- **Password**: Your Docker Hub password

You should see: `Login Succeeded`

### Step 4: Tag Your Images

Replace `YOUR_DOCKERHUB_USERNAME` with your actual Docker Hub username:

```bash
cd /mnt/c/Users/User/Desktop/Save2Serve

# Tag frontend image
sudo docker tag save2serve_frontend:latest YOUR_DOCKERHUB_USERNAME/save2serve-frontend:latest

# Tag backend image
sudo docker tag save2serve_backend:latest YOUR_DOCKERHUB_USERNAME/save2serve-backend:latest

# Tag database image
sudo docker tag save2serve_database:latest YOUR_DOCKERHUB_USERNAME/save2serve-database:latest
```

### Step 5: Push Images to Docker Hub

```bash
# Push frontend
sudo docker push YOUR_DOCKERHUB_USERNAME/save2serve-frontend:latest

# Push backend
sudo docker push YOUR_DOCKERHUB_USERNAME/save2serve-backend:latest

# Push database
sudo docker push YOUR_DOCKERHUB_USERNAME/save2serve-database:latest
```

This will take several minutes. You'll see upload progress for each image.

### Step 6: Verify on Docker Hub

1. Go to https://hub.docker.com/
2. Click on **Repositories**
3. You should see your 3 repositories with images

---

## Part 2: Jenkins Setup

### Step 1: Install Jenkins

#### Option A: Install Jenkins on Windows

1. **Download Jenkins**:
   - Go to https://www.jenkins.io/download/
   - Download **Windows** installer (.msi file)
   - Run the installer

2. **Installation Steps**:
   - Choose installation directory (default: `C:\Program Files\Jenkins`)
   - Select **Run service as Local System**
   - Port: **8080** (default)
   - Click **Install**

3. **Start Jenkins**:
   - Open browser: http://localhost:8080
   - Copy the initial admin password from:
     ```
     C:\Program Files\Jenkins\secrets\initialAdminPassword
     ```
   - Paste it in the browser

4. **Setup Wizard**:
   - Click **Install suggested plugins**
   - Wait for plugins to install
   - Create **First Admin User**:
     - Username: admin
     - Password: (your choice)
     - Full name: Your name
     - Email: your email
   - Click **Save and Continue**
   - Jenkins URL: http://localhost:8080
   - Click **Save and Finish**
   - Click **Start using Jenkins**

#### Option B: Install Jenkins using Docker (Recommended)

In **WSL terminal**:

```bash
# Create a network for Jenkins
sudo docker network create jenkins

# Run Jenkins container
sudo docker run -d \
  --name jenkins \
  --restart=on-failure \
  --network jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Get initial admin password
sudo docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Open browser: http://localhost:8080 and paste the password.

### Step 2: Install Required Jenkins Plugins

1. In Jenkins, go to **Manage Jenkins** → **Manage Plugins**
2. Click **Available** tab
3. Search and install these plugins:
   - ✅ **Docker Pipeline**
   - ✅ **Docker**
   - ✅ **Git**
   - ✅ **GitHub**
   - ✅ **Pipeline**
   - ✅ **Blue Ocean** (optional, for better UI)
4. Click **Install without restart**

### Step 3: Configure Docker Hub Credentials in Jenkins

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click **(global)** domain
3. Click **Add Credentials**
4. Fill in:
   - **Kind**: Username with password
   - **Scope**: Global
   - **Username**: Your Docker Hub username
   - **Password**: Your Docker Hub password
   - **ID**: `dockerhub-credentials`
   - **Description**: Docker Hub Credentials
5. Click **Create**

### Step 4: Configure GitHub Credentials (if needed)

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click **Add Credentials**
3. Fill in:
   - **Kind**: Username with password (or Secret text for token)
   - **Username**: Your GitHub username
   - **Password**: Your GitHub Personal Access Token
   - **ID**: `github-credentials`
4. Click **Create**

---

## Part 3: Create Jenkins Pipelines

### Step 1: Create Jenkins Pipeline Jobs

#### Pipeline 1: Build and Push All Images

1. From Jenkins Dashboard, click **New Item**
2. Enter name: `Save2Serve-Build-All`
3. Select **Pipeline**
4. Click **OK**
5. Scroll to **Pipeline** section
6. Select **Pipeline script** (I'll provide the script below)
7. Click **Save**

#### Pipeline 2: Build Frontend Only

1. Click **New Item**
2. Name: `Save2Serve-Frontend`
3. Select **Pipeline** → **OK**

#### Pipeline 3: Build Backend Only

1. Click **New Item**
2. Name: `Save2Serve-Backend`
3. Select **Pipeline** → **OK**

#### Pipeline 4: Build Database Only

1. Click **New Item**
2. Name: `Save2Serve-Database`
3. Select **Pipeline** → **OK**

---

## Part 4: Jenkins Pipeline Scripts

I'll create Jenkinsfile for each service.

### Complete CI/CD Pipeline (Build All Services)

Save this as `Jenkinsfile` in your project root:

```groovy
pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'YOUR_DOCKERHUB_USERNAME'
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/save2serve-frontend"
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/save2serve-backend"
        DATABASE_IMAGE = "${DOCKERHUB_USERNAME}/save2serve-database"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/Rashmika-Bandara/Save2Serve.git'
            }
        }
        
        stage('Build Images') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} -t ${FRONTEND_IMAGE}:latest .'
                        }
                    }
                }
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            sh 'docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} -t ${BACKEND_IMAGE}:latest .'
                        }
                    }
                }
                stage('Build Database') {
                    steps {
                        dir('database') {
                            sh 'docker build -t ${DATABASE_IMAGE}:${BUILD_NUMBER} -t ${DATABASE_IMAGE}:latest .'
                        }
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                // Add your test commands here
            }
        }
        
        stage('Login to Docker Hub') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }
        
        stage('Push Images') {
            parallel {
                stage('Push Frontend') {
                    steps {
                        sh 'docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}'
                        sh 'docker push ${FRONTEND_IMAGE}:latest'
                    }
                }
                stage('Push Backend') {
                    steps {
                        sh 'docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}'
                        sh 'docker push ${BACKEND_IMAGE}:latest'
                    }
                }
                stage('Push Database') {
                    steps {
                        sh 'docker push ${DATABASE_IMAGE}:${BUILD_NUMBER}'
                        sh 'docker push ${DATABASE_IMAGE}:latest'
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                sh 'docker-compose down'
                sh 'docker-compose up -d'
            }
        }
    }
    
    post {
        always {
            sh 'docker logout'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
```

### Frontend Pipeline (Jenkinsfile.frontend)

```groovy
pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'YOUR_DOCKERHUB_USERNAME'
        IMAGE_NAME = "${DOCKERHUB_USERNAME}/save2serve-frontend"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/Rashmika-Bandara/Save2Serve.git'
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest .'
                }
            }
        }
        
        stage('Test Frontend') {
            steps {
                echo 'Running frontend tests...'
                // Add test commands
            }
        }
        
        stage('Login to Docker Hub') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                sh 'docker push ${IMAGE_NAME}:${BUILD_NUMBER}'
                sh 'docker push ${IMAGE_NAME}:latest'
            }
        }
    }
    
    post {
        always {
            sh 'docker logout'
        }
    }
}
```

### Backend Pipeline (Jenkinsfile.backend)

```groovy
pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'YOUR_DOCKERHUB_USERNAME'
        IMAGE_NAME = "${DOCKERHUB_USERNAME}/save2serve-backend"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/Rashmika-Bandara/Save2Serve.git'
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest .'
                }
            }
        }
        
        stage('Test Backend') {
            steps {
                echo 'Running backend tests...'
                // Add test commands
            }
        }
        
        stage('Login to Docker Hub') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                sh 'docker push ${IMAGE_NAME}:${BUILD_NUMBER}'
                sh 'docker push ${IMAGE_NAME}:latest'
            }
        }
    }
    
    post {
        always {
            sh 'docker logout'
        }
    }
}
```

### Database Pipeline (Jenkinsfile.database)

```groovy
pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'YOUR_DOCKERHUB_USERNAME'
        IMAGE_NAME = "${DOCKERHUB_USERNAME}/save2serve-database"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/Rashmika-Bandara/Save2Serve.git'
            }
        }
        
        stage('Build Database') {
            steps {
                dir('database') {
                    sh 'docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} -t ${IMAGE_NAME}:latest .'
                }
            }
        }
        
        stage('Login to Docker Hub') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                sh 'docker push ${IMAGE_NAME}:${BUILD_NUMBER}'
                sh 'docker push ${IMAGE_NAME}:latest'
            }
        }
    }
    
    post {
        always {
            sh 'docker logout'
        }
    }
}
```

---

## Part 5: Configure Pipeline Jobs

### For "Save2Serve-Build-All" Pipeline:

1. Open the job
2. Click **Configure**
3. In **Pipeline** section:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: https://github.com/Rashmika-Bandara/Save2Serve.git
   - **Credentials**: Select your GitHub credentials
   - **Branch**: main
   - **Script Path**: Jenkinsfile
4. Click **Save**

### For Frontend Pipeline:

1. Same as above but **Script Path**: `Jenkinsfile.frontend`

### For Backend Pipeline:

1. Same as above but **Script Path**: `Jenkinsfile.backend`

### For Database Pipeline:

1. Same as above but **Script Path**: `Jenkinsfile.database`

---

## Part 6: Run Your Pipelines

### Manual Trigger:

1. Go to Jenkins Dashboard
2. Click on your pipeline (e.g., `Save2Serve-Build-All`)
3. Click **Build Now**
4. Watch the build progress in **Build History**
5. Click on the build number to see console output

### Automatic Trigger (GitHub Webhook):

1. In Jenkins job, click **Configure**
2. Under **Build Triggers**, check:
   - ✅ **GitHub hook trigger for GITScm polling**
3. Click **Save**

4. In GitHub repository:
   - Go to **Settings** → **Webhooks**
   - Click **Add webhook**
   - Payload URL: `http://YOUR_JENKINS_URL:8080/github-webhook/`
   - Content type: `application/json`
   - Click **Add webhook**

Now every push to GitHub will trigger the build!

---

## Summary Checklist

✅ **Docker Hub**:
- [ ] Created Docker Hub account
- [ ] Created 3 repositories
- [ ] Tagged local images
- [ ] Pushed images to Docker Hub

✅ **Jenkins**:
- [ ] Installed Jenkins
- [ ] Installed required plugins
- [ ] Configured Docker Hub credentials
- [ ] Configured GitHub credentials
- [ ] Created 4 pipeline jobs
- [ ] Added Jenkinsfiles to repository
- [ ] Tested manual builds
- [ ] Setup GitHub webhooks (optional)

---

## Quick Commands Reference

```bash
# Docker Hub Login
sudo docker login

# Tag Images
sudo docker tag save2serve_frontend:latest USERNAME/save2serve-frontend:latest
sudo docker tag save2serve_backend:latest USERNAME/save2serve-backend:latest
sudo docker tag save2serve_database:latest USERNAME/save2serve-database:latest

# Push Images
sudo docker push USERNAME/save2serve-frontend:latest
sudo docker push USERNAME/save2serve-backend:latest
sudo docker push USERNAME/save2serve-database:latest

# Pull Images (on any machine)
docker pull USERNAME/save2serve-frontend:latest
docker pull USERNAME/save2serve-backend:latest
docker pull USERNAME/save2serve-database:latest
```

---

**Need Help?** Let me know at which step you need assistance! 🚀
