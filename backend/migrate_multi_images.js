require('dotenv').config();
const db = require('./config/db');

// High Quality Unsplash image pools grouped by category with 4 distinct pose/angle images per item
const POSE_IMAGES_BY_CATEGORY = {
  'Men T-Shirts': [
    ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80", "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80"],
    ["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80", "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"],
  ],
  'Oversized Tees': [
    ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80", "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80"],
  ],
  'Casual Shirts': [
    ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80", "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80", "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80"],
  ],
  'Sneakers': [
    ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80", "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&q=80", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80"],
  ],
  'Dresses': [
    ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80", "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80", "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"],
  ],
  'Women Sarees': [
    ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80"],
  ],
  'Watches': [
    ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80", "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80", "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80", "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80"],
  ],
  'Handbags': [
    ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80"],
  ]
};

// Generates 4 unique high-quality pose/angle URLs given a primary image and item metadata
function generateUniquePoses(primaryImg, category, index) {
  const poses = [primaryImg];

  // Try retrieving preset pose set if available
  const preset = POSE_IMAGES_BY_CATEGORY[category];
  if (preset && preset[index % preset.length]) {
    const list = preset[index % preset.length];
    for (const url of list) {
      if (!poses.includes(url) && poses.length < 4) {
        poses.push(url);
      }
    }
  }

  // Fallback high-res distinct pose URLs from curated fashion pool
  const curatedFallbackPool = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80",
    "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=800&q=80",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80",
    "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=800&q=80",
    "https://images.unsplash.com/photo-1564257631407-4deb12544e89?w=800&q=80",
    "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
    "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80",
    "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80",
    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
    "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80"
  ];

  let poolIdx = (index * 3) % curatedFallbackPool.length;
  while (poses.length < 4) {
    const candidate = curatedFallbackPool[poolIdx % curatedFallbackPool.length];
    if (!poses.includes(candidate)) {
      poses.push(candidate);
    }
    poolIdx++;
  }

  return poses;
}

// Category cover images matching screenshot categories
const CATEGORY_IMAGES = {
  'Fashion': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
  'Beauty': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
  'Footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  'Homeliving': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  'Accessories': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
  'Men T-Shirts': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80',
  'Women Sarees': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80',
  'Casual Shirts': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
  'Sneakers': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80',
  'Dresses': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
  'Watches': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&q=80',
  'Handbags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
  'Makeup': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80',
  'Fragrances': 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&q=80'
};

async function migrateMultiImages() {
  try {
    console.log('📦 Starting Database Migration for Multi-Pose Product Images & Category Covers...');

    // 1. Add `images` column to `products` table if not exists
    const [prodCols] = await db.query('SHOW COLUMNS FROM products');
    const hasImagesCol = prodCols.some(c => c.Field === 'images');
    if (!hasImagesCol) {
      await db.query('ALTER TABLE products ADD COLUMN images TEXT DEFAULT NULL AFTER image_url');
      console.log('✅ Added `images` column to `products` table.');
    }

    // 2. Add `image_url` column to `categories` table if not exists
    const [catCols] = await db.query('SHOW COLUMNS FROM categories');
    const hasCatImgCol = catCols.some(c => c.Field === 'image_url');
    if (!hasCatImgCol) {
      await db.query('ALTER TABLE categories ADD COLUMN image_url VARCHAR(500) DEFAULT NULL');
      console.log('✅ Added `image_url` column to `categories` table.');
    }

    // 3. Fetch all products and populate unique multi-pose images array
    const [products] = await db.query('SELECT id, title, category, image_url, images FROM products');
    let updatedProducts = 0;

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      let currentImages = [];
      try {
        if (p.images) currentImages = JSON.parse(p.images);
      } catch {
        currentImages = [];
      }

      // Generate 4 distinct pose URLs if not present or less than 3
      if (!Array.isArray(currentImages) || currentImages.length < 3) {
        const poseList = generateUniquePoses(p.image_url, p.category, i);
        const poseJson = JSON.stringify(poseList);
        await db.query('UPDATE products SET images = ? WHERE id = ?', [poseJson, p.id]);
        updatedProducts++;
      }
    }
    console.log(`✅ Updated ${updatedProducts} products with unique multi-pose images (min 4 distinct poses/angles per product).`);

    // 4. Update category cover images
    const [categories] = await db.query('SELECT id, name FROM categories');
    let updatedCategories = 0;

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const img = CATEGORY_IMAGES[cat.name] || `https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80`;
      await db.query('UPDATE categories SET image_url = ? WHERE id = ?', [img, cat.id]);
      updatedCategories++;
    }
    console.log(`✅ Updated ${updatedCategories} categories with cover images.`);

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateMultiImages();
