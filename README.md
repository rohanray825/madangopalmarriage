# Madan Gopal Martrimony

Fresh `Next.js + TypeScript` implementation of a Hare Krishna marriage portal with:

- Clerk authentication with email verification and Google sign-in
- Neon Postgres via Drizzle ORM
- Cloudflare R2 profile photo uploads via pre-signed URLs
- Admin-managed manual match recommendations
- In-app recommendation inbox plus email delivery through Resend

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in real values for Clerk, Neon, R2, and Resend.
3. Install dependencies:

```bash
npm install
```

4. Push the database schema:

```bash
npm run db:push
```

5. Start the dev server:

```bash
npm run dev
```

## Required environment variables

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `RECOMMENDATION_FROM_EMAIL`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`
- `CONTACT_PHONE_NUMBER`
- `CONTACT_QUERY_TO_EMAIL`

## Notes

- The questionnaire fields were ported from `D:\web\marr\src\pages\Profile\component.tsx`.
- Admin access is role-based and expects Clerk `publicMetadata.role = "admin"`.
- Recommendation emails are skipped gracefully if Resend is not configured, but recommendation records still persist.
