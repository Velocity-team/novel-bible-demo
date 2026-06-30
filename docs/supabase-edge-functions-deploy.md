# Supabase Edge Functions Deployment

This guide prepares the LoreBlock demo data collection APIs for deployment to Supabase Edge Functions.

## Prerequisites

- Supabase project ref: `lradvtqbtsxdcoavtasn`
- Supabase CLI installed through `npm install`
- Supabase CLI authenticated with `npx supabase login`
- Tables from `supabase/migrations/001_create_demo_collection_tables.sql` already applied
- Backoffice password decided before deployment

Check the CLI:

```powershell
npm run supabase:version
```

## Functions

Deploy these functions from the repository root:

```powershell
npm run deploy:edge-functions
```

`supabase/config.toml` sets `verify_jwt = false` for these functions because the browser calls public collection APIs directly and admin APIs are protected by `x-admin-password`.

## Secrets

Register secrets before deploying or testing:

```powershell
npx supabase secrets set BACKOFFICE_PASSWORD="<admin-password>" --project-ref lradvtqbtsxdcoavtasn
npx supabase secrets set ALLOWED_ORIGINS="https://loreblock-demo.netlify.app,http://localhost:5173" --project-ref lradvtqbtsxdcoavtasn
```

Do not commit real secret values. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided by Supabase at runtime and cannot be set manually because `SUPABASE_` names are reserved.

## Smoke Tests

Set local shell variables first:

```powershell
$base = "https://lradvtqbtsxdcoavtasn.supabase.co/functions/v1"
$admin = "<admin-password>"
```

Create one event:

```powershell
Invoke-RestMethod "$base/track-event" -Method Post -ContentType "application/json" -Body '{"sid":"smoke-test","type":"demo_open","feature":"deploy-check","ts":1719630000000}'
```

Create one lead:

```powershell
Invoke-RestMethod "$base/submit-lead" -Method Post -ContentType "application/json" -Body '{"sid":"smoke-test","email":"smoke@example.com","role":"tester","genre":"test","interests":["deploy-check"],"ts":1719630000000}'
```

Verify admin protection:

```powershell
Invoke-WebRequest "$base/admin-events" -Method Get
```

The request above should return `401`. Then verify admin access:

```powershell
Invoke-RestMethod "$base/admin-events" -Headers @{ "x-admin-password" = $admin }
Invoke-RestMethod "$base/admin-leads" -Headers @{ "x-admin-password" = $admin }
```

Delete the smoke-test visitor event after verification:

```powershell
Invoke-RestMethod "$base/admin-delete-visitor" -Method Post -ContentType "application/json" -Headers @{ "x-admin-password" = $admin } -Body '{"sid":"smoke-test"}'
```

## Security Checklist

- Keep RLS enabled and forced on `events` and `leads`.
- Keep `anon` and `authenticated` table grants revoked.
- Use the runtime-provided `SUPABASE_SERVICE_ROLE_KEY`; never expose it to frontend code.
- Use a non-trivial `BACKOFFICE_PASSWORD`.
- Keep `ALLOWED_ORIGINS` limited to production and local development origins.
- Recheck function logs after deployment for rejected origins, validation failures, or missing secrets.
