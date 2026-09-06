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
