# Vercel Deployment Notes

This project can run on Vercel as a Node.js Next.js application.

## Build mode

The production build script uses `next build --webpack` from [`package.json`](/Users/borabayraktar/Documents/GitHub/arventatrade/package.json:8).

This is intentional. In this repository, Turbopack production build was hanging during `Creating an optimized production build ...`, so the deploy path is pinned to Webpack for a more predictable Vercel build.

The root layout also avoids remote Google Font fetching so production builds are not coupled to external font downloads.

## Required environment variables

- `DATABASE_URL`: required for Prisma and all catalog/admin/server flows.
- `AUTH_SECRET`: required for login/session signing.
- `APP_URL`: should match the production Vercel URL or your custom domain.

## Recommended environment variables

- `REDIS_URL`: enables distributed cache and allows `/api/system/ready` to report healthy Redis status.
- `REDIS_CONNECT_TIMEOUT_MS`: optional, defaults to `1000` so unreachable Redis does not stall request/build flow for too long.

If `REDIS_URL` is omitted, the application can still serve requests, but cache-backed features fall back to degraded behavior and readiness checks may not report fully healthy infrastructure.

## Optional integrations

- `MINIO_ENDPOINT`
- `MINIO_PORT`
- `MINIO_USE_SSL`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `MEDIA_PUBLIC_BASE_URL`

These are required only if you want product/media uploads to work in production.

- `RESEND_API_KEY`
- `NOTIFICATION_EMAIL_FROM`
- `NOTIFICATION_EMAIL_WEBHOOK_URL`
- `NOTIFICATION_EMAIL_WEBHOOK_SECRET`

These are required only for live notification email delivery.

## Runtime behavior

- The localized app tree is forced to `nodejs` runtime in [`src/app/[locale]/layout.tsx`](/Users/borabayraktar/Documents/GitHub/arventatrade/src/app/[locale]/layout.tsx:1).
- The same layout is marked `force-dynamic` so Vercel does not try to pre-render data-backed routes at build time.

This is important because storefront, admin, auth, Prisma, Redis, and media flows are request-time concerns in this app.

## Health endpoints

- `/api/system/health`: lightweight liveness check.
- `/api/system/ready`: database + Redis readiness check.

For Vercel smoke testing, use `/api/system/health` first. Use `/api/system/ready` only after production environment variables are configured.
