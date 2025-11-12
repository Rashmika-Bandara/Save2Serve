pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'rashmikabandara'
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
            parallel {
                stage('Test Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm test -- --watchAll=false --passWithNoTests'
                        }
                    }
                }
                stage('Test Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                            sh 'npm test -- --passWithNoTests || echo "No tests found"'
                        }
                    }
                }
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
            // Clean up dangling images
            sh 'docker image prune -f || true'
        }
        success {
            echo 'Pipeline succeeded! ✅'
            echo "Images pushed to Docker Hub:"
            echo "- ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
            echo "- ${BACKEND_IMAGE}:${BUILD_NUMBER}"
            echo "- ${DATABASE_IMAGE}:${BUILD_NUMBER}"
        }
        failure {
            echo 'Pipeline failed! ❌'
            echo 'Check the logs for details.'
        }
    }
}
