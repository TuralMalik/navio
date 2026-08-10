# Admin panel: first access and daily use

The admin panel lives at `/admin`. It shows how the site is being used: visits,
scoring submissions, registered users, and the individual events behind those
numbers.

There is **no sign-up form**, on purpose. Anyone who could register would be an
administrator. Accounts are created deliberately, and the first one is created
by the procedure below.

Two-factor authentication is **mandatory** and cannot be turned off. You will
need a phone with an authenticator app (Google Authenticator, 1Password, Authy,
or any other, they all work the same way).

Admin accounts are entirely separate from ordinary site accounts. Signing in to
navio.az as a normal user gives no admin access, and an admin account cannot be
used to sign in to the public site.

---

# Part 1. Creating the first administrator

Do this once, on the live site. It needs no terminal and no database access.

The page that creates the first administrator **closes itself permanently** once
an administrator exists. It cannot be used a second time.

## 1. Generate a one-time password for the setup page

You need a long random string. Any password generator will do, or take this and
change several characters at random:

```
navio-setup-4Kq9wRt2Lm7xZv3Bn6Hs
```

It must be **at least 16 characters**. Shorter values are refused. Keep it to
hand for the next few minutes; it stops being useful straight after.

## 2. Add it to Vercel

1. Open [vercel.com](https://vercel.com) and sign in.
2. Click the **navio** project.
3. Go to **Settings** in the top row, then **Environment Variables** on the left.
4. Add a new variable:

   | Field | Value |
   |---|---|
   | Key | `ADMIN_BOOTSTRAP_TOKEN` |
   | Value | the string from step 1 |
   | Environments | tick **Production** |

5. Press **Save**.

## 3. Redeploy

Environment variables only reach the site on the next deployment.

1. Go to the **Deployments** tab.
2. Open the most recent deployment.
3. Press the **⋯** menu on the right, then **Redeploy**.
4. Wait for it to finish, roughly a minute.

## 4. Open the setup page

In your browser, go to (replacing the part after `token=` with your own string):

```
https://navio.az/admin/bootstrap?token=navio-setup-4Kq9wRt2Lm7xZv3Bn6Hs
```

If you get **404**, see Troubleshooting at the end.

Fill in the form:

- **Email**: the address you will sign in with. It never receives mail, so any
  address you control is fine.
- **Name**: shown in the panel.
- **Password**: **at least 12 characters**. Use a password manager. This
  password cannot be reset by email, because the site sends no email.

Press the button to create the account.

## 5. Save what the next page shows you

This page appears **exactly once**. Nothing on it can be recovered afterwards.

1. **QR code**: open your authenticator app, choose "add account" or "scan QR
   code", and scan it. The app starts producing a 6-digit code that changes
   every 30 seconds. That code is your second factor.
2. **Backup codes**: a list of one-time codes. Each works once, in place of the
   6-digit code. Save them somewhere other than your phone: a password manager,
   or printed and kept somewhere safe. They are what gets you in if your phone
   is lost or replaced.

Do not close this page before both are stored.

## 6. Remove the setup password

The setup page has already closed itself, but leave nothing lying around.

1. Back in Vercel, **Settings → Environment Variables**.
2. Delete `ADMIN_BOOTSTRAP_TOKEN`.
3. No redeploy is needed.

## 7. Check that you can sign in

Go to `https://navio.az/admin`. You should be sent to the sign-in page and need
three things: email, password, and the 6-digit code from your app.

---

# Part 2. Signing in day to day

`https://navio.az/admin`

Three fields:

1. Email
2. Password
3. The 6-digit code from your authenticator app, **or** one of your backup codes

A session lasts **8 hours**, then you sign in again. That is deliberate: this
panel shows other people's financial data, so it should not stay open on a
laptop indefinitely.

## If you lose your phone

Use a backup code in place of the 6-digit code. Each one works once. Once you
are in, ask a developer to reset your second factor, which issues a new QR code
and a new set of backup codes.

If you have lost the phone **and** the backup codes, no one can let you back in
through the interface. A developer has to reset the account against the database
(see Part 4).

---

# Part 3. What is in the panel

| Section | What it answers |
|---|---|
| **Overview** | Visits, sessions, visitors and average time, against the previous period |
| **Activity** | A single feed of everything as it happens: views, clicks, submissions |
| **Scorings** | Every credit check submitted, and what each one produced |
| **Users** | Registered accounts and their history |
| **Pages** | Which pages get traffic and how long people stay |
| **Events** | Which buttons and links are actually being clicked |
| **Sessions** | One visitor's path through the site, in order |
| **Visitors** | Returning visitors, where they arrive from, which country |
| **Raw views** | The unfiltered log, when a number needs checking against reality |

Two things worth knowing when reading these numbers:

- **Bots are excluded** from every figure. They are still recorded, but marked,
  so crawlers do not inflate the totals.
- **The admin panel does not track itself.** Your own clicks in here never
  appear in the statistics.

The panel is in English. The public site is in Azerbaijani.

---

# Part 4. For a developer

## Adding more administrators

The bootstrap page only ever creates the first one. Afterwards, from a machine
with the production `DATABASE_URL`:

```bash
npx dotenv -e .env.local -- node scripts/seed-admin.mjs admin@navio.az "Ad Soyad"
```

The password can be given as a third argument; if it is omitted, a strong one is
generated and printed once. A TOTP secret is always created.

Re-running with an existing email **resets that account**: new password, new
TOTP secret, new backup codes. That is the recovery path for a lost phone.

## Why access is set up this way

- **No sign-up form.** Registration would mean anyone could become an admin.
- **Two factors, always.** The panel exposes other people's income, debts and
  scores. A leaked password alone must not be enough.
- **The bootstrap page checks the table before the token.** On a site that
  already has an administrator it answers 404 rather than reporting that a token
  is missing, which would tell a stranger that the route exists at all.
- **Two independent guards.** A proxy rejects requests with no session cookie
  before the page renders, and every page also verifies the session itself. The
  first alone was not enough: an earlier version returned real data to an
  RSC-style request while signed out.

---

# Troubleshooting

**The setup page returns 404**

One of three things, in order of likelihood:

1. An administrator already exists, so the page has closed permanently. This is
   the intended end state. Use `/admin` to sign in.
2. `ADMIN_BOOTSTRAP_TOKEN` is not set, or the site has not been redeployed since
   it was added. Environment variables only apply from the next deployment.
3. The token in the address does not match the one in Vercel exactly. Watch for
   a trailing space when pasting.

**"Invalid email or password"**

The email is stored lowercase, but is compared case-insensitively, so the case
you type does not matter. If the password is definitely right, the account was
probably re-seeded, which replaces the password.

**The 6-digit code is refused**

Almost always the phone's clock. The code is derived from the current time, so a
clock that is off by more than about half a minute produces wrong codes. Turn on
automatic date and time on the phone. The step either side of now is also
accepted, so drift up to roughly 30 seconds is already tolerated.

**Signed out sooner than expected**

Sessions last 8 hours and are not extended by activity.
