# Production setup: accounts and server-side scoring

How to switch on user accounts (Google + email/password) for the deployed site.

**Who does what.** Steps marked 👤 need a human in a browser, logged into Vercel or
Google. Steps marked 🤖 can be done by an AI agent with access to this repository.
Nothing here needs a terminal.

**No database step.** The schema applies itself during deployment: `vercel-build`
runs `scripts/migrate.mjs` before `next build`, so tables are created on the first
deploy after the database is connected.

---

## Two stages

**Stage 1 (below) — what to do now.** Runs on the Vercel-provided `.vercel.app`
address, with **email switched off**. Google sign-in and email/password sign-up both
work. This is enough to use and test the whole product.

**Stage 2 ([further down](#stage-2--when-navioaz-and-email-are-ready))** — moving to
navio.az and turning email on. Do this later; nothing in Stage 1 needs redoing except
two settings.

### What "email off" means

While no email service is configured, the app deliberately sends nothing and hides
anything that would promise a message:

| | Stage 1 (no email) | Stage 2 (email on) |
|---|---|---|
| Sign up with email + password | ✅ works | ✅ works |
| Sign in with Google | ✅ works | ✅ works |
| Confirmation email | not sent, not mentioned | sent, optional to confirm |
| "Forgot password?" link | hidden | shown |

**The one consequence:** a user who forgets their password cannot reset it until
Stage 2. Google users are unaffected — they have no password. Worth keeping in mind
if you invite real users before the domain is ready.

---

# Stage 1 — now

## 1. 👤 Find your production address

Open the project in the Vercel dashboard. At the top it shows the production domain,
something like:

```
navio.vercel.app
```

Copy it. It is used in steps 2 and 3 and must be identical in both. Use the stable
production address, **not** a long preview URL with random characters in it.

> Preview deployments get a different URL each time, so Google sign-in only works on
> the production address unless each preview URL is registered with Google too.

## 2. 👤 Create the database (Neon)

In the Vercel project:

1. **Storage** tab → **Create Database** → **Neon** (Serverless Postgres)
2. Accept the terms, keep the free plan, region **Frankfurt / eu-central-1**
3. Connect it to this project, **all environments** (Production, Preview, Development)

This creates `DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically. Nothing to copy.

## 3. 👤 Add environment variables

**Settings → Environment Variables**, environment **Production** (tick Preview and
Development too if you want sign-in on preview deployments).

Replace `navio.vercel.app` with your actual address from step 1.

| Name | Value |
|---|---|
| `BETTER_AUTH_URL` | `https://navio.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://navio.vercel.app` |
| `GOOGLE_CLIENT_ID` | from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud Console |
| `BETTER_AUTH_SECRET` | long random value — see below |
| `SCORING_IP_SALT` | a different long random value — see below |

Do **not** set `RESEND_API_KEY` or `EMAIL_FROM` yet. Leaving them unset is what keeps
email cleanly switched off.

### The two random values

`BETTER_AUTH_SECRET` signs login sessions; `SCORING_IP_SALT` protects visitors' IP
addresses. Both must be long and random. **Do not invent them by hand** — a guessable
auth secret lets someone forge logins.

Use a password generator at **40+ characters, letters and numbers** (1Password,
Bitwarden, or https://1password.com/password-generator). Generate two different
values. You never need to remember them.

> ⚠️ Changing `BETTER_AUTH_SECRET` later signs everyone out.
> Changing `SCORING_IP_SALT` only resets rate-limit counters, which is harmless.

## 4. 👤 Point Google at that address

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), in the
project holding the Navio sign-in credentials:

1. **APIs & Services → Credentials** → open the Navio OAuth 2.0 Client ID
2. Under **Authorised redirect URIs**, add exactly (your address + this exact path):
   ```
   https://navio.vercel.app/api/auth/callback/google
   ```
   Character for character, no trailing slash.
3. **Save**, then copy the **Client ID** and **Client secret** into the two Vercel
   variables from step 3

### Consent screen — leave it in Testing for now

Open **APIs & Services → OAuth consent screen**. Keep the publishing status as
**Testing** while the site is on a `.vercel.app` address, and add the Google accounts
that should be able to sign in under **Test users**.

Reason: Google will not accept `vercel.app` as an authorised domain (it is a shared
domain, like `github.io`), which makes publishing awkward. Publishing properly belongs
in Stage 2, once navio.az is in use. Testing mode is fully functional for the accounts
you list.

## 5. 👤 Redeploy

Environment variables only apply to new deployments.

**Deployments** → newest one → **⋯** → **Redeploy**.

The build log should contain `[migrate] miqrasiyalar tətbiq olundu`, meaning the
database tables were created.

## 6. 🤖 Verify

Checks an agent can run against the live site. Replace the address with yours.

```bash
SITE=https://navio.vercel.app

# Google button present on the login page
curl -s $SITE/az/login | grep -c "Google ilə davam et"          # expect 1+

# Forgot-password link correctly hidden while email is off
curl -s $SITE/az/login | grep -c "Şifrəni unutmusunuz"          # expect 0

# Google sign-in starts and returns a Google URL
curl -s -X POST $SITE/api/auth/sign-in/social \
  -H 'Content-Type: application/json' \
  -d '{"provider":"google","callbackURL":"/az"}'
# expect JSON containing accounts.google.com — NOT {"code":"PROVIDER_NOT_FOUND"}

# Scoring works and the database is reachable
curl -s -X POST $SITE/api/score -H 'Content-Type: application/json' \
  -d '{"mode":"bank","input":{"kreditNovu":"naqd","mebleg":"10000","muddət":"24","faiz":"24","gelirNovu":"resmi","gelir":"1500","isStaji":"12_plus","yas":"30","movcudNaqdOdenis":"0","movcudKartLimit":"0","cariGecikmeGun":"0","maks12ay":"0"}}'
# expect "score":100 and a non-null "calculationId"
```

A `calculationId` of `null` means the database is unreachable — recheck step 2 and
that the deploy happened after Neon was connected.

### Confirm scoring internals are not exposed

The point of this change is that the scoring rules stay on the server. In a browser,
open the site, press F12 → **Sources**, and search the JavaScript for
`cashRateOfficialTable` or `bgnTierMidPct`. There should be **no matches**.

---

# Stage 2 — when navio.az and email are ready

## A. 👤 Switch to the real domain

1. Vercel → **Settings → Domains** → add `navio.az` and follow the DNS instructions
2. **Settings → Environment Variables** → change `BETTER_AUTH_URL` and
   `NEXT_PUBLIC_SITE_URL` to `https://navio.az`
3. Google Cloud Console → add the new redirect URI:
   `https://navio.az/api/auth/callback/google`
   (keep the old `.vercel.app` one if you still test there)
4. Redeploy

## B. 👤 Turn on email

1. Vercel → **Integrations** → **Resend** → Add → connect to this project.
   This creates `RESEND_API_KEY` automatically.
2. In the Resend dashboard → **Domains** → **Add Domain** → `navio.az`.
   Add the DNS records it shows (SPF, DKIM, DMARC) to the navio.az DNS, then
   **Verify**. Until this is done Resend only sends to your own address.
3. Vercel → add `EMAIL_FROM` = `Navio <noreply@navio.az>`
4. Redeploy

Confirmation emails and password reset switch on automatically once
`RESEND_API_KEY` is present. No code change needed.

## C. 👤 Publish the Google consent screen

With a real domain, **APIs & Services → OAuth consent screen** → **Publish app**, so
anyone can sign in rather than only listed test users. If it asks for links:

- Privacy policy: `https://navio.az/az/privacy`
- Terms: `https://navio.az/az/disclaimer`

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| No Google button on the login page | `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` missing, or no redeploy since adding them |
| `PROVIDER_NOT_FOUND` from the social endpoint | Same as above |
| Google: "Error 400: redirect_uri_mismatch" | Redirect URI does not exactly match `BETTER_AUTH_URL` |
| Google: "Access blocked" for some people | Consent screen in Testing and that account is not in **Test users** |
| `calculationId` is `null` | Database not connected, or deploy predates it |
| Everyone signed out after a deploy | `BETTER_AUTH_SECRET` changed between deployments |
| Sign-in works on production but not on a preview URL | That preview URL is not registered with Google — expected |

## Notes

- Email verification is optional by design. To make it mandatory once email is on,
  set `requireEmailVerification: true` in `src/lib/auth.ts`.
- Google users never need verification — Google already confirms the address.
- Anonymous calculations are deleted after 7 days; calculations belonging to an
  account are kept until the user deletes them.
- Visitor IPs are never stored in readable form, only as a salted hash for rate
  limiting.
- `.env.example` lists every variable with a short explanation.
