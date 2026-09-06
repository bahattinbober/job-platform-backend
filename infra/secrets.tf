# Secrets Terraform can derive itself
resource "random_password" "jwt" {
  length  = 64
  special = false
}

resource "aws_secretsmanager_secret" "database_url" {
  name                    = "${var.project_name}/DATABASE_URL"
  recovery_window_in_days = 0

  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = "postgresql://${aws_db_instance.main.username}:${random_password.db.result}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}"
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.project_name}/JWT_SECRET"
  recovery_window_in_days = 0

  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt.result
}

# Secrets that come from outside AWS - managed by hand, read here
data "aws_secretsmanager_secret" "openrouter_api_key" {
  name = "${var.project_name}/OPENROUTER_API_KEY"
}

data "aws_secretsmanager_secret" "linkedin_client_id" {
  name = "${var.project_name}/LINKEDIN_CLIENT_ID"
}

data "aws_secretsmanager_secret" "linkedin_client_secret" {
  name = "${var.project_name}/LINKEDIN_CLIENT_SECRET"
}
