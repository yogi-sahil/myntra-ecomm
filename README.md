# Myntra E-commerce Store

A React/Vite storefront with an Express, MySQL, and Razorpay backend. The project includes customer cart, wishlist, checkout, profiles, and a protected admin panel.

## Requirements

- Node.js 20 or newer
- MySQL 8
- Fresh Razorpay test or live credentials

## Local setup

1. Install frontend and backend dependencies:

   ```bash
   npm install
   npm --prefix backend install
   ```

2. Create the backend environment file:

   ```bash
   cp backend/.env.example backend/.env
   ```

3. Replace every placeholder in `backend/.env`. Generate the JWT secret with:

   ```bash
   openssl rand -hex 32
   ```

4. Initialize the database and run the existing migrations as needed, then run the secure-checkout migration:

   ```bash
   node backend/db-init.js
   node backend/migrate.js
   node backend/migrate_size.js
   node backend/migrate_size_index.js
   node backend/migrate_addresses.js
   node backend/migrate_coupons.js
   node backend/migrate_categories_settings.js
   node backend/migrate_admin_v2.js
   npm --prefix backend run migrate:secure
   ```

5. Create an admin only after setting `ADMIN_SEED_EMAIL` and a strong one-time `ADMIN_SEED_PASSWORD` in `backend/.env`:

   ```bash
   node backend/seed-admin.js
   ```

6. Start the API and frontend together:

   ```bash
   npm run dev
   ```

The development launcher starts the API first, waits for its health check, and
then starts Vite. Vite proxies `/api` and `/uploads` to
`http://127.0.0.1:8999`, keeping the HttpOnly session cookie same-origin. When
`JWT_SECRET` is not exported in the shell, the launcher uses an ephemeral secret
for that local session only; production still requires an explicit strong
secret.

## Required production configuration

- Set `NODE_ENV=production`.
- Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` to the production
  MySQL credentials. For a MySQL server on the same Hostinger application,
  use `DB_HOST=127.0.0.1` instead of `localhost` so Node does not resolve the
  connection to IPv6 `::1`. `VITE_API_URL` alone does not configure the
  backend database connection.
- Set a unique `JWT_SECRET` with at least 32 random characters.
- Rotate any Razorpay credential that has ever appeared in Git history, then set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
- Set `TRUST_PROXY=true` only when exactly one trusted reverse proxy is in front of Node.
- Keep `CORS_ORIGINS` empty for a same-origin deployment. If the frontend is on another origin, list only the exact HTTPS origins.
- Serve the app exclusively over HTTPS so the `Secure` HttpOnly cookie is enforced.
- Run `npm --prefix backend run migrate:secure` before deploying the new checkout code.

Payment credentials are intentionally unavailable in the admin UI and are never sent to the browser. The backend returns only the public Razorpay key ID while creating a payment order.

## Production database and catalog seed

A versioned snapshot of the verified local cosmetics catalog ships with the
application. On the first production startup for that catalog version, the
server automatically applies the required catalog columns and syncs exactly 20
categories and 120 products before accepting traffic.

Legacy products that are not referenced by orders are deleted. Products that
are referenced by old orders are retained only as hidden `Archived` rows so
order history is not destroyed. Legacy cart and wishlist references are
removed. A successful catalog version is recorded, so later restarts skip the
sync and do not depend on an external product website.

For Hostinger, deploy the repository as a server-side Node application using
the repository root, `npm run build` as the build command, and
`backend/server.js` as the entry file (or `npm start` as the start command).
The root install automatically installs the backend's production dependencies,
builds the React frontend, and Express serves both that build and `/api` from
one origin. Set `VITE_API_URL=/api`; `CORS_ORIGINS` should be omitted or empty
for this same-origin setup.

## Checkout security model

- Payment and COD routes require a valid session.
- User identity comes from the signed session, never the request body.
- Product prices, coupons, shipping fees, and totals are calculated from MySQL.
- The Razorpay order stores an HMAC binding for the user, cart, coupon, and amount.
- Verification checks the Razorpay signature, paid amount, user, and cart binding.
- Order creation, payment recording, stock reduction, and cart clearing share one database transaction.
- Provider payment IDs are unique, preventing duplicate order creation.

## Quality checks

Run the full local verification:

```bash
npm run check
```

This runs Oxlint, backend unit tests, and the production Vite build.

## Credential incident response

Removing a key from the current files does not remove it from Git history. Revoke/rotate exposed Razorpay keys in the Razorpay dashboard. If the repository was shared or deployed with the old JWT fallback, replace `JWT_SECRET` so all previously issued or forged sessions become invalid.
