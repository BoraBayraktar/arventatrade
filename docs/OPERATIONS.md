# Operations Runbook

## Observability Baseline

- Request tracing: each response carries `x-request-id` from middleware.
- Liveness endpoint: `GET /api/system/health`
- Readiness endpoint: `GET /api/system/ready`
- Structured logs: JSON logs are emitted via `src/lib/observability.ts`.

## Backup Policy

- Database: daily full PostgreSQL backup and hourly WAL archive snapshots.
- Retention:
  - Daily backups: 30 days
  - Weekly backups: 12 weeks
  - Monthly backups: 12 months
- Encryption: backups must be encrypted at rest and in transit.

## Restore Procedure

1. Select target backup timestamp.
2. Restore PostgreSQL to isolated recovery instance.
3. Run smoke checks:
   - `npm run verify:platform`
   - `APP_URL=<recovery-url> npm run verify:rbac`
4. Promote recovered database and update application environment.

## Disaster Recovery

- RPO target: 1 hour
- RTO target: 4 hours
- Incident flow:
  1. Declare incident and freeze deployments.
  2. Restore database from latest valid backup.
  3. Validate with platform + integration verifies.
  4. Re-enable traffic and monitor error rates.

## Security Controls

- Security headers enforced via Next.js config and middleware.
- API endpoints are no-store cached by default.
- RBAC is mandatory for admin and integration worker routes.

## Operational Verification

- Run the full operational verification chain after infrastructure changes:

```bash
APP_URL=http://localhost:3000 npm run verify:platform
APP_URL=http://localhost:3000 npm run verify:integrations
APP_URL=http://localhost:3000 npm run verify:orders
```
