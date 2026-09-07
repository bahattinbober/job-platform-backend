# ACM issues free certificates, but only for domains you control.
# Ownership is proven by creating a DNS record ACM specifies.
resource "aws_acm_certificate" "api" {
  domain_name       = "${var.api_subdomain}.${var.domain_name}"
  validation_method = "DNS"

  tags = {
    ManagedBy = "terraform"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ACM tells us which record to create; we create it in the hosted zone.
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id         = aws_route53_zone.main.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

# Blocks until ACM has seen the DNS record and issued the certificate.
resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
