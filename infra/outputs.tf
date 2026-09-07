output "db_endpoint" {
  description = "RDS connection endpoint"
  value       = aws_db_instance.main.address
}

output "redis_endpoint" {
  description = "ElastiCache primary endpoint"
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
}

output "database_url" {
  description = "Full Postgres connection string for the application"
  value       = "postgresql://${aws_db_instance.main.username}:${random_password.db.result}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}"
  sensitive   = true
}

output "alb_dns_name" {
  description = "Public endpoint for the API"
  value       = aws_lb.main.dns_name
}

output "ecs_cluster_name" {
  description = "ECS cluster name for CLI commands"
  value       = aws_ecs_cluster.main.name
}

output "github_deploy_role_arn" {
  description = "IAM role ARN for the GitHub Actions deploy workflow"
  value       = aws_iam_role.github_deploy.arn
}
