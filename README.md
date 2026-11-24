# Forum API

Express and PostgreSQL forum API using domain, use-case, infrastructure, and HTTP-interface layers.

## Local setup

1. Use Node.js 22 and PostgreSQL. Create the application and test databases.
2. Copy `.env.example` to `.env`, set database credentials and generate distinct token secrets. Set `NODE_ENV=production` in the server's production `.env`.
3. Apply migrations with `npm run migrate up`.
4. Start the API with `npm start` (default port `5000`).
5. To run tests, set `NODE_ENV=test` and PostgreSQL connection variables for a separate test database, apply migrations to it, then run `npm run test:coverage`.

## GitHub Actions

- Add a temporary failing assertion in a test, push a feature branch, and open a PR to `main` or `master`. Confirm the CI run fails, then remove only that temporary assertion, push the fix, and confirm the same PR has a successful CI run. Do not merge while the required checks are failing.
- Add repository secrets `SSH_HOST`, `SSH_USER`, `SSH_KEY`, and `SSH_PORT`. Prepare the server checkout at `/var/www/forum-api`, configure its production `.env`, install Node.js 22 and PM2, and configure database access. A push to `main` or `master` pulls changes, migrates, and restarts the PM2 process.

## EC2, NGINX, and HTTPS

1. Allow inbound SSH, HTTP (80), and HTTPS (443) in the EC2 security group. Point `dcdg.xyz` (or replace the `server_name` and certificate paths in `nginx.conf`) to the instance.
2. Install Node.js 22, PostgreSQL client/server as required, PM2, NGINX, and Certbot. Configure the application in `/var/www/forum-api/.env`; keep secrets out of source control.
3. Create `/var/www/certbot`. Before the first certificate is issued, temporarily disable the HTTPS server block in `nginx.conf`; install its HTTP server block in NGINX, validate, and reload.
4. Run `sudo certbot certonly --webroot -w /var/www/certbot -d dcdg.xyz -d www.dcdg.xyz`. Restore the HTTPS server block after the certificate paths exist, validate with `sudo nginx -t`, reload NGINX, and configure Certbot renewal.

NGINX proxies to Express on port 5000 and restricts `/threads` and its subpaths to 90 requests per minute per client IP. Express trusts one proxy hop for accurate client IP handling.

## ZIP checklist

- Include source, migrations, tests, workflows, `package.json`, `package-lock.json`, `.env.example`, README, and `nginx.conf`.
- Exclude `node_modules`, `.env`, coverage output, and generated or local database files.
- Run lint, migrations against a clean database, and the full test suite before packaging.
