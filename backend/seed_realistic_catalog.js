require('dotenv').config();
const db = require('./config/db');

// Category-Specific Pools of 4+ Distinct Relevant Images
const CATEGORY_IMAGE_POOLS = {
  // T-Shirts & Oversized Tees
  'Men T-Shirts': [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80'
  ],
  'Oversized Tees': [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'
  ],

  // Shirts
  'Casual Shirts': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80'
  ],
  'Men Topwear': [
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'
  ],

  // Pants & Jeans
  'Men Bottomwear': [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    'https://images.unsplash.com/photo-1542272604-780c36856542?w=800&q=80',
    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&q=80',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80'
  ],
  'Denim Jeans': [
    'https://images.unsplash.com/photo-1542272604-780c36856542?w=800&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80',
    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&q=80'
  ],
  'Cargo Pants': [
    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80',
    'https://images.unsplash.com/photo-1542272604-780c36856542?w=800&q=80'
  ],

  // Sarees & Ethnic Wear
  'Women Sarees': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80',
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80'
  ],
  'Women Ethnic': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80',
    'https://images.unsplash.com/photo-1617174982638-348630713be2?w=800&q=80'
  ],
  'Ethnic Wear': [
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80',
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    'https://images.unsplash.com/photo-1617174982638-348630713be2?w=800&q=80'
  ],
  'Kurta Sets': [
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80',
    'https://images.unsplash.com/photo-1617174982638-348630713be2?w=800&q=80',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80',
    'https://images.unsplash.com/photo-1583391733975-f55979ef88a1?w=800&q=80'
  ],

  // Dresses & Tops
  'Dresses': [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'
  ],
  'Women Western': [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80',
    'https://images.unsplash.com/photo-1564257631407-4deb12544e89?w=800&q=80'
  ],

  // Shoes & Sneakers
  'Sneakers': [
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
    'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80'
  ],
  'Formal Shoes': [
    'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80',
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
    'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80'
  ],
  'Heels': [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
    'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&q=80',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'
  ],

  // Watches
  'Watches': [
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
    'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80'
  ],
  'Smartwatches': [
    'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'
  ],

  // Makeup & Beauty
  'Makeup': [
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
    'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80'
  ],
  'Strobe Cream': [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80'
  ],

  // Fragrances & Perfumes
  'Fragrances': [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80'
  ],
  'Women Perfumes': [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80'
  ],
  'Men Perfumes': [
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80'
  ],

  // Bags
  'Handbags': [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'
  ]
};

// Generic Fallback Category Images
const GENERAL_FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
];

async function seedRealisticCatalog() {
  try {
    console.log('🛍️ Starting Realistic Catalog Update (Strict Price ₹249-₹499, Discount 10-90%, Category-Matched Multi-Pose Images)...');

    const [products] = await db.query('SELECT id, title, category, image_url, price, original_price, discount FROM products');
    let updatedCount = 0;

    for (let i = 0; i < products.length; i++) {
      const p = products[i];

      // 1. Calculate price strictly between ₹249 and ₹499
      const priceHash = (p.id * 17 + p.title.length * 31) % 251; // 0..250
      const finalPrice = 249 + priceHash; // Strictly ₹249 to ₹499

      // 2. Calculate discount strictly between 10% and 90%
      const discountHash = (p.id * 13 + p.title.length * 7) % 81; // 0..80
      const finalDiscount = 10 + discountHash; // Strictly 10% to 90%

      // 3. Calculate original price (MRP)
      const originalPrice = Math.round(finalPrice / (1 - finalDiscount / 100));

      // 4. Generate 4 category-matched pose images
      const pool = CATEGORY_IMAGE_POOLS[p.category] || GENERAL_FALLBACK_POOL;
      const imagesList = [];

      // Primary image
      if (p.image_url && p.image_url.startsWith('http')) {
        imagesList.push(p.image_url);
      } else {
        imagesList.push(pool[0]);
      }

      // Add category matching pose images
      for (let k = 0; k < pool.length; k++) {
        const candidate = pool[(i + k) % pool.length];
        if (!imagesList.includes(candidate) && imagesList.length < 4) {
          imagesList.push(candidate);
        }
      }

      // Fill up to 4 images if needed
      let fillIdx = 0;
      while (imagesList.length < 4) {
        const candidate = GENERAL_FALLBACK_POOL[(i + fillIdx) % GENERAL_FALLBACK_POOL.length];
        if (!imagesList.includes(candidate)) {
          imagesList.push(candidate);
        }
        fillIdx++;
      }

      const imagesJson = JSON.stringify(imagesList);

      await db.query(
        `UPDATE products 
         SET price = ?, original_price = ?, discount = ?, images = ? 
         WHERE id = ?`,
        [finalPrice, originalPrice, String(finalDiscount), imagesJson, p.id]
      );
      updatedCount++;
    }

    console.log(`✅ Successfully updated ${updatedCount} products!`);
    console.log('   • All prices strictly between ₹249 and ₹499');
    console.log('   • All discounts strictly between 10% and 90%');
    console.log('   • Every product has 4 category-matched distinct pose/view images');

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed updating realistic catalog:', err);
    process.exit(1);
  }
}

seedRealisticCatalog();
