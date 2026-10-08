# TTSpot registration connection

Destination: https://docs.google.com/spreadsheets/d/13CY3EgUu0dLV1n1FwchzOwji7GpveAnVy6iij4YnvCE/edit

The existing form posts to `/api/early-access` on Vercel. That server forwards validated submissions to a secret-protected Google Apps Script. The script writes into a dedicated **Registrations** tab and creates its headers on the first successful submission. Existing tabs are preserved.

## One-time owner setup

1. Sign in as the sheet owner, `team@ttspot.my`. Keep the sheet's general access **Restricted**.
2. Open **Extensions → Apps Script** from the sheet. Paste `integrations/google-sheets/Code.gs` into the script editor and save as **TTSpot registrations**.
3. In **Project Settings → Script properties**, add `SIGNUP_SCRIPT_SECRET`. Use a random secret of at least 32 characters, generated in a password manager. Keep it private.
4. **Deploy → New deployment → Web app**. Execute as the owner; access **Anyone**. Approve the Google permission prompt as the owner. The endpoint accepts writes only with the private secret; it never returns sheet contents. Use the production `/exec` URL, not `/dev`.
5. In the Vercel project's **Settings → Environment Variables**, set these for Production:
   - `SIGNUP_SCRIPT_URL`: the web app `/exec` URL.
   - `SIGNUP_SCRIPT_SECRET`: exactly the same secret as the script property.
6. Redeploy Vercel after setting the variables. No spreadsheet link, credential or secret goes into `dist/` or Git.
7. Submit an explicitly labelled test entry on the live website. Verify the **Registrations** tab contains the entry before announcing that registration is live. `/api/early-access` returning `configured:true` verifies configuration presence only, not Google authorization.

## Captured columns

Submission ID, UTC timestamp, email, region, audience (community/vendor), role, business name, business category, consent, consent wording and source website. No IP address is stored. Phone is required (Malaysian local format or international country code); email-update consent is optional and stored as Yes/No. Only vendor submissions include business details.

## Behavior and operation

- Missing configuration returns 503; the site displays an unavailable message and never claims a registration was saved.
- A success message requires the Google script to flush the row and acknowledge the matching submission ID.
- Retries of the same unchanged form use the same ID. The sheet checks that ID under a script lock to prevent duplicate rows. New submission IDs are rejected when either the normalized email or phone already exists in Registrations; checks and writes share the same lock.
- Formula-like input is escaped before writing. Backend errors do not log form data or secrets.
- A honeypot and origin checks reject basic spam. They do not replace a distributed rate limit or CAPTCHA. Configure a Vercel firewall rate limit for POST `/api/early-access` before a large campaign.
- Keep sheet access limited to authorised team members. Marketing unsubscribe/deletion handling remains an operational responsibility; this integration does not send emails.
- The local static server cannot run Vercel Functions; use `vercel dev` for an end-to-end local backend test. `node --test tests/signup.test.cjs` checks the API and receiver with mocks and does not write real registrations.
- Apps Script updates require a new deployment version. Vercel environment changes require redeployment. Google quotas apply.

References: [Apps Script web apps](https://developers.google.com/apps-script/guides/web), [script locks](https://developers.google.com/apps-script/reference/lock/lock-service), [Vercel Node functions](https://vercel.com/docs/functions/runtimes/node-js).

## Registration v2

After saving Code.gs, run `setupRegistrationSheets` once, then update the existing web-app deployment to a new version (keep its URL and access settings). It appends Phone at column L without replacing old records. Car Enthusiasts, Creators, Club Organisers, Automotive Businesses and General are live FILTER views of the master. Make record corrections in Registrations, not inside the formula views. Existing registrations with no phone retain blank phone cells; email duplicate detection still includes them.

The website requires a phone and displays Congratulations only after a confirmed write. A duplicate returns HTTP 409 with a combined email/phone notice and does not modify the existing record or its subscription consent. Unchecked email updates do not prevent registration or imply marketing permission. This does not send emails or verify phone ownership.
