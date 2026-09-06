resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-redis-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name      = "${var.project_name}-redis-subnet-group"
    ManagedBy = "terraform"
  }
}

# BullMQ requires noeviction: with any other policy Redis can drop
# queue keys under memory pressure, silently losing jobs.
resource "aws_elasticache_parameter_group" "main" {
  name   = "${var.project_name}-redis-params"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "noeviction"
  }

  tags = {
    Name      = "${var.project_name}-redis-params"
    ManagedBy = "terraform"
  }
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "${var.project_name}-redis"
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  port                 = 6379
  parameter_group_name = aws_elasticache_parameter_group.main.name
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]

  tags = {
    Name      = "${var.project_name}-redis"
    ManagedBy = "terraform"
  }
}
