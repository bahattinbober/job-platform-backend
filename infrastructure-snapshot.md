# Infrastructure Snapshot — job-platform-backend

Captured: 2026-09-06, before decommissioning ALB / ElastiCache / RDS for cost control.
Purpose: reference for rebuilding this stack with Terraform in a later phase.

Account: `323463754688`, region: `eu-north-1`.

---

## VPC / Networking

- VPC: `vpc-07faa50c4bdc16f1b` (default VPC, CIDR `172.31.0.0/16`)
- Subnets (all public, `MapPublicIpOnLaunch: true`, used by ALB / ECS / ElastiCache / RDS):
  | Subnet ID | AZ | CIDR |
  |---|---|---|
  | subnet-0caa24b49fd8f78eb | eu-north-1a | 172.31.16.0/20 |
  | subnet-08d130602719b6db5 | eu-north-1c | 172.31.0.0/20 |
  | subnet-0c1642d3966c680d6 | eu-north-1b | 172.31.32.0/20 |
- No NAT Gateway, no VPC endpoints.

## Security Groups (kept — not deleted)

| SG ID | Name | Purpose | Inbound | Outbound |
|---|---|---|---|---|
| sg-0343c0a3d5d37bd83 | job-platform-alb-sg | ALB | TCP 80 from 0.0.0.0/0 | all to 0.0.0.0/0 |
| sg-0b237240116e3df0c | job-platform-ecs-sg | ECS Fargate tasks | TCP 3000 from sg-0343c0a3d5d37bd83 (ALB SG) | all to 0.0.0.0/0 |
| sg-0b5d889ab3377d962 | job-platform-redis-sg | ElastiCache | TCP 6379 from sg-0b237240116e3df0c (ECS SG) | all to 0.0.0.0/0 |
| sg-02625e84fc819ccc4 | default (used by RDS) | RDS | TCP 5432 from sg-0b237240116e3df0c (ECS SG); all protocol self-referencing | all to 0.0.0.0/0 |

## IAM Roles (kept — not deleted)

| Role | ARN | Attached policies |
|---|---|---|
| job-platform-ecs-task-role | arn:aws:iam::323463754688:role/job-platform-ecs-task-role | none attached (task makes no AWS SDK calls at runtime) |
| job-platform-ecs-execution-role | arn:aws:iam::323463754688:role/job-platform-ecs-execution-role | AmazonECSTaskExecutionRolePolicy (managed) — handles ECR pull, Secrets Manager fetch, CloudWatch Logs write |

IAM user `job-platform-cli`: AdministratorAccess (used for CLI-driven deploys; access key `***REMOVED***`, created 2026-09-06 — flagged for rotation in the earlier security audit, not yet rotated).

---

## ALB — DELETED in this pass

- Name: `job-platform-alb`
- ARN: `arn:aws:elasticloadbalancing:eu-north-1:323463754688:loadbalancer/app/job-platform-alb/c168f2e88206af35`
- DNS name: `job-platform-alb-1242190196.eu-north-1.elb.amazonaws.com`
- Scheme: internet-facing, type: application, IP address type: ipv4
- AZs/subnets: eu-north-1a/subnet-0caa24b49fd8f78eb, eu-north-1b/subnet-0c1642d3966c680d6, eu-north-1c/subnet-08d130602719b6db5
- Security group: sg-0343c0a3d5d37bd83
- Created: 2026-09-06T12:24:47Z

**Listener:**
- ARN: `arn:aws:elasticloadbalancing:eu-north-1:323463754688:listener/app/job-platform-alb/c168f2e88206af35/01164e0d6c555966`
- Port 80, protocol HTTP → forward to target group `job-platform-tg` (weight 1, no stickiness override)
- **No HTTPS/443 listener existed** (already flagged as a gap in the earlier audit)

**Target group:**
- Name: `job-platform-tg`, ARN: `arn:aws:elasticloadbalancing:eu-north-1:323463754688:targetgroup/job-platform-tg/a25ff305f90839ee`
- Protocol HTTP, port 3000, target type: `ip` (Fargate awsvpc mode)
- Health check: protocol HTTP, path `/health`, interval 15s, timeout 5s, healthy threshold 2, unhealthy threshold 3, matcher 200
- Attributes: deregistration_delay 300s, stickiness disabled (lb_cookie type configured but not enabled), round_robin algorithm, cross-zone = use LB configuration

