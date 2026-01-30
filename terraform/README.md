# Save2Serve AWS Deployment with Terraform

This directory contains Terraform configuration to deploy the Save2Serve application on AWS EC2 (Free Tier).

## 🏗️ Infrastructure Components

### What Terraform Creates:

1. **AWS Provider** (`provider.tf`)
   - Connects Terraform to your AWS account
   - Uses credentials from `~/.aws/credentials`

2. **EC2 Instance** (`main.tf`)
   - Type: `t2.micro` (Free Tier eligible)
   - OS: Ubuntu 22.04 LTS
   - Storage: 30GB (Free Tier limit)
   - Automatically installs Docker & Docker Compose

3. **Security Group** (`main.tf`)
   - Port 22: SSH access
   - Port 80: HTTP
   - Port 443: HTTPS (future)
   - Port 3000: React frontend
   - Port 4000: Node.js backend

4. **SSH Key Pair** (`main.tf`)
   - Auto-generated RSA 4096-bit key
   - Private key saved as `save2serve-key.pem`
   - Used for secure SSH access

5. **Elastic IP** (`main.tf`)
   - Fixed public IP address
   - Doesn't change on reboot
   - **Note**: Free Tier includes 1 Elastic IP (charged if not attached to running instance)

6. **User Data Script** (`user-data.sh`)
   - Runs on first boot
   - Installs Docker & Docker Compose
   - Pulls images from Docker Hub
   - Starts containers automatically

## 📋 Prerequisites

- AWS account with Free Tier
- AWS CLI configured (`aws configure`)
- Terraform installed (v1.0+)
- Docker images pushed to Docker Hub

## 🚀 Deployment Steps

### 1. Configure AWS Credentials (if not done)
```bash
aws configure
```

### 2. Navigate to Terraform Directory
```bash
cd terraform
```

### 3. Initialize Terraform
```bash
terraform init
```

### 4. Review Planned Changes
```bash
terraform plan
```

### 5. Apply Configuration (Deploy to AWS)
```bash
terraform apply
```
Type `yes` when prompted.

### 6. Wait for Deployment
- Terraform: ~2-3 minutes
- Docker image download: ~5-10 minutes
- Total: ~10-15 minutes

### 7. Access Your Application
After deployment completes, Terraform will output:
```
Frontend:  http://<ELASTIC_IP>:3000
Backend:   http://<ELASTIC_IP>:4000
```

## 🔍 Verify Deployment

### Check EC2 Instance Status
```bash
ssh -i save2serve-key.pem ubuntu@<ELASTIC_IP>
```

### Check Docker Containers
```bash
ssh -i save2serve-key.pem ubuntu@<ELASTIC_IP> "docker ps"
```

### View Application Logs
```bash
ssh -i save2serve-key.pem ubuntu@<ELASTIC_IP> "cd save2serve && docker compose logs"
```

## 🛠️ Management Commands

On EC2 instance, use the management script:

```bash
# Start application
./save2serve/manage.sh start

# Stop application
./save2serve/manage.sh stop

# Restart application
./save2serve/manage.sh restart

# Check status
./save2serve/manage.sh status

# View logs
./save2serve/manage.sh logs

# Update from Docker Hub
./save2serve/manage.sh update
```

## 💰 AWS Free Tier Limits

✅ **What's Free (12 months):**
- 750 hours/month of t2.micro EC2 (enough for 1 instance running 24/7)
- 30 GB EBS storage
- 1 Elastic IP (when attached to running instance)
- 15 GB data transfer out per month

