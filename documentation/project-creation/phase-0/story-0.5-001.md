# Story 0.5-001: Create Database Seed Scripts

## Metadata
- **Category:** Infrastructure
- **Priority:** Medium
- **Estimated Effort:** 4 hours
- **Dependencies:** Story 0.3-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Create seed scripts to populate the database with initial test data for development, including Master Admin, test companies, users, inventories, and items.

## Tasks
1. Create `docker/seed/` directory structure
2. Create seed script for Master Admin user
3. Create seed script for test companies
4. Create seed script for test users (all roles)
5. Create seed script for test inventories and items
6. Create master seed script (`seed-all.ts`) that runs all seeds in order
7. Create cleanup script (`cleanup.ts`) to reset database
8. Document seed data credentials in `docker/seed/README.md`

## Acceptance Criteria
- Seed script creates Master Admin user successfully
- Seed script creates 2-3 test companies with complete data
- Seed script creates sample inventories with items and categories
- All users have known passwords for testing
- Cleanup script removes all seed data cleanly
- Seed scripts are idempotent (can run multiple times safely)
- Seed data includes realistic test scenarios

## Technical Notes

### Directory Structure
```
docker/seed/
├── README.md
├── seed-all.ts
├── cleanup.ts
├── data/
│   ├── master-admin.ts
│   ├── companies.ts
│   ├── users.ts
│   ├── categories.ts
│   ├── inventories.ts
│   └── items.ts
└── utils/
    └── database.ts
```

### Seed Data Structure

**Master Admin:**
- Username: `admin`
- Email: `admin@trackit.com`
- Password: `Admin123!`
- Role: MasterAdmin
- CompanyId: "admin"

**Company 1 - Tech Solutions Inc:**
- NIT: `123456789`
- Admin: `admin1@techsolutions.com` / `Admin123!`
- Employer: `employer1@techsolutions.com` / `Employer123!`
- Reseller: `reseller1@techsolutions.com` / `Reseller123!`
- 2 inventories with 15 items each
- Categories: Electronics, Accessories, Hardware

**Company 2 - Retail Corp:**
- NIT: `987654321`
- Admin: `admin2@retailcorp.com` / `Admin123!`
- Employer: `employer2@retailcorp.com` / `Employer123!`
- Reseller: `reseller2@retailcorp.com` / `Reseller123!`
- 2 inventories with 15 items each
- Categories: Clothing, Footwear, Accessories

### Sample Items Data
```typescript
const sampleItems = [
  {
    name: 'Laptop Dell XPS 15',
    brand: 'Dell',
    serial: 'DELL-XPS-001',
    price: 1200.00,
    retailPrice: 1500.00,
    categories: ['Electronics', 'Hardware']
  },
  {
    name: 'Wireless Mouse',
    brand: 'Logitech',
    serial: 'LOG-MS-001',
    price: 25.00,
    retailPrice: 35.00,
    categories: ['Electronics', 'Accessories']
  },
  // ... more items
];
```

### Seed Script Example
```typescript
// seed-all.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  console.log('🌱 Starting database seeding...');
  
  // 1. Seed Master Admin
  console.log('Creating Master Admin...');
  await seedMasterAdmin(app);
  
  // 2. Seed Companies
  console.log('Creating companies...');
  await seedCompanies(app);
  
  // 3. Seed Users
  console.log('Creating users...');
  await seedUsers(app);
  
  // 4. Seed Categories
  console.log('Creating categories...');
  await seedCategories(app);
  
  // 5. Seed Inventories
  console.log('Creating inventories...');
  await seedInventories(app);
  
  // 6. Seed Items
  console.log('Creating items...');
  await seedItems(app);
  
  console.log('✅ Database seeding completed!');
  await app.close();
}

seed().catch(error => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
```

## Testing Requirements
- Test seed-all script runs without errors
- Test all entities are created correctly
- Test passwords are hashed properly
- Test relationships are established correctly
- Test cleanup script removes all seed data
- Test idempotency (running twice doesn't create duplicates)

## Documentation Requirements
- Create `docker/seed/README.md` with:
  - How to run seed scripts
  - List of all test credentials
  - Description of seed data
  - How to run cleanup

## Related Files
- `docker/seed/seed-all.ts` (create)
- `docker/seed/cleanup.ts` (create)
- `docker/seed/data/*.ts` (create)
- `docker/seed/README.md` (create)
- `package.json` (add seed scripts)

## Notes
- Seed scripts should connect to MongoDB directly or use NestJS application context
- Make scripts runnable with: `npm run seed` and `npm run seed:clean`
- All passwords use same format for easy testing: `{Role}123!`
- Serial numbers should be realistic and unique
- Whitelist resellers to appropriate company inventories for testing order flow
- Include a variety of items with different price ranges
- Seed data should support testing all user stories
