import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from './utils/database';
import { masterAdminData } from './data/master-admin';
import { companiesData } from './data/companies';
import { usersData } from './data/users';
import { categoriesData } from './data/categories';
import { inventoriesData } from './data/inventories';
import { itemsData } from './data/items';

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function seedMasterAdmin(db: mongoose.Connection['db']): Promise<void> {
  if (!db) throw new Error('Database not connected');
  const collection = db.collection('users');

  const existing = await collection.findOne({ email: masterAdminData.email });
  if (existing) {
    console.log('  Master Admin already exists, skipping');
    return;
  }

  await collection.insertOne({
    ...masterAdminData,
    password: await hashPassword(masterAdminData.password),
    created_at: new Date(),
    updated_at: new Date(),
  });
  console.log('  Master Admin created');
}

async function seedCompanies(db: mongoose.Connection['db']): Promise<Map<string, mongoose.Types.ObjectId>> {
  if (!db) throw new Error('Database not connected');
  const collection = db.collection('companies');
  const companyMap = new Map<string, mongoose.Types.ObjectId>();

  for (const company of companiesData) {
    const existing = await collection.findOne({ nit: company.nit });
    if (existing) {
      console.log(`  Company "${company.name}" already exists, skipping`);
      companyMap.set(company.name, existing._id as mongoose.Types.ObjectId);
      continue;
    }

    const result = await collection.insertOne({
      ...company,
      created_at: new Date(),
      updated_at: new Date(),
    });
    companyMap.set(company.name, result.insertedId as mongoose.Types.ObjectId);
    console.log(`  Company "${company.name}" created`);
  }

  return companyMap;
}

async function seedUsers(
  db: mongoose.Connection['db'],
  companyMap: Map<string, mongoose.Types.ObjectId>,
): Promise<Map<string, mongoose.Types.ObjectId>> {
  if (!db) throw new Error('Database not connected');
  const collection = db.collection('users');
  const userMap = new Map<string, mongoose.Types.ObjectId>(); // email -> _id

  for (const [companyName, users] of Object.entries(usersData)) {
    const companyId = companyMap.get(companyName);
    if (!companyId) {
      console.log(`  Company "${companyName}" not found, skipping users`);
      continue;
    }

    for (const user of users) {
      const existing = await collection.findOne({ email: user.email });
      if (existing) {
        console.log(`  User "${user.email}" already exists, skipping`);
        userMap.set(user.email, existing._id as mongoose.Types.ObjectId);
        continue;
      }

      const result = await collection.insertOne({
        ...user,
        password: await hashPassword(user.password),
        companyId,
        created_at: new Date(),
        updated_at: new Date(),
      });
      userMap.set(user.email, result.insertedId as mongoose.Types.ObjectId);
      console.log(`  User "${user.email}" (${user.role}) created`);
    }
  }

  return userMap;
}

async function seedCategories(
  db: mongoose.Connection['db'],
  companyMap: Map<string, mongoose.Types.ObjectId>,
): Promise<Map<string, mongoose.Types.ObjectId>> {
  if (!db) throw new Error('Database not connected');
  const collection = db.collection('categories');
  const categoryMap = new Map<string, mongoose.Types.ObjectId>(); // "companyName:categoryName" -> _id

  for (const [companyName, categories] of Object.entries(categoriesData)) {
    const companyId = companyMap.get(companyName);
    if (!companyId) continue;

    for (const categoryName of categories) {
      const key = `${companyName}:${categoryName}`;
      const existing = await collection.findOne({ name: categoryName, companyId });
      if (existing) {
        console.log(`  Category "${categoryName}" for "${companyName}" already exists, skipping`);
        categoryMap.set(key, existing._id as mongoose.Types.ObjectId);
        continue;
      }

      const result = await collection.insertOne({
        name: categoryName,
        companyId,
        created_at: new Date(),
        updated_at: new Date(),
      });
      categoryMap.set(key, result.insertedId as mongoose.Types.ObjectId);
      console.log(`  Category "${categoryName}" created for "${companyName}"`);
    }
  }

  return categoryMap;
}