⚠️ **What Costs Money:**
- Elastic IP when NOT attached to running instance ($0.005/hour)
- Data transfer > 15 GB/month
- Additional EBS storage > 30 GB
- Snapshots (we don't create any)

## 🧹 Cleanup (Destroy Resources)

To avoid charges, destroy all resources when done:

```bash
terraform destroy
```

Type `yes` to confirm. This removes:
- EC2 instance
- Elastic IP
- Security group
- SSH key pair

## 📊 Architecture Diagram

```
Internet
   |
   | (HTTP/HTTPS)
   |
   ▼
[Elastic IP: <PUBLIC_IP>]
   |
   ▼
[AWS Security Group]
   | Port 22  → SSH
   | Port 80  → HTTP
   | Port 3000 → Frontend
   | Port 4000 → Backend
   |
   ▼
[EC2 Instance: t2.micro, Ubuntu 22.04]
   |
   | Docker Compose
   |
   ├─[Frontend Container]──Port 3000 → Nginx (React)
   |
   ├─[Backend Container]───Port 4000 → Node.js/Express
   |
   └─[Database Container]──Port 27017 → MongoDB
      └─[Volume: mongo_data]
```

## 🔐 Security Best Practices

1. **Restrict SSH Access** (Optional)
   - Edit `variables.tf`
   - Change `allowed_ssh_cidr` from `["0.0.0.0/0"]` to your IP: `["<YOUR_IP>/32"]`

2. **SSH Key Protection**
   - Keep `save2serve-key.pem` secure
   - Never commit to Git
   - Already in `.gitignore`

3. **Environment Variables**
   - Sensitive data in `user-data.sh` only
   - Not exposed in outputs

## 🔗 Jenkins Integration (Future)

To integrate with Jenkins:

1. **Add Jenkins to Security Group**
   - Allow Jenkins IP to SSH (port 22)

2. **Store SSH Key in Jenkins**
   - Add `save2serve-key.pem` as Jenkins credential

3. **Jenkins Pipeline Stage**
```groovy
stage('Deploy to AWS') {
    steps {
        sshagent(['aws-ssh-key']) {
            sh '''
                ssh ubuntu@<ELASTIC_IP> "cd save2serve && ./manage.sh update"
            '''
        }
    }
}
```

## 🆘 Troubleshooting

### Issue: Can't SSH into EC2
```bash
chmod 400 save2serve-key.pem
ssh -i save2serve-key.pem ubuntu@<ELASTIC_IP>
```

### Issue: Application not accessible
```bash
# Check security group
terraform show | grep security_group

# Check containers
ssh -i save2serve-key.pem ubuntu@<ELASTIC_IP> "docker ps"
```

### Issue: Containers not running
```bash
# View logs
ssh -i save2serve-key.pem ubuntu@<ELASTIC_IP> "cd save2serve && docker compose logs"

# Restart
ssh -i save2serve-key.pem ubuntu@<ELASTIC_IP> "cd save2serve && ./manage.sh restart"
```

## 📁 File Structure

```
terraform/
├── provider.tf          # AWS provider configuration
├── variables.tf         # Input variables
├── main.tf             # Main infrastructure (EC2, SG, EIP)
├── outputs.tf          # Output values (IP, URLs, SSH command)
├── user-data.sh        # EC2 initialization script
├── save2serve-key.pem  # SSH private key (generated)
└── README.md           # This file
```

## 🎓 What Happens Behind the Scenes

### When you run `terraform apply`:

1. **Terraform contacts AWS API** using your credentials
2. **Creates Security Group** with firewall rules
3. **Generates SSH key pair** (RSA 4096-bit)
4. **Launches EC2 instance** (t2.micro, Ubuntu 22.04)
5. **Allocates Elastic IP** and attaches to EC2
6. **Runs user-data script** on first boot:
   - Updates system packages
   - Installs Docker & Docker Compose
   - Creates docker-compose.yml
   - Pulls images from Docker Hub (rashmikabandara/save2serve-*)
   - Starts containers
7. **Outputs connection details** (IP, URLs, SSH command)

### Network Flow:
```
User Browser → Elastic IP:3000 → EC2 → Frontend Container (Nginx)
User Browser → Elastic IP:4000 → EC2 → Backend Container (Node.js)
Backend Container → Database Container (MongoDB)
```

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ `terraform apply` completes without errors
- ✅ Can SSH into EC2: `ssh -i save2serve-key.pem ubuntu@<IP>`
- ✅ `docker ps` shows 3 running containers
- ✅ Frontend accessible: `http://<IP>:3000`
- ✅ Backend API responds: `http://<IP>:4000/health`

---

**Created by**: GitHub Copilot  
**Project**: Save2Serve DevOps Deployment  
**Date**: January 2026
