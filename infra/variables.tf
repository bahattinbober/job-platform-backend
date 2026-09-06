variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "eu-north-1"
}

variable "project_name" {
  description = "Prefix used for naming resources"
  type        = string
  default     = "job-platform"
}

variable "app_port" {
  description = "Port the NestJS app listens on"
  type        = number
  default     = 3000
}

variable "db_snapshot_identifier" {
  description = "Snapshot to restore from. Leave empty to create an empty database."
  type        = string
  default     = ""
}

variable "db_instance_class" {
  description = "RDS instance size"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_name" {
  description = "Initial database name (ignored when restoring from a snapshot)"
  type        = string
  default     = "job_platform"
}

variable "db_username" {
  description = "Master username (ignored when restoring from a snapshot)"
  type        = string
  default     = "postgres"
}

variable "redis_node_type" {
  description = "ElastiCache node size"
  type        = string
  default     = "cache.t3.micro"
}
