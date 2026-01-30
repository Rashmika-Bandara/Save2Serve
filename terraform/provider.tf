# Terraform Configuration for Save2Serve AWS Deployment
# This configures Terraform to use AWS with your credentials

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# AWS Provider - Uses credentials from ~/.aws/credentials
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "Save2Serve"
      Environment = "Production"
      ManagedBy   = "Terraform"
    }
  }
}