async function seedInventories(
  db: mongoose.Connection['db'],
  companyMap: Map<string, mongoose.Types.ObjectId>,
  userMap: Map<string, mongoose.Types.ObjectId>,
): Promise<Map<string, mongoose.Types.ObjectId>> {
  if (!db) throw new Error('Database not connected');
  const collection = db.collection('inventories');
  const inventoryMap = new Map<string, mongoose.Types.ObjectId>(); // name -> _id

  for (const [companyName, inventories] of Object.entries(inventoriesData)) {
    const companyId = companyMap.get(companyName);
    if (!companyId) continue;

    for (const inv of inventories) {
      const existing = await collection.findOne({ name: inv.name, companyId });
      if (existing) {
        console.log(`  Inventory "${inv.name}" already exists, skipping`);
        inventoryMap.set(inv.name, existing._id as mongoose.Types.ObjectId);
        continue;
      }

      const resellerId = inv.resellerEmail ? userMap.get(inv.resellerEmail) : null;
      // For company inventories, whitelist the resellers
      const whitelist: mongoose.Types.ObjectId[] = [];
      if (!inv.isResellerInventory) {
        // Add resellers from the same company to the whitelist
        const companyUsers = usersData[companyName as keyof typeof usersData] || [];
        for (const user of companyUsers) {
          if (user.role === 'Reseller') {
            const resId = userMap.get(user.email);
            if (resId) whitelist.push(resId);
          }
        }
      }

      const result = await collection.insertOne({
        name: inv.name,
        companyId,
        resellerId: resellerId || null,
        isResellerInventory: inv.isResellerInventory,
        categories: [],
        whitelist,
        created_at: new Date(),
        updated_at: new Date(),
      });
      inventoryMap.set(inv.name, result.insertedId as mongoose.Types.ObjectId);
      console.log(`  Inventory "${inv.name}" created`);
    }
  }

  return inventoryMap;
}

async function seedItems(
  db: mongoose.Connection['db'],
  inventoryMap: Map<string, mongoose.Types.ObjectId>,
  categoryMap: Map<string, mongoose.Types.ObjectId>,
  companyMap: Map<string, mongoose.Types.ObjectId>,
): Promise<void> {
  if (!db) throw new Error('Database not connected');
  const collection = db.collection('items');

  // Build a reverse map: inventoryName -> companyName
  const invToCompany = new Map<string, string>();
  for (const [companyName, inventories] of Object.entries(inventoriesData)) {
    for (const inv of inventories) {
      invToCompany.set(inv.name, companyName);
    }
  }

  for (const [inventoryName, items] of Object.entries(itemsData)) {
    const inventoryId = inventoryMap.get(inventoryName);
    if (!inventoryId) continue;

    const companyName = invToCompany.get(inventoryName) || '';

    for (const item of items) {
      const existing = await collection.findOne({ serial: item.serial });
      if (existing) {
        console.log(`  Item "${item.serial}" already exists, skipping`);
        continue;
      }

      // Resolve category names to IDs
      const categoryIds = item.categories
        .map((catName) => categoryMap.get(`${companyName}:${catName}`))
        .filter(Boolean) as mongoose.Types.ObjectId[];

      await collection.insertOne({
        name: item.name,
        brand: item.brand,
        serial: item.serial,
        price: item.price,
        retailPrice: item.retailPrice,
        inventoryId,
        categories: categoryIds,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
    console.log(`  ${items.length} items created for "${inventoryName}"`);
  }
}

async function seed(): Promise<void> {
  await connectDatabase();
  const db = mongoose.connection.db;

  console.log('\n--- Seeding Master Admin ---');
  await seedMasterAdmin(db);

  console.log('\n--- Seeding Companies ---');
  const companyMap = await seedCompanies(db);

  console.log('\n--- Seeding Users ---');
  const userMap = await seedUsers(db, companyMap);

  console.log('\n--- Seeding Categories ---');
  const categoryMap = await seedCategories(db, companyMap);

  console.log('\n--- Seeding Inventories ---');
  const inventoryMap = await seedInventories(db, companyMap, userMap);

  console.log('\n--- Seeding Items ---');
  await seedItems(db, inventoryMap, categoryMap, companyMap);

  console.log('\n--- Seeding Complete! ---\n');
  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error('Seeding failed:', error);
  await disconnectDatabase();
  process.exit(1);
});
