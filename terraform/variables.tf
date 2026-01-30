# Variables for Save2Serve AWS Infrastructure

variable "aws_region" {
  description = "AWS region for deployment (Free Tier available)"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "save2serve"
}

variable "instance_type" {
  description = "EC2 instance type (t3.micro is Free Tier eligible)"
  type        = string
  default     = "t3.micro"
}

variable "ssh_key_name" {
  description = "Name for the SSH key pair"
  type        = string
  default     = "save2serve-key"
}

variable "dockerhub_username" {
  description = "Docker Hub username for pulling images"
  type        = string
  default     = "rashmikabandara"
}

variable "allowed_ssh_cidr" {
  description = "CIDR blocks allowed to SSH (your IP or 0.0.0.0/0 for testing)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
