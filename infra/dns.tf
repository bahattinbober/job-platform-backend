variable "domain_name" {
  description = "Root domain managed in Route53"
  type        = string
  default     = "bahattinbober.com"
}

variable "api_subdomain" {
  description = "Subdomain that points at the load balancer"
  type        = string
  default     = "api"
}

# The hosted zone outlives terraform destroy: its nameservers are registered
# at the domain registrar, and changing them on every rebuild would mean
# updating the registrar by hand each time.
resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = {
    ManagedBy = "terraform"
  }

  lifecycle {
    prevent_destroy = true
  }
}

# Alias records point at AWS resources directly, without an IP address.
# The load balancer's IPs change; the alias follows automatically.
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "${var.api_subdomain}.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}
