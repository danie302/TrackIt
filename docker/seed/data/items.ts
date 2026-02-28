// Items keyed by inventory name — inventoryId and categoryIds resolved at seed time
export const itemsData: Record<string, Array<{
  name: string;
  brand: string;
  serial: string;
  price: number;
  retailPrice: number;
  categories: string[]; // category names, resolved to IDs at seed time
}>> = {
  'Tech Main Warehouse': [
    { name: 'Laptop Dell XPS 15', brand: 'Dell', serial: 'DELL-XPS-001', price: 1200, retailPrice: 1500, categories: ['Electronics', 'Hardware'] },
    { name: 'Laptop Dell XPS 13', brand: 'Dell', serial: 'DELL-XPS-002', price: 1000, retailPrice: 1250, categories: ['Electronics', 'Hardware'] },
    { name: 'MacBook Pro 14"', brand: 'Apple', serial: 'APPLE-MBP-001', price: 1800, retailPrice: 2200, categories: ['Electronics', 'Hardware'] },
    { name: 'Wireless Mouse MX Master', brand: 'Logitech', serial: 'LOG-MS-001', price: 80, retailPrice: 110, categories: ['Electronics', 'Accessories'] },
    { name: 'Mechanical Keyboard K95', brand: 'Corsair', serial: 'COR-KB-001', price: 150, retailPrice: 200, categories: ['Electronics', 'Accessories'] },
    { name: 'USB-C Hub 7-in-1', brand: 'Anker', serial: 'ANK-HUB-001', price: 35, retailPrice: 50, categories: ['Accessories'] },
    { name: '27" 4K Monitor', brand: 'LG', serial: 'LG-MON-001', price: 400, retailPrice: 550, categories: ['Electronics', 'Hardware'] },
    { name: 'Webcam C920', brand: 'Logitech', serial: 'LOG-WC-001', price: 60, retailPrice: 85, categories: ['Electronics', 'Accessories'] },
  ],
  'Tech Secondary Storage': [
    { name: 'SSD 1TB NVMe', brand: 'Samsung', serial: 'SAM-SSD-001', price: 90, retailPrice: 130, categories: ['Hardware'] },
    { name: 'SSD 2TB NVMe', brand: 'Samsung', serial: 'SAM-SSD-002', price: 160, retailPrice: 220, categories: ['Hardware'] },
    { name: 'RAM DDR5 32GB', brand: 'Corsair', serial: 'COR-RAM-001', price: 120, retailPrice: 170, categories: ['Hardware'] },
    { name: 'Ethernet Cable Cat6 50ft', brand: 'Cable Matters', serial: 'CM-ETH-001', price: 15, retailPrice: 25, categories: ['Accessories'] },
    { name: 'Wireless Headset H390', brand: 'Logitech', serial: 'LOG-HS-001', price: 45, retailPrice: 65, categories: ['Electronics', 'Accessories'] },
    { name: 'Laptop Stand', brand: 'Rain Design', serial: 'RD-STD-001', price: 40, retailPrice: 60, categories: ['Accessories'] },
    { name: 'Power Strip 6-Outlet', brand: 'Belkin', serial: 'BLK-PS-001', price: 20, retailPrice: 30, categories: ['Accessories'] },
  ],
  'Retail Main Warehouse': [
    { name: 'Running Shoes Air Max', brand: 'Nike', serial: 'NK-SH-001', price: 90, retailPrice: 140, categories: ['Footwear'] },
    { name: 'Running Shoes Ultraboost', brand: 'Adidas', serial: 'AD-SH-001', price: 100, retailPrice: 160, categories: ['Footwear'] },
    { name: 'Classic Leather Sneakers', brand: 'Reebok', serial: 'RB-SH-001', price: 60, retailPrice: 95, categories: ['Footwear'] },
    { name: 'Cotton T-Shirt (Black, L)', brand: 'Uniqlo', serial: 'UQ-TS-001', price: 10, retailPrice: 20, categories: ['Clothing'] },
    { name: 'Cotton T-Shirt (White, M)', brand: 'Uniqlo', serial: 'UQ-TS-002', price: 10, retailPrice: 20, categories: ['Clothing'] },
    { name: 'Denim Jeans Slim Fit', brand: 'Levi\'s', serial: 'LV-JN-001', price: 40, retailPrice: 70, categories: ['Clothing'] },
    { name: 'Leather Belt (Brown)', brand: 'Tommy Hilfiger', serial: 'TH-BL-001', price: 25, retailPrice: 45, categories: ['Accessories'] },
    { name: 'Sports Watch', brand: 'Casio', serial: 'CS-WT-001', price: 35, retailPrice: 55, categories: ['Accessories'] },
  ],
  'Retail Downtown Store': [
    { name: 'Winter Jacket (Black, L)', brand: 'North Face', serial: 'NF-JK-001', price: 120, retailPrice: 200, categories: ['Clothing'] },
    { name: 'Hiking Boots', brand: 'Timberland', serial: 'TB-BT-001', price: 110, retailPrice: 180, categories: ['Footwear'] },
    { name: 'Canvas Backpack', brand: 'Herschel', serial: 'HS-BP-001', price: 45, retailPrice: 75, categories: ['Accessories'] },
    { name: 'Wool Scarf', brand: 'Burberry', serial: 'BB-SC-001', price: 80, retailPrice: 150, categories: ['Accessories', 'Clothing'] },
    { name: 'Polo Shirt (Navy, M)', brand: 'Ralph Lauren', serial: 'RL-PS-001', price: 50, retailPrice: 90, categories: ['Clothing'] },
    { name: 'Running Shorts', brand: 'Under Armour', serial: 'UA-SH-001', price: 25, retailPrice: 45, categories: ['Clothing'] },
    { name: 'Sunglasses Aviator', brand: 'Ray-Ban', serial: 'RB-SG-001', price: 90, retailPrice: 160, categories: ['Accessories'] },
  ],
};
