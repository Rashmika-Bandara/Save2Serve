#!/bin/bash
# Save2Serve AWS Deployment Script
# Run this in WSL to deploy your application to AWS

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      Save2Serve AWS Deployment with Terraform              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if AWS credentials are configured
echo "🔍 Checking AWS credentials..."
if ! aws sts get-caller-identity &>/dev/null; then
    echo "❌ AWS credentials not configured!"
    echo ""
    echo "Please run: aws configure"
    echo "Enter your AWS Access Key ID, Secret Access Key, and region (us-east-1)"
    exit 1
fi

echo "✅ AWS credentials configured"
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)
echo "   Account: $AWS_ACCOUNT"
echo "   Region: $AWS_REGION"
echo ""

# Navigate to terraform directory
cd "$(dirname "$0")"

# Initialize Terraform
echo "🔧 Initializing Terraform..."
terraform init
echo ""

# Validate configuration
echo "✅ Validating Terraform configuration..."
terraform validate
echo ""

# Format Terraform files
echo "📝 Formatting Terraform files..."
terraform fmt
echo ""

# Show execution plan
echo "📋 Showing execution plan..."
echo ""
terraform plan
echo ""

# Prompt for confirmation
read -p "🚀 Do you want to deploy to AWS? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Apply Terraform configuration
echo ""
echo "🚀 Deploying to AWS..."
echo ""
terraform apply -auto-approve

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           🎉 Deployment Complete!                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "⏳ Note: Allow 5-10 minutes for Docker images to download and containers to start"
echo ""
echo "📋 Next steps:"
echo "   1. Wait 10 minutes"
echo "   2. Access your application using the URLs above"
echo "   3. SSH into EC2 to check status:"
echo "      terraform output ssh_connection_command"
echo ""
