provider "aws" {
  region     = var.region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

resource "aws_instance" "chess_app" {
  ami           = "ami-04c859bb277ddb764"  # Example Ubuntu AMI for us-east-1
  instance_type = "t3.micro"

  user_data = <<-EOF
              #!/bin/bash
              sudo apt update
              sudo apt install -y docker.io docker-compose
              git clone https://github.com/PriyanshuDalakoti/Chess
              cd Chess
              docker-compose up -d
              EOF

  tags = {
    Name = "chess-server"
  }
}

output "instance_ip" {
  value = aws_instance.chess_app.public_ip
}

