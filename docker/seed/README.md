# Database Seed Scripts

Seed scripts to populate the MongoDB database with test data for development.

## Usage

From the `backend/` directory:

```bash
# Seed the database with test data
npm run seed

# Clear all seed data
npm run seed:clean
```

Make sure MongoDB is running (e.g. via `docker compose up mongodb`) and `MONGODB_URI` is set.

## Test Credentials

### Master Admin
- **Email:** admin@trackit.com
- **Username:** admin
- **Password:** Admin123!
- **Role:** MasterAdmin

### Tech Solutions Inc (NIT: 123456789)
- **Company Admin:** admin1@techsolutions.com / Admin123!
- **Employer:** employer1@techsolutions.com / Employer123!
- **Reseller:** reseller1@techsolutions.com / Reseller123!

### Retail Corp (NIT: 987654321)
- **Company Admin:** admin2@retailcorp.com / Admin123!
- **Employer:** employer2@retailcorp.com / Employer123!
- **Reseller:** reseller2@retailcorp.com / Reseller123!

## Seed Data Summary

- **1** Master Admin
- **2** Companies (Tech Solutions Inc, Retail Corp)
- **6** Users (CompanyAdmin + Employer + Reseller per company)
- **6** Categories (3 per company)
- **6** Inventories (2 company + 1 reseller per company)
- **30** Items across 4 inventories (realistic products with unique serial numbers)

## Structure

```
docker/seed/
├── seed-all.ts          # Main seed script
├── cleanup.ts           # Database cleanup script
├── tsconfig.seed.json   # TypeScript config for seed scripts
├── data/
│   ├── master-admin.ts  # Master admin user data
│   ├── companies.ts     # Company data
│   ├── users.ts         # Users per company (all roles)
│   ├── categories.ts    # Categories per company
│   ├── inventories.ts   # Inventories per company
│   └── items.ts         # Items per inventory
└── utils/
    └── database.ts      # Database connection utilities
```

## Notes

- Scripts are **idempotent** — safe to run multiple times (checks for existing records by unique fields)
- Passwords are hashed with bcrypt before insertion
- Resellers are whitelisted to company inventories automatically
- Category references in items are resolved by name at seed time
