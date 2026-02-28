// Inventories keyed by company name — companyId and resellerId resolved at seed time
export const inventoriesData: Record<string, Array<{
  name: string;
  isResellerInventory: boolean;
  resellerEmail?: string; // used to resolve resellerId
}>> = {
  'Tech Solutions Inc': [
    {
      name: 'Tech Main Warehouse',
      isResellerInventory: false,
    },
    {
      name: 'Tech Secondary Storage',
      isResellerInventory: false,
    },
    {
      name: 'Tech Reseller Inventory',
      isResellerInventory: true,
      resellerEmail: 'reseller1@techsolutions.com',
    },
  ],
  'Retail Corp': [
    {
      name: 'Retail Main Warehouse',
      isResellerInventory: false,
    },
    {
      name: 'Retail Downtown Store',
      isResellerInventory: false,
    },
    {
      name: 'Retail Reseller Inventory',
      isResellerInventory: true,
      resellerEmail: 'reseller2@retailcorp.com',
    },
  ],
};
