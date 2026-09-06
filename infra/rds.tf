resource "random_password" "db" {
  length  = 24
  special = false
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name      = "${var.project_name}-db-subnet-group"
    ManagedBy = "terraform"
  }
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "16.15"
  instance_class = var.db_instance_class

  allocated_storage = 20
  storage_type      = "gp2"
  storage_encrypted = true

  # When restoring, these are inherited from the snapshot and must be omitted
  snapshot_identifier = var.db_snapshot_identifier != "" ? var.db_snapshot_identifier : null
  db_name             = var.db_snapshot_identifier != "" ? null : var.db_name
  username            = var.db_snapshot_identifier != "" ? null : var.db_username
  password            = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  backup_retention_period = 1
  skip_final_snapshot     = true
  apply_immediately       = true

  tags = {
    Name      = "${var.project_name}-db"
    ManagedBy = "terraform"
  }
}
