# Release Train and Ownership

## Release Cadence

- Branching model:
  - `main` is always releasable.
  - Short-lived feature branches are merged through reviewed pull requests.
- Release train:
  - Weekly scheduled release window.
  - Emergency patch lane for production incidents.

## Phase 5 Quality Gates

A change is release-ready only if all gates pass:

1. `npm run lint`
2. `npm run build`
3. `APP_URL=http://localhost:3000 npm run verify:platform`
4. `APP_URL=http://localhost:3000 npm run verify:integrations`
5. Existing regression suite (`verify:*` scripts)

## Domain Ownership

- Catalog: `src/modules/catalog/**`
- Commerce + Pricing: `src/modules/commerce/**`, `src/modules/pricing/**`
- Integration: `src/modules/integration/**`
- Identity: `src/modules/identity/**`
- Storefront: `src/modules/storefront/**`
- Platform: `src/lib/**`, `middleware.ts`, `next.config.ts`

## Escalation Path

1. Domain owner triages issue.
2. Platform owner joins when infra/security impact exists.
3. Incident commander approves patch release when needed.