⚠️ **Note for rebuild:** the ECS service definition (`job-platform-service`) still references this exact target group ARN in its `loadBalancers` config. That ARN will no longer exist after this teardown. If the service is scaled back up (`desiredCount > 0`) before a new ALB/target group is created and the service is updated to point at it, ECS will fail to register the running task with the (now-deleted) target group — the task itself may still start, but it won't be reachable and the service will emit repeated registration-failure events. **When rebuilding: create the new ALB/target group first, then update the service's `--load-balancers` before or as part of scaling back up.**

---

## ElastiCache — DELETED in this pass

- Cluster ID: `job-platform-redis`
- ARN: `arn:aws:elasticache:eu-north-1:323463754688:cluster:job-platform-redis`
- Engine: redis 7.1.0, node type: `cache.t4g.micro`, 1 node, AZ eu-north-1c
- Endpoint: `job-platform-redis.8qwqcd.0001.eun1.cache.amazonaws.com:6379`
- Subnet group: `job-platform-redis-subnet-group` (spans all 3 subnets above) — **subnet group itself is also deleted along with the cluster** (not reusable once the cluster is gone in most cases; recreate in Terraform)
- Parameter group: `job-platform-redis-params`
- Security group: sg-0b5d889ab3377d962
- Encryption: transit encryption OFF, at-rest encryption OFF, no auth token
- Snapshot retention: 0 (no automatic backups were configured)
- Created: 2026-09-06T11:59:50Z

No data persistence — BullMQ queue state is not preserved across this deletion (expected/accepted; queue jobs are transient by design).

---

## RDS — DELETED in this pass (with final snapshot)

- Identifier: `job-platform-db`
- ARN: `arn:aws:rds:eu-north-1:323463754688:db:job-platform-db`
- Engine: postgres 16.15, class `db.t4g.micro`, storage: 20GB gp2, MaxAllocatedStorage 1000 (storage autoscaling enabled)
- Endpoint: `job-platform-db.cd6eismeg7dv.eu-north-1.rds.amazonaws.com:5432`
- DB name: `job_platform`, master username: `postgres`
- Multi-AZ: false, AZ: eu-north-1c
- Publicly accessible: false
- Storage encrypted: true, KMS key: `arn:aws:kms:eu-north-1:323463754688:key/ea36c5a7-7eaf-4a62-8588-903a6a120f16`
- Backup retention: 1 day (window 04:59-05:29 UTC)
- Parameter group: `default.postgres16`, option group: `default:postgres-16`
- Subnet group: `default-vpc-07faa50c4bdc16f1b` (all 3 subnets above)
- Security group: sg-02625e84fc819ccc4 (default VPC SG)
- Performance Insights: enabled, 7-day retention
- Deletion protection: **false** (was off — no safety blocker on delete)
- Created: 2026-09-06T01:07:47Z

**Snapshots retained (both confirmed `available`):**
| Snapshot ID | Type | Size | Created |
|---|---|---|---|
| `job-platform-db-final-20260906` | manual (taken before any teardown step) | 20GB | 2026-09-06T15:55:50Z |
| `job-platform-db-final-20260906-ondelete` | manual (`--final-db-snapshot-identifier` at `delete-db-instance` time, `--skip-final-snapshot` NOT used) | 20GB | 2026-09-06T16:09:29Z |

Instance deletion confirmed complete: `aws rds describe-db-instances` returns no `job-platform-db` instance. The 2 pre-existing automated daily backups (`rds:job-platform-db-2026-09-06-01-09` and `-05-09`) were auto-purged by AWS shortly after the instance was deleted (attempting to delete them manually afterward returned `DBSnapshotNotFound`) — only the 2 manual final snapshots remain, at ~$0.095/GB-month ≈ $1.90/month each, ~$3.80/month total for both.

All snapshots preserve schema + data for all tables (`User`, `Job`, `Company`, `Resume`, `Application`, embeddings, etc. — whatever the current Prisma schema defines) and can be restored into a new `db.t4g.micro` instance later via `aws rds restore-db-instance-from-db-snapshot`.

---

## ECS — kept (scaled to 0, not deleted)

- Cluster: `job-platform-cluster` (ARN: `arn:aws:ecs:eu-north-1:323463754688:cluster/job-platform-cluster`)
- Service: `job-platform-service` (ARN: `arn:aws:ecs:eu-north-1:323463754688:service/job-platform-cluster/job-platform-service`)
  - Launch type: FARGATE, platform version LATEST
  - Desired count: scaled to **0** in this pass (was 1)
  - Network: subnets = all 3 above, security group = sg-0b237240116e3df0c, assignPublicIp = ENABLED
  - Load balancer config: target group ARN `arn:aws:elasticloadbalancing:...targetgroup/job-platform-tg/a25ff305f90839ee` (⚠️ stale after this teardown — see ALB note above), container `job-platform-backend`, port 3000
  - Deployment: rolling, min healthy 100%, max 200%, circuit breaker disabled
  - Health check grace period: 60s

