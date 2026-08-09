# Production setup: accounts and server-side scoring

This describes everything needed to switch on user accounts (Google + email/password)
on the production deployment of navio.az.

**Who this is for.** Steps marked 👤 must be done by a human in a browser: they need
you to be logged into Vercel, Google, or your domain registrar. Steps marked 🤖 can be
done by an AI agent with access to this repository. Nothing here needs a terminal.

There is **no database migration step**. The schema applies itself during deployment
(`vercel-build` runs `scripts/migrate.mjs` before `next build`), so the tables are
created on the first deploy after these variables are set.

---

## Order of operations

Do these in order. The site will not sign anyone in until step 5 is complete, and a
deploy before then is safe but will show errors on the login page.

---

## 1. 👤 Create the database (Neon)

In the Vercel dashboard, in the **navio** project:

1. Open the **Storage** tab
2. Click **Create Database** → choose **Neon** (Serverless Postgres)
3. Accept the terms, keep the free plan, choose the region closest to Azerbaijan
   (usually `Frankfurt / eu-central-1`)
4. When asked which project to connect it to, choose **navio**, and connect it to
   **all environments** (Production, Preview, Development)

This automatically creates `DATABASE_URL` and `DATABASE_URL_UNPOOLED` in the project.
You do not need to copy them anywhere.

## 2. 👤 Create the email sender (Resend)

Still in the **navio** project:

1. Open the **Integrations** tab (or **Storage → Marketplace**)
2. Find **Resend**, click **Add**, accept the terms
3. Connect it to the **navio** project, all environments

This creates `RESEND_API_KEY` automatically.

### 2a. 👤 Verify the navio.az domain in Resend

Until this is done, Resend can only send test mail to your own address, so verification
and password-reset emails will not reach real users.

1. Open the Resend dashboard (from the Vercel integration, click **Manage**)
2. Go to **Domains** → **Add Domain** → enter `navio.az`
3. Resend shows a list of DNS records (SPF, DKIM, and usually DMARC)
4. Add those records wherever navio.az DNS is managed, then click **Verify**

DNS changes can take a few hours to apply. Everything else works while you wait; only
outgoing email is affected.

## 3. 👤 Add the remaining environment variables

In the **navio** project: **Settings → Environment Variables**. For each one below,
set **Environment** to **Production** (also tick Preview and Development if you want
sign-in to work on preview deployments).

| Name | Value |
|---|---|
| `BETTER_AUTH_URL` | `https://navio.az` |
| `NEXT_PUBLIC_SITE_URL` | `https://navio.az` |
| `EMAIL_FROM` | `Navio <noreply@navio.az>` |
| `GOOGLE_CLIENT_ID` | from Google Cloud Console (see step 4) |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud Console (see step 4) |
| `BETTER_AUTH_SECRET` | a long random value — see below |
| `SCORING_IP_SALT` | a different long random value — see below |

### Generating the two random values

`BETTER_AUTH_SECRET` signs login sessions and `SCORING_IP_SALT` protects visitors'
IP addresses. Both must be long and random. **Do not invent them by hand** — a
guessable auth secret lets an attacker forge logins.

Use a password generator set to **40+ characters, letters and numbers**
(1Password, Bitwarden, or https://1password.com/password-generator). Generate two
separate values. You never need to remember them; once saved in Vercel they are used
automatically.

> ⚠️ Changing `BETTER_AUTH_SECRET` later signs everyone out.
> Changing `SCORING_IP_SALT` only resets rate-limit counters, which is harmless.

## 4. 👤 Configure Google sign-in

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), in the
project where the Navio sign-in credentials were created:

1. Open **APIs & Services → Credentials**
2. Click the OAuth 2.0 Client ID used for Navio
3. Under **Authorised redirect URIs**, add exactly:
   ```
   https://navio.az/api/auth/callback/google
   ```
   The path must match character for character. No trailing slash.
4. Click **Save**, then copy the **Client ID** and **Client secret** into the Vercel
   variables from step 3

### 4a. Publish the consent screen

Open **APIs & Services → OAuth consent screen**. If the publishing status says
**Testing**, only a short list of test accounts can sign in — everyone else gets
"access blocked". Click **Publish app** to move it to **In production**.

Google may ask for a privacy policy URL and a terms URL. Use:

- Privacy policy: `https://navio.az/az/privacy`
- Terms / disclaimer: `https://navio.az/az/disclaimer`

## 5. 👤 Redeploy

Environment variables only take effect on a new deployment.

**Deployments** tab → most recent deployment → **⋯** menu → **Redeploy**.

The build log should contain `[migrate] miqrasiyalar tətbiq olundu`, which means the
database tables were created.

---

## 6. 🤖 Verify it worked

An AI agent with repo access can confirm the deployment is healthy by checking the
live site. None of this needs credentials.

```bash
# The Google button should be present on the login page
curl -s https://navio.az/az/login | grep -c "Google ilə davam et"     # expect 1 or more

# Starting a Google sign-in should return an accounts.google.com URL
curl -s -X POST https://navio.az/api/auth/sign-in/social \
  -H 'Content-Type: application/json' \
  -d '{"provider":"google","callbackURL":"/az"}'
# expect JSON containing "accounts.google.com" — NOT {"code":"PROVIDER_NOT_FOUND"}

# Scoring should return a result and a calculationId
curl -s -X POST https://navio.az/api/score \
  -H 'Content-Type: application/json' \
  -d '{"mode":"bank","input":{"kreditNovu":"naqd","mebleg":"10000","muddət":"24","faiz":"24","gelirNovu":"resmi","gelir":"1500","isStaji":"12_plus","yas":"30","movcudNaqdOdenis":"0","movcudKartLimit":"0","cariGecikmeGun":"0","maks12ay":"0"}}'
# expect "score":100 and a non-null "calculationId"
```

If `calculationId` comes back `null`, the database is not reachable: re-check step 1
and that the deploy ran after Neon was connected.

### Confirm the scoring logic is not exposed

The whole point of this change is that scoring internals stay on the server. To
confirm on the live site, load `https://navio.az/az/kredit-yoxlama` in a browser,
open developer tools → **Sources**, and search the JavaScript files for
`cashRateOfficialTable` or `bgnTierMidPct`. There should be **no matches**.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Login page has no Google button | `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` missing, or no redeploy since adding them |
| `PROVIDER_NOT_FOUND` from the social endpoint | Same as above |
| Google shows "Error 400: redirect_uri_mismatch" | The URI in step 4 does not match `BETTER_AUTH_URL` exactly |
| Google shows "Access blocked" for most people | Consent screen still in **Testing** — see step 4a |
| Sign-in works but no confirmation email arrives | Resend domain not verified — see step 2a |
| `calculationId` is `null` | Database not connected, or deploy predates step 1 |
| Everyone gets signed out after a deploy | `BETTER_AUTH_SECRET` changed between deployments |

## Notes

- **Email verification is currently optional.** New users receive a confirmation mail
  but are not blocked from using the site. To make it mandatory, set
  `requireEmailVerification: true` in `src/lib/auth.ts`.
- **Google users skip verification entirely**, because Google already confirms the
  address.
- Anonymous calculations are deleted automatically after 7 days. Calculations
  belonging to a registered account are kept until the user deletes them.
- Visitor IP addresses are never stored in readable form, only as a salted hash used
  for rate limiting.
- `.env.example` in the repository root lists every variable with a short explanation.
