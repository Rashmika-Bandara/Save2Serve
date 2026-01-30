# Main Terraform Configuration for Save2Serve on AWS EC2

# Data source: Get the latest Ubuntu 22.04 LTS AMI (Free Tier eligible)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical's AWS account ID

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Get default VPC (Free Tier - no extra charges)
data "aws_vpc" "default" {
  default = true
}

# Get default subnets
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security Group: Allow SSH, HTTP, and application ports
resource "aws_security_group" "save2serve_sg" {
  name        = "${var.project_name}-security-group"
  description = "Security group for Save2Serve application"
  vpc_id      = data.aws_vpc.default.id

  # SSH access (port 22)
  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidr
  }

  # HTTP access (port 80)
  ingress {
    description = "HTTP access for frontend"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Frontend access (port 3000)
  ingress {
    description = "React frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API access (port 4000)
  ingress {
    description = "Node.js backend API"
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS (future use, port 443)
  ingress {
    description = "HTTPS access"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}

# Generate SSH key pair
resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Create AWS key pair from generated key
resource "aws_key_pair" "save2serve_key" {
  key_name   = var.ssh_key_name
  public_key = tls_private_key.ssh_key.public_key_openssh

  tags = {
    Name = "${var.project_name}-keypair"
  }
}

# Save private key locally for SSH access
resource "local_file" "private_key" {
  content         = tls_private_key.ssh_key.private_key_pem
  filename        = "${path.module}/${var.ssh_key_name}.pem"
  file_permission = "0400"
}

# Elastic IP for stable public address
resource "aws_eip" "save2serve_eip" {
  instance = aws_instance.save2serve_ec2.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-eip"
  }

  depends_on = [aws_instance.save2serve_ec2]
}

# EC2 Instance: Hosts the Save2Serve application
resource "aws_instance" "save2serve_ec2" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = aws_key_pair.save2serve_key.key_name

  vpc_security_group_ids = [aws_security_group.save2serve_sg.id]
  
  # Use first available subnet
  subnet_id = data.aws_subnets.default.ids[0]

  # Storage: 30GB is Free Tier eligible
  root_block_device {
    volume_size           = 30
    volume_type          = "gp3"
    delete_on_termination = true
  }

  # User Data: Install Docker, Docker Compose, and deploy application
  user_data = templatefile("${path.module}/user-data.sh", {
    dockerhub_username = var.dockerhub_username
  })

  tags = {
    Name = "${var.project_name}-ec2"
  }
}
