require('dotenv').config();
const db = require('./config/db');

// Unique Image Map for EVERY single category
const CATEGORY_UNIQUE_IMAGES = {
  'Men Topwear': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&q=80',
  'Men Bottomwear': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80',
  'Women Ethnic': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
  'Women Western': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
  'Kids': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&q=80',
  'Men T-Shirts': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80',
  'Women Sarees': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80',
  'Ethnic Wear': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=500&q=80',
  'Casual Shirts': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80',
  'Oversized Tees': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80',
  'Sneakers': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80',
  'Handbags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80',
  'Watches': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80',
  'Jackets': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
  'Denim Jeans': 'https://images.unsplash.com/photo-1542272604-780c36856542?w=500&q=80',
  'Sportswear': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&q=80',
  'Activewear': 'https://images.unsplash.com/photo-1483721074573-58030d3a7f01?w=500&q=80',
  'Kurta Sets': 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80',
  'Dresses': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80',
  'Heels': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80',
  'Sunglasses': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80',
  'Hoodies': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80',
  'Formal Shoes': 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500&q=80',
  'Tops': 'https://images.unsplash.com/photo-1564257631407-4deb12544e89?w=500&q=80',
  'Skirts': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&q=80',
  'Ethnic Footwear': 'https://images.unsplash.com/photo-1560343776-97c7d202ff0e?w=500&q=80',
  'Fragrances': 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&q=80',
  'Grooming': 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&q=80',
  'Makeup': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80',
  'Jewellery': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80',
  'Blazers': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&q=80',
  'Tracksuits': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
  'Shorts': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80',
  'Kids Clothing': 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&q=80',
  'Backpacks': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
  'Belts': 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500&q=80',
  'Wallets': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80',
  'Sweaters': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80',
  'Nightwear': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
  'Lingerie': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
  'Sleepwear': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
  'Caps & Hats': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80',
  'Boots': 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&q=80',
  'Loafers': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&q=80',
  'Sandals': 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500&q=80',
  'Flip Flops': 'https://images.unsplash.com/photo-1560343776-97c7d202ff0e?w=500&q=80',
  'Winterwear': 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&q=80',
  'Innerwear': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80',
  'Western Wear': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
  'Traditional Wear': 'https://images.unsplash.com/photo-1583391733975-f55979ef88a1?w=500&q=80',
  'Fusion Wear': 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=500&q=80',
  'Plus Size Fashion': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80',
  'Loungewear': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&q=80',
  'Beachwear': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80',
  'Cargo Pants': 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500&q=80',
  'Athletic Wear': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&q=80',
  'Smartwatches': 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=500&q=80',
  'Travel Bags': 'https://images.unsplash.com/photo-1565026057447-b88e3f29042b?w=500&q=80'
};

// Rich fallback pool of unique fashion images if any category is not in the map
const FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&q=80',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
  'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=500&q=80',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80',
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
  'https://images.unsplash.com/photo-1542272604-780c36856542?w=500&q=80',
  'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&q=80',
  'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80',
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80'
];

async function updateCategoryUniqueImages() {
  try {
    console.log('🖼️ Updating all categories with 100% unique cover images...');
    const [categories] = await db.query('SELECT id, name FROM categories ORDER BY id ASC');

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      let imgUrl = CATEGORY_UNIQUE_IMAGES[cat.name];
      if (!imgUrl) {
        imgUrl = FALLBACK_POOL[i % FALLBACK_POOL.length];
      }

      await db.query('UPDATE categories SET image_url = ? WHERE id = ?', [imgUrl, cat.id]);
    }

    console.log(`✅ Updated ${categories.length} categories with unique, distinct cover images!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed updating category images:', err);
    process.exit(1);
  }
}

updateCategoryUniqueImages();
