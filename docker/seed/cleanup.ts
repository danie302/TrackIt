import { connectDatabase, disconnectDatabase, clearCollection } from './utils/database';

const COLLECTIONS_TO_CLEAR = [
  'items',
  'inventories',
  'categories',
  'users',
  'companies',
  'orderrequests',
  'audits',
];

async function cleanup(): Promise<void> {
  await connectDatabase();

  console.log('\n--- Cleaning up database ---');
  for (const collection of COLLECTIONS_TO_CLEAR) {
    await clearCollection(collection);
  }

  console.log('\n--- Cleanup Complete! ---\n');
  await disconnectDatabase();
}

cleanup().catch(async (error) => {
  console.error('Cleanup failed:', error);
  await disconnectDatabase();
  process.exit(1);
});
