# ALB: the only thing exposed to the internet
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Allows HTTP from the internet to the load balancer"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
    ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name      = "${var.project_name}-alb-sg"
    ManagedBy = "terraform"
  }
}

# ECS task: reachable only from the ALB
resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-ecs-sg"
  description = "Allows app traffic from the load balancer only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "App port from ALB"
    from_port       = var.app_port
    to_port         = var.app_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name      = "${var.project_name}-ecs-sg"
    ManagedBy = "terraform"
  }
}

# RDS: reachable only from the ECS task
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Allows Postgres from the application only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "Postgres from ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name      = "${var.project_name}-rds-sg"
    ManagedBy = "terraform"
  }
}

# Redis: reachable only from the ECS task
resource "aws_security_group" "redis" {
  name        = "${var.project_name}-redis-sg"
  description = "Allows Redis from the application only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "Redis from ECS"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name      = "${var.project_name}-redis-sg"
    ManagedBy = "terraform"
  }
}
