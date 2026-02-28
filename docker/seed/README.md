# Docker seed data

This folder holds **seed data scripts** used to populate the database (e.g. MongoDB) for development, testing, or initial setup.

## Purpose

- Populate the database with initial or sample data when bringing up containers (e.g. via `docker/scripts/`).
- Provide repeatable seed data for local development and test environments.

## Usage

- Scripts here are typically invoked by the scripts in `docker/scripts/` (e.g. after containers are running).
- Use the same stack as the app: e.g. **MongoDB** seed scripts (Node/TS with Mongoose, or JSON/BSON that you import via `mongoimport` or a small runner).

## Adding seed scripts

1. Add scripts in this folder (e.g. `users.seed.ts`, `companies.seed.json`, or a single `run-seed.ts` that loads others).
2. Document how to run them in the main `docker/README.md` (e.g. `npm run seed` or `node docker/seed/run-seed.js`).
3. Keep secrets out of seed files; use env vars or `.env` for any sensitive data.

## Notes

- Do not commit real production data or secrets.
- Seed data should be idempotent where possible (e.g. check existence before insert) so re-running is safe.
