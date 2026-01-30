# Terraform Outputs - Important information after deployment

output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.save2serve_ec2.id
}

output "instance_public_ip" {
  description = "Public IP address (Elastic IP)"
  value       = aws_eip.save2serve_eip.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name"
  value       = aws_instance.save2serve_ec2.public_dns
}

output "application_url_frontend" {
  description = "Save2Serve Frontend URL"
  value       = "http://${aws_eip.save2serve_eip.public_ip}:3000"
}

output "application_url_backend" {
  description = "Save2Serve Backend API URL"
  value       = "http://${aws_eip.save2serve_eip.public_ip}:4000"
}

output "ssh_connection_command" {
  description = "SSH command to connect to EC2 instance"
  value       = "ssh -i ${var.ssh_key_name}.pem ubuntu@${aws_eip.save2serve_eip.public_ip}"
}

output "ssh_private_key_path" {
  description = "Path to SSH private key file"
  value       = "${path.module}/${var.ssh_key_name}.pem"
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.save2serve_sg.id
}

output "deployment_instructions" {
  description = "Next steps after deployment"
  value       = <<-EOT
  
  ═══════════════════════════════════════════════════════════════
  🎉 Save2Serve Deployment Complete!
  ═══════════════════════════════════════════════════════════════
  
  📋 Access Your Application:
  ────────────────────────────────────────────────────────────
  Frontend:  http://${aws_eip.save2serve_eip.public_ip}:3000
  Backend:   http://${aws_eip.save2serve_eip.public_ip}:4000
  
  🔐 SSH Access:
  ────────────────────────────────────────────────────────────
  ssh -i ${var.ssh_key_name}.pem ubuntu@${aws_eip.save2serve_eip.public_ip}
  
  ⏳ Note: Wait 5-10 minutes for Docker images to download and containers to start.
  
  🔍 Check deployment status:
  ────────────────────────────────────────────────────────────
  ssh -i ${var.ssh_key_name}.pem ubuntu@${aws_eip.save2serve_eip.public_ip} "docker ps"
  
  ═══════════════════════════════════════════════════════════════
  EOT
}