**Task definition `job-platform-backend:9` (ACTIVE, in use by the service):**
- CPU: 512 (0.5 vCPU), memory: 1024 (1 GB)
- Network mode: awsvpc, requires: FARGATE
- Task role: `arn:aws:iam::323463754688:role/job-platform-ecs-task-role`
- Execution role: `arn:aws:iam::323463754688:role/job-platform-ecs-execution-role`
- Container `job-platform-backend`:
  - Image: `323463754688.dkr.ecr.eu-north-1.amazonaws.com/job-platform-backend:v6`
  - Port mapping: 3000/tcp → 3000
  - Log driver: awslogs, group `/ecs/job-platform-backend`, region eu-north-1, stream prefix `ecs`
  - Plain environment variables (non-secret):
    | Name | Value |
    |---|---|
    | REDIS_HOST | job-platform-redis.8qwqcd.0001.eun1.cache.amazonaws.com *(stale after ElastiCache deletion — must be updated on rebuild)* |
    | REDIS_PORT | 6379 |
    | PORT | 3000 |
    | LINKEDIN_CALLBACK_URL | http://job-platform-alb-1242190196.eu-north-1.elb.amazonaws.com/auth/linkedin/callback *(stale after ALB deletion — must be updated on rebuild, and the LinkedIn Developer app's registered redirect URL must be updated too)* |
  - Secrets (pulled from Secrets Manager at container start — **names only, values not recorded here**):
    | Env var | Secrets Manager secret |
    |---|---|
    | DATABASE_URL | job-platform/DATABASE_URL |
    | JWT_SECRET | job-platform/JWT_SECRET |
    | OPENROUTER_API_KEY | job-platform/OPENROUTER_API_KEY |
    | LINKEDIN_CLIENT_ID | job-platform/LINKEDIN_CLIENT_ID |
    | LINKEDIN_CLIENT_SECRET | job-platform/LINKEDIN_CLIENT_SECRET |

---

## ECR — kept (not deleted)

- Repository: `job-platform-backend`
- URI: `323463754688.dkr.ecr.eu-north-1.amazonaws.com/job-platform-backend`
- Tag mutability: MUTABLE, scan on push: enabled, encryption: AES256
- Tags present at time of writing: v1–v6, `latest`, `debug-cleanup-2a66627` (v6/latest/debug-cleanup share one digest — the current deployed image)
- No lifecycle policy configured (flagged in earlier audit — untagged images accumulate; still well under the 50GB permanent free tier)

## Secrets Manager — kept (not deleted, values untouched)

All 5 secrets listed above under the task definition's `secrets` block. Names/ARNs recorded there; **no secret values are recorded in this file.**

## CloudWatch Logs — kept (not deleted)

- Log group: `/ecs/job-platform-backend`
- Retention: none set (indefinite) — flagged in earlier audit as a hygiene/cost item to fix later.

## AWS Budgets — kept (not deleted)

- Budget `job-platform-monthly-cost-guard`, $10/month, ACTUAL 50/80/100% + FORECASTED 100% thresholds, notifying bahobober20@gmail.com.

---

## Rebuild checklist (for the Terraform phase)

1. Recreate VPC networking references (or reuse the default VPC/subnets above — they were not touched).
2. Recreate security groups (or reuse the 4 above — they were not deleted).
3. Restore RDS from one of the two final snapshots (`job-platform-db-final-YYYYMMDD` or the delete-time auto snapshot) into a new `db.t4g.micro` instance.
4. Recreate ElastiCache `cache.t4g.micro` (or switch to `cache.t3.micro`/`t2.micro` to land in free tier — see cost analysis from the same session) with a new subnet group referencing the subnets above.
5. Recreate ALB + listener (80, and ideally add 443/ACM this time) + target group (`/health` check) pointing at port 3000.
6. Update task definition env vars: new `REDIS_HOST` (new ElastiCache endpoint), new `LINKEDIN_CALLBACK_URL` (new ALB DNS or custom domain) — and update the LinkedIn Developer app's redirect URI to match.
7. Update the ECS service's `--load-balancers` to the new target group ARN, then scale `desiredCount` back to 1.
8. Re-run the DB migration (`prisma migrate deploy`) if restoring fresh rather than from snapshot; if restoring from snapshot, schema/data are already there.
