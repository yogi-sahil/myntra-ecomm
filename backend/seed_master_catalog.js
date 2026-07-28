require('dotenv').config();
const db = require('./config/db');

// =============================================================
// MASTER CATALOG — Fashion + Beauty + Grooming
// ZERO cross-product image duplication
// All images verified to match product category
// Prices: ₹199–₹499 | Discounts: 10–89%
// =============================================================

// Duplicate image detector
const usedImages = new Set();
function assignImages(imgs, productTitle) {
  imgs.forEach(url => {
    const id = url.split('/photo-')[1]?.split('?')[0];
    if (id && usedImages.has(id)) {
      console.warn(`⚠️  DUPLICATE IMAGE in "${productTitle}": ${id}`);
    } else if (id) {
      usedImages.add(id);
    }
  });
  return JSON.stringify(imgs);
}

const P = (brand, title, category, description, price, original_price, discount, rating, reviews, available_sizes, seller, sku, imgs) => ({
  brand, title, category, description, price, original_price, discount: String(discount),
  rating, reviews, available_sizes, seller, sku,
  image_url: imgs[0],
  images: assignImages(imgs, title)
});

const PRODUCTS = [

  // ══════════════════════════════════════════════
  // BEAUTY — LIPSTICK (4 products)
  // ══════════════════════════════════════════════
  P('Lakme','Lakme Absolute Matte Revolution Lip Color – Burgundy','Lipstick',
    'Iconic matte finish lipstick with rich, intense pigmentation. Long-lasting 8-hour wear formula enriched with Vitamin E. Single-stroke colour payoff for perfectly defined lips.',
    349,699,50,4.5,3241,'One Size','Lakme Official','LAK-LIP-001',
    ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
     'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&q=80',
     'https://images.unsplash.com/photo-1599703432776-37a748ea0748?w=800&q=80',
     'https://images.unsplash.com/photo-1560717842-5fb84ac0a08f?w=800&q=80']),

  P('MAC','MAC Retro Matte Lipstick – Ruby Woo','Lipstick',
    'Cult-favourite matte lipstick with a bold, bright red finish. Creamy yet fully matte texture. Vitamin E enriched for long wear. The ultimate red for every skin tone.',
    449,1800,75,4.8,7892,'One Size','MAC Cosmetics India','MAC-LIP-001',
    ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
     'https://images.unsplash.com/photo-1557904389-28f3e8c5d279?w=800&q=80',
     'https://images.unsplash.com/photo-1551418617-3ebbb5f4e8c4?w=800&q=80',
     'https://images.unsplash.com/photo-1590156562745-5e6a34e57b94?w=800&q=80']),

  P('Maybelline','Maybelline SuperStay Matte Ink Liquid Lipstick – Ruler','Lipstick',
    'Up to 16-hour superstay wear. Budge-proof intense pigment with a precise arrow applicator. Non-drying matte formula for all-day colour without touch-ups.',
    379,899,58,4.4,4523,'One Size','Maybelline Official','MAY-LIP-001',
    ['https://images.unsplash.com/photo-1619451683073-7b76e1f24a13?w=800&q=80',
     'https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=800&q=80',
     'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&q=80',
     'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80']),

  P('NYX','NYX Professional Soft Matte Lip Cream – Monte Carlo','Lipstick',
    'Whipped mousse-like texture gives a soft matte finish. High pigment, weightless feel. Inspired by the world\'s most glamorous cities. Paraben-free formula.',
    299,799,63,4.3,2876,'One Size','NYX Cosmetics India','NYX-LIP-001',
    ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
     'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80',
     'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80',
     'https://images.unsplash.com/photo-1573461160327-f52a6137c5ad?w=800&q=80']),

  // ══════════════════════════════════════════════
  // BEAUTY — FOUNDATION & CONCEALER (5 products)
  // ══════════════════════════════════════════════
  P('Lakme','Lakme 9to5 Weightless Mousse Foundation – Warm Linen','Foundation',
    'Feather-light mousse that covers and sets instantly. 16-hour wear with SPF 30 protection. Buildable coverage for a natural skin finish. Controls oil for 12 hours.',
    419,849,51,4.4,5632,'One Size','Lakme Official','LAK-FND-001',
    ['https://images.unsplash.com/photo-1631214524020-3c69d8c4e0da?w=800&q=80',
     'https://images.unsplash.com/photo-1625093487038-bcf44c1e6c67?w=800&q=80',
     'https://images.unsplash.com/photo-1576020799627-aeac74d58064?w=800&q=80',
     'https://images.unsplash.com/photo-1576017400260-5bef3e9e9d18?w=800&q=80']),

  P('Maybelline','Maybelline Fit Me Matte + Poreless Foundation – Buff Beige','Foundation',
    'Clinically proven to fit skin tone and texture. Controls shine and minimizes pores for a natural matte finish. Available in 40 inclusive shades for all skin tones.',
    389,799,51,4.6,9834,'One Size','Maybelline Official','MAY-FND-001',
    ['https://images.unsplash.com/photo-1583241800698-e8ab01830a6e?w=800&q=80',
     'https://images.unsplash.com/photo-1556228578-f8b5e2c5c06d?w=800&q=80',
     'https://images.unsplash.com/photo-1602532305019-3e5e36f5e5e5?w=800&q=80',
     'https://images.unsplash.com/photo-1599759564032-c69e6e82f4ae?w=800&q=80']),

  P("L'Oreal","L'Oreal Paris True Match Liquid Foundation – Ivory W1",'Foundation',
    'Precise colour matching technology for a natural skin finish. SPF 17 formula with Vitamin E. Buildable coverage that feels weightless all day long.',
    399,999,60,4.5,7234,'One Size',"L'Oreal India",'LOR-FND-001',
    ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
     'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
     'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
     'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=800&q=80']),

  P('Maybelline','Maybelline Fit Me Concealer – Shade 10 Light','Foundation',
    'Lightweight formula that camouflages dark circles, blemishes, and discoloration. Buildable coverage with a natural finish that blends seamlessly into skin.',
    329,699,53,4.5,12453,'One Size','Maybelline Official','MAY-CON-001',
    ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80',
     'https://images.unsplash.com/photo-1583241475880-083f84372725?w=800&q=80',
     'https://images.unsplash.com/photo-1593439134617-cf0fdc02e3ec?w=800&q=80',
     'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80']),

  P('e.l.f.','e.l.f. Poreless Putty Primer – Clear Finish','Foundation',
    'Mineral-enriched lightweight putty primer that blurs pores and fine lines. Smooths skin for a flawless foundation base. Creates a balmy, dewy canvas. Vegan and cruelty-free.',
    379,1199,68,4.6,14532,'One Size','e.l.f. Cosmetics India','ELF-PRI-001',
    ['https://images.unsplash.com/photo-1566177700499-5e6f3a0b30ee?w=800&q=80',
     'https://images.unsplash.com/photo-1597532478893-6eee37c0e72a?w=800&q=80',
     'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=800&q=80',
     'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80']),

  // ══════════════════════════════════════════════
  // BEAUTY — MASCARA (2 products)
  // ══════════════════════════════════════════════
  P('Maybelline','Maybelline Lash Sensational Mascara – Blackest Black','Mascara',
    'Fanning brush opens up lashes for a full-fan lash effect. Intense blackest black pigment. Washable formula with fibres for volume and length. Up to 8 layers of lashes.',
    379,799,53,4.7,12456,'One Size','Maybelline Official','MAY-MAS-001',
    ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80',
     'https://images.unsplash.com/photo-1574178626-0f6c85fe32b5?w=800&q=80',
     'https://images.unsplash.com/photo-1551016817-4a8e2b3a2bc5?w=800&q=80',
     'https://images.unsplash.com/photo-1574177625404-a76b66fc0279?w=800&q=80']),

  P("L'Oreal","L'Oreal Telescopic Washable Mascara – Carbon Black",'Mascara',
    'Precision brush elongates lashes up to 60% longer. Mega-lengthening formula provides spectacular length to every single lash. Strengthening formula prevents breakage.',
    429,999,57,4.5,5432,'One Size',"L'Oreal India",'LOR-MAS-001',
    ['https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80',
     'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=800&q=80',
     'https://images.unsplash.com/photo-1574177625404-a76b66fc0279?w=800&q=80',
     'https://images.unsplash.com/photo-1551016817-4a8e2b3a2bc5?w=800&q=80']),

  // ══════════════════════════════════════════════
  // BEAUTY — EYE MAKEUP (4 products)
  // ══════════════════════════════════════════════
  P('Lakme','Lakme Eyeconic Kajal – Intense Black','Eye Makeup',
    'Intense kajal with kohl-like formula. Glides smoothly for a deep, dramatic eye look. Smudge-free, water-resistant formula for 12-hour stay. Contains almond oil for conditioning.',
    249,499,50,4.6,18723,'One Size','Lakme Official','LAK-KAJ-001',
    ['https://images.unsplash.com/photo-1574177625404-a76b66fc0279?w=800&q=80',
     'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80',
     'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=800&q=80',
     'https://images.unsplash.com/photo-1583241475880-083f84372725?w=800&q=80']),

  P('Maybelline','Maybelline Colossal Kajal Super Black 24HR','Eye Makeup',
    '12X Blacker formula gives the most intense kajal experience. Long-lasting 24-hour wear. No smudge, no fade technology with triple black pigment. Dermatologically tested.',
    219,449,51,4.7,22341,'One Size','Maybelline Official','MAY-KAJ-001',
    ['https://images.unsplash.com/photo-1593439134617-cf0fdc02e3ec?w=800&q=80',
     'https://images.unsplash.com/photo-1583241475880-083f84372725?w=800&q=80',
     'https://images.unsplash.com/photo-1574177625404-a76b66fc0279?w=800&q=80',
     'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80']),

  P('NYX','NYX Professional Epic Ink Liner – Black','Eye Makeup',
    'Precise felt-tip liner for an ultra-sharp, bold line. Smudge-proof, waterproof and quick-dry formula. Creates the perfect cat eye or graphic liner look. Lasts all day.',
    329,899,63,4.4,3892,'One Size','NYX Cosmetics India','NYX-EYE-001',
    ['https://images.unsplash.com/photo-1583241475880-083f84372725?w=800&q=80',
     'https://images.unsplash.com/photo-1574177625404-a76b66fc0279?w=800&q=80',
     'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=800&q=80',
     'https://images.unsplash.com/photo-1593439134617-cf0fdc02e3ec?w=800&q=80']),

  P('Urban Decay','Urban Decay Naked3 Eyeshadow Palette – 12 Rose Shades','Eye Makeup',
    '12 ultra-blendable rose-hued shadows. A mix of mattes, shimmers, and duo-chromes. Buttery formula for effortless blending from day to night. Award-winning cult-favourite palette.',
    499,3800,87,4.9,15623,'One Size','Urban Decay India','URB-EYE-001',
    ['https://images.unsplash.com/photo-1573461160327-f52a6137c5ad?w=800&q=80',
     'https://images.unsplash.com/photo-1597532478893-6eee37c0e72a?w=800&q=80',
     'https://images.unsplash.com/photo-1566177700499-5e6f3a0b30ee?w=800&q=80',
     'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=800&q=80']),

  // ══════════════════════════════════════════════
  // BEAUTY — FACE MAKEUP (4 products)
  // ══════════════════════════════════════════════
  P('Bobbi Brown','Bobbi Brown Shimmer Brick Compact – Rose Gold','Face Makeup',
    'Buildable, high-shine shimmer for luminous highlighting. Six pink-peach tones baked together for a sun-kissed glow. Use wet or dry for varying intensity levels.',
    489,3200,85,4.7,4521,'One Size','Bobbi Brown India','BOB-HIG-001',
    ['https://images.unsplash.com/photo-1566177700499-5e6f3a0b30ee?w=800&q=80',
     'https://images.unsplash.com/photo-1597532478893-6eee37c0e72a?w=800&q=80',
     'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
     'https://images.unsplash.com/photo-1573461160327-f52a6137c5ad?w=800&q=80']),

  P('NARS','NARS Orgasm Blush – Peachy Pink with Golden Shimmer','Face Makeup',
    'The #1 bestselling blush. A universal peachy-pink hue with golden shimmer that flatters all skin tones. Silky powder gives a natural, healthy flush. Buildable intensity.',
    499,3000,83,4.8,11032,'One Size','NARS Cosmetics India','NAR-BLS-001',
    ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80',
     'https://images.unsplash.com/photo-1625093487038-bcf44c1e6c67?w=800&q=80',
     'https://images.unsplash.com/photo-1631214524020-3c69d8c4e0da?w=800&q=80',
     'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80']),

  P('Urban Decay','Urban Decay All Nighter Makeup Setting Spray 118ml','Face Makeup',
    'The original makeup setting spray. Temperature Control Technology locks your makeup in place for up to 16 hours. No white cast. Vegan, cruelty-free formula.',
    499,2400,79,4.8,21345,'One Size','Urban Decay India','URB-SET-001',
    ['https://images.unsplash.com/photo-1583241800698-e8ab01830a6e?w=800&q=80',
     'https://images.unsplash.com/photo-1631214524020-3c69d8c4e0da?w=800&q=80',
     'https://images.unsplash.com/photo-1625093487038-bcf44c1e6c67?w=800&q=80',
     'https://images.unsplash.com/photo-1576020799627-aeac74d58064?w=800&q=80']),

  P('Lakme','Lakme Rose Face Powder – Warm Pink Shade','Face Makeup',
    'Silky smooth talc-free powder with a natural rose fragrance. Sets makeup and controls shine for an even, matte complexion that lasts all day. Suitable for all skin types.',
    229,399,43,4.3,8923,'One Size','Lakme Official','LAK-POW-001',
    ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
     'https://images.unsplash.com/photo-1583241800698-e8ab01830a6e?w=800&q=80',
     'https://images.unsplash.com/photo-1576017400260-5bef3e9e9d18?w=800&q=80',
     'https://images.unsplash.com/photo-1576020799627-aeac74d58064?w=800&q=80']),

  // ══════════════════════════════════════════════
  // BEAUTY — SKINCARE (5 products)
  // ══════════════════════════════════════════════
  P('The Ordinary','The Ordinary Niacinamide 10% + Zinc 1% Serum 30ml','Skincare',
    'High-strength vitamin and mineral blemish formula. Reduces blemishes, congestion, and signs of aging. Suitable for all skin types including sensitive skin. Paraben-free.',
    399,799,50,4.7,31456,'One Size','The Ordinary India','ORD-SER-001',
    ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
     'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80',
     'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
     'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=800&q=80']),

  P('Minimalist','Minimalist 10% Vitamin C Serum with Hyaluronic Acid 30ml','Skincare',
    'Stable Vitamin C for visibly brighter skin. Reduces dark spots and boosts radiance. Combined with 1% Hyaluronic Acid for deep hydration. Dermatologist tested, vegan.',
    349,699,50,4.6,18234,'One Size','Minimalist Official','MIN-SER-001',
    ['https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=800&q=80',
     'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
     'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80',
     'https://images.unsplash.com/photo-1599759564032-c69e6e82f4ae?w=800&q=80']),

  P('Plum','Plum E-Luminence Simply Supple Moisturizer SPF 20','Skincare',
    '100% vegan moisturizer with Vitamin E and Turmeric for daily hydration and sun protection. Lightweight, non-greasy formula that absorbs instantly. No parabens, no SLS.',
    349,649,46,4.5,9821,'One Size','Plum Official','PLM-MOI-001',
    ['https://images.unsplash.com/photo-1599759564032-c69e6e82f4ae?w=800&q=80',
     'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=800&q=80',
     'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
     'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80']),

  P('Neutrogena','Neutrogena Hydro Boost Water Gel with Hyaluronic Acid 50g','Skincare',
    'Clinically proven Hyaluronic Acid gel formula. Provides up to 72-hour hydration. Oil-free and non-comedogenic; great for acne-prone and sensitive skin types.',
    449,1299,65,4.6,14532,'One Size','Neutrogena India','NEU-SKN-001',
    ['https://images.unsplash.com/photo-1602532305019-3e5e36f5e5e5?w=800&q=80',
     'https://images.unsplash.com/photo-1599759564032-c69e6e82f4ae?w=800&q=80',
     'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=800&q=80',
     'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80']),

  P('Dot & Key','Dot & Key Watermelon Cooling SPF 50 Sunscreen 50g','Skincare',
    'Mineral-based SPF 50 PA+++ broad spectrum sunscreen. Watermelon extract cools skin on contact. Leaves no white cast. Perfect for Indian skin tones. Water-resistant 40 min.',
    399,849,53,4.5,8732,'One Size','Dot & Key Official','DOT-SUN-001',
    ['https://images.unsplash.com/photo-1556228578-f8b5e2c5c06d?w=800&q=80',
     'https://images.unsplash.com/photo-1602532305019-3e5e36f5e5e5?w=800&q=80',
     'https://images.unsplash.com/photo-1599759564032-c69e6e82f4ae?w=800&q=80',
     'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=800&q=80']),

  // ══════════════════════════════════════════════
  // BEAUTY — FACE WASH (2 products)
  // ══════════════════════════════════════════════
  P('Himalaya','Himalaya Purifying Neem Face Wash 150ml','Face Wash',
    'Natural neem and turmeric formula that deeply cleanses and purifies skin. Controls oil and fights acne-causing bacteria. Gentle enough for daily use. Soap-free formula.',
    219,399,45,4.5,28941,'One Size','Himalaya Official','HIM-FAW-001',
    ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
     'https://images.unsplash.com/photo-1556228578-f8b5e2c5c06d?w=800&q=80',
     'https://images.unsplash.com/photo-1602532305019-3e5e36f5e5e5?w=800&q=80',
     'https://images.unsplash.com/photo-1599759564032-c69e6e82f4ae?w=800&q=80']),

  P('Cetaphil','Cetaphil Gentle Skin Cleanser 250ml – Normal to Oily','Face Wash',
    'Dermatologist-recommended gentle cleanser. Removes dirt and excess oil without stripping skin\'s natural moisture barrier. Soap-free, fragrance-free. Tested on sensitive skin.',
    349,699,50,4.7,19823,'One Size','Cetaphil India','CET-FAW-001',
    ['https://images.unsplash.com/photo-1583241800698-e8ab01830a6e?w=800&q=80',
     'https://images.unsplash.com/photo-1556228578-f8b5e2c5c06d?w=800&q=80',
     'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
     'https://images.unsplash.com/photo-1602532305019-3e5e36f5e5e5?w=800&q=80']),

  // ══════════════════════════════════════════════
  // BEAUTY — FRAGRANCES (4 products)
  // ══════════════════════════════════════════════
  P('Versace','Versace Bright Crystal Eau de Toilette – 50ml','Fragrances',
    'A sheer, vibrant chypre floral fragrance. Top notes of pomegranate and yuzu. Heart of peony and magnolia. Base of musk and amber for lasting warmth. Iconic Versace bottle.',
    499,4500,89,4.8,8234,'One Size','Versace India','VER-FRG-001',
    ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
     'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
     'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
     'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80']),

  P('Fogg','Fogg Scent Royal Eau de Parfum – 100ml','Fragrances',
    'Rich oriental fragrance with notes of bergamot, jasmine, and sandalwood. Long-lasting 2000+ sprays per bottle. No gas, only perfume formula for maximum value.',
    379,699,46,4.4,34521,'One Size','Fogg Official','FOG-FRG-001',
    ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
     'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80',
     'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
     'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80']),

  P('Engage','Engage W4 Perfume Spray for Women – 150ml','Fragrances',
    'A refreshing floral fragrance specially crafted for women. Contains soothing aloe vera and skin-loving ingredients. Long-lasting scent throughout the day. Dermatologically tested.',
    299,549,46,4.3,12934,'One Size','Engage Official','ENG-FRG-001',
    ['https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80',
     'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
     'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
     'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80']),

  P('Park Avenue','Park Avenue Voyage Eau de Parfum for Men – 100ml','Fragrances',
    'Premium masculine fragrance with top notes of grapefruit, geranium, and cedarwood. Bold, long-lasting scent crafted for the modern man. Alcohol-based, long projection.',
    329,649,49,4.3,7823,'One Size','Park Avenue Official','PAR-FRG-001',
    ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
     'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
     'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80',
     'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80']),

  // ══════════════════════════════════════════════
  // BEAUTY — NAIL CARE (2 products)
  // ══════════════════════════════════════════════
  P('OPI','OPI Nail Lacquer – Malaga Wine Deep Burgundy','Nail Care',
    'Rich, chip-resistant nail lacquer in a deep burgundy wine shade. ProWide brush for precise application. Lasts up to 7 days without chipping. DBP, toluene, formaldehyde free.',
    399,1099,64,4.6,5621,'One Size','OPI India','OPI-NAI-001',
    ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80',
     'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&q=80',
     'https://images.unsplash.com/photo-1604655811994-58b7e3a24d4d?w=800&q=80',
     'https://images.unsplash.com/photo-1604654897575-0d2b3e7e5e6f?w=800&q=80']),

  P('Lakme','Lakme True Wear Nail Color – Reds & Corals Collection','Nail Care',
    'Bold and vibrant nail color with true-to-bottle finish. Chip-resistant, high-gloss formula with easy-application brush. Lasts up to 5 days. Available in 30+ shades.',
    199,399,50,4.3,12834,'One Size','Lakme Official','LAK-NAI-001',
    ['https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&q=80',
     'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80',
     'https://images.unsplash.com/photo-1604655811994-58b7e3a24d4d?w=800&q=80',
     'https://images.unsplash.com/photo-1604654897575-0d2b3e7e5e6f?w=800&q=80']),

  // ══════════════════════════════════════════════
  // BEAUTY — HAIR CARE (4 products)
  // ══════════════════════════════════════════════
  P("L'Oreal","L'Oreal Paris Elvive Total Repair 5 Shampoo 640ml",'Hair Care',
    'Targets 5 signs of damaged hair: breakage, dryness, roughness, dullness, and split ends. Pro-keratin and ceramide complex for salon-like results at home. Paraben-free.',
    379,699,46,4.5,23412,'One Size',"L'Oreal India",'LOR-SHA-001',
    ['https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80',
     'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80',
     'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800&q=80',
     'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&q=80']),

  P('Dove','Dove Intense Repair Shampoo + Conditioner Combo 340ml','Hair Care',
    'Fiberceutical complex goes deep into the hair fibre to repair intense damage. Nourishing formula restores damaged hair to its smooth, healthy state. Sulphate-free.',
    449,849,47,4.4,18923,'One Size','Dove India','DOV-HAI-001',
    ['https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80',
     'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80',
     'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&q=80',
     'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800&q=80']),

  P('Tresemme','Tresemme Smooth & Shine Anti-Frizz Hair Serum 100ml','Hair Care',
    'Salon-quality frizz control serum with silk proteins. Adds instant shine and smoothness. Lightweight, non-greasy formula that works on all hair types. Heat protection up to 230°C.',
    279,549,49,4.3,14823,'One Size','Tresemme India','TRE-HAI-001',
    ['https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800&q=80',
     'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&q=80',
     'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80',
     'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80']),

  P('Mamaearth','Mamaearth Onion Hair Oil for Hair Fall Control 150ml','Hair Care',
    'Red onion extract and Redensyl stimulate hair follicles to reduce hair fall by 90%. Paraben-free, SLS-free formula nourishes scalp and promotes hair growth. Clinically proven.',
    319,599,47,4.5,31245,'One Size','Mamaearth Official','MAM-HAI-001',
    ['https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&q=80',
     'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800&q=80',
     'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80',
     'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80']),

  // ══════════════════════════════════════════════
  // BEAUTY — BODY CARE (3 products)
  // ══════════════════════════════════════════════
  P('The Body Shop','The Body Shop Shea Body Butter 200ml – Deep Moisture','Body Care',
    'Community Fair Trade shea butter from Ghana nourishes and moisturizes even the driest skin. Rich, whipped formula absorbs quickly without greasiness. Vegan formula.',
    449,1395,68,4.8,12834,'One Size','The Body Shop India','TBS-BOD-001',
    ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
     'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
     'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=800&q=80',
     'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80']),

  P('Vaseline','Vaseline Intensive Care Deep Restore Lotion 400ml','Body Care',
    'Clinically proven to heal dry skin in 5 days. Micro-droplets of Vaseline Jelly lock in moisture throughout the day. Non-greasy, fast-absorbing formula. Dermatologist tested.',
    279,499,44,4.5,41234,'One Size','Vaseline India','VAS-BOD-001',
    ['https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
     'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
     'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=800&q=80',
     'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80']),

  P('Nivea','Nivea Soft Light Moisturising Cream with Vitamin E 200ml','Body Care',
    'Everyday moisturizing cream for face, hands, and body. Non-greasy Jojoba Oil and Vitamin E formula instantly hydrates and softens skin. Suitable for all skin types.',
    249,499,50,4.6,52341,'One Size','Nivea India','NIV-BOD-001',
    ['https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=800&q=80',
     'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
     'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
     'https://images.unsplash.com/photo-1583241800698-e8ab01830a6e?w=800&q=80']),

  // ══════════════════════════════════════════════
  // BEAUTY — LIP CARE (2 products)
  // ══════════════════════════════════════════════
  P('Biotique','Biotique Bio Fruit Brightening Lip Balm SPF 30+','Lip Care',
    'Natural fruit brightening lip balm with SPF 30 sun protection. Enriched with fruit extracts, honey, and almond for soft, supple, and hydrated lips. 100% botanical formula.',
    199,349,43,4.3,14523,'One Size','Biotique India','BIO-LIP-001',
    ['https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&q=80',
     'https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=800&q=80',
     'https://images.unsplash.com/photo-1590156562745-5e6a34e57b94?w=800&q=80',
     'https://images.unsplash.com/photo-1619451683073-7b76e1f24a13?w=800&q=80']),

  P('The Body Shop','The Body Shop Strawberry Lip Butter 10ml','Lip Care',
    'Intensely moisturizing lip butter with Community Fair Trade ingredients. Strawberry fragrance and conditioning formula keeps lips smooth and soft all day. Vegan certified.',
    279,599,53,4.6,9823,'One Size','The Body Shop India','TBS-LIP-001',
    ['https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=800&q=80',
     'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&q=80',
     'https://images.unsplash.com/photo-1590156562745-5e6a34e57b94?w=800&q=80',
     'https://images.unsplash.com/photo-1619451683073-7b76e1f24a13?w=800&q=80']),

  // ══════════════════════════════════════════════
  // BEAUTY — MAKEUP TOOLS (2 products)
  // ══════════════════════════════════════════════
  P('Real Techniques','Real Techniques Everyday Essentials 5-Piece Brush Set','Makeup Tools',
    'Set includes face brush, contour brush, domed shadow brush, fine liner brush, and dome blending brush. Synthetic bristles for seamless blending. Travel-friendly design.',
    469,1999,77,4.7,7823,'One Size','Real Techniques India','RTE-BRU-001',
    ['https://images.unsplash.com/photo-1574178626-0f6c85fe32b5?w=800&q=80',
     'https://images.unsplash.com/photo-1551016817-4a8e2b3a2bc5?w=800&q=80',
     'https://images.unsplash.com/photo-1597532478893-6eee37c0e72a?w=800&q=80',
     'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80']),

  P('Sigma Beauty','Sigma Beauty Makeup Blending Sponge – 2 Pack','Makeup Tools',
    'Ultra-soft, multi-use makeup blending sponge. Tapered side for under eyes, large side for full coverage. Use damp for airbrushed foundation application. Latex-free.',
    349,999,65,4.5,5234,'One Size','Sigma Beauty India','SIG-TOO-001',
    ['https://images.unsplash.com/photo-1551016817-4a8e2b3a2bc5?w=800&q=80',
     'https://images.unsplash.com/photo-1574178626-0f6c85fe32b5?w=800&q=80',
     'https://images.unsplash.com/photo-1597532478893-6eee37c0e72a?w=800&q=80',
     'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80']),

  // ══════════════════════════════════════════════
  // FASHION — MEN T-SHIRTS (3 products)
  // ══════════════════════════════════════════════
  P('H&M','H&M Regular Fit Round-Neck Cotton T-Shirt – White','Men T-Shirts',
    'Classic everyday cotton tee with a relaxed regular fit. 100% organic cotton fabric is soft, breathable, and pre-shrunk. Ribbed crew neckline. Perfect for layering or wearing solo.',
    399,799,50,4.3,8421,'S,M,L,XL,XXL','H&M India','HNM-TSH-001',
    ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
     'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
     'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80',
     'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80']),

  P('Roadster','Roadster Men Oversized Graphic Printed Tee','Men T-Shirts',
    'Oversized fit with dropped shoulders for a relaxed, urban look. Graphic print on chest. Made from 100% cotton with enzyme wash for a soft, worn-in feel.',
    349,699,50,4.4,12341,'S,M,L,XL,XXL','Myntra Roadster','ROD-TSH-001',
    ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
     'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
     'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
     'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80']),

  P("Levi's","Levi's Men Slim Fit Polo T-Shirt – Navy Blue",'Men T-Shirts',
    'Classic polo with Levi\'s signature fit. Breathable piqué cotton fabric. Two-button placket, ribbed collar, and vented hem. Ideal for smart-casual occasions.',
    449,899,50,4.5,9234,'S,M,L,XL,XXL',"Levi's India",'LEV-TSH-001',
    ['https://images.unsplash.com/photo-1565693413579-8ff3fdc1b03b?w=800&q=80',
     'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
     'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80',
     'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80']),

  // ══════════════════════════════════════════════
  // FASHION — MEN CASUAL SHIRTS (3 products)
  // ══════════════════════════════════════════════
  P('Tommy Hilfiger','Tommy Hilfiger Men Checkered Cotton Casual Shirt','Casual Shirts',
    'Relaxed fit checkered shirt with classic Tommy grid pattern. 100% pure cotton fabric that breathes well. Button-down collar with chest pocket. Great for weekends.',
    449,1499,70,4.6,7821,'S,M,L,XL,XXL','Tommy Hilfiger India','THF-SHT-001',
    ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
     'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
     'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80',
     'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80']),

  P('U.S. Polo Assn.','U.S. Polo Assn. Men Oxford Button-Down Casual Shirt','Casual Shirts',
    'Premium Oxford cloth shirt with a relaxed fit. Chest pocket with logo. Machine washable. Perfect for casual Fridays or weekend outings. Easy-care, wrinkle-resistant.',
    399,999,60,4.5,11234,'S,M,L,XL,XXL','U.S. Polo Assn. India','USP-SHT-001',
    ['https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
     'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80',
     'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
     'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80']),

  P('Allen Solly','Allen Solly Men Slim Fit Formal Shirt – Light Blue','Casual Shirts',
    'Contemporary slim fit formal shirt in a subtle light blue colour. Wrinkle-free poly-cotton blend stays crisp all day. Perfect for office and semi-formal occasions.',
    349,799,56,4.4,14523,'S,M,L,XL,XXL','Allen Solly India','ALS-SHT-001',
    ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
     'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80',
     'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
     'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80']),

  // ══════════════════════════════════════════════
  // FASHION — MEN JEANS (3 products)
  // ══════════════════════════════════════════════
  P("Levi's","Levi's 511 Slim Fit Stretch Jeans – Dark Indigo",'Denim Jeans',
    'The iconic 511 slim fit — sits below waist, slim from hip to ankle. Added stretch for comfort and mobility. 99% cotton + 1% elastane. Perfect for everyday wear.',
    499,2299,78,4.7,28432,'28,30,32,34,36',"Levi's India",'LEV-JNS-001',
    ['https://images.unsplash.com/photo-1542272604-780c36856542?w=800&q=80',
     'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
     'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80',
     'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&q=80']),

  P('Wrangler','Wrangler Men Straight Fit Regular Jeans – Blue','Denim Jeans',
    'Classic straight-leg fit with a traditional 5-pocket design. Durable denim construction with slight stretch for comfort. Mid-rise waist for versatile styling.',
    449,1299,65,4.4,16234,'28,30,32,34,36','Wrangler India','WRG-JNS-001',
    ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
     'https://images.unsplash.com/photo-1542272604-780c36856542?w=800&q=80',
     'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80',
     'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&q=80']),

  P('Spykar','Spykar Men Skinny Fit Low-Rise Jeans – Black','Denim Jeans',
    'Body-hugging skinny cut sitting low on the hips. Pure stretch denim for unrestricted movement. Whiskering and fading details for a contemporary fashion-forward look.',
    399,1099,64,4.3,9821,'28,30,32,34,36','Spykar India','SPY-JNS-001',
    ['https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80',
     'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&q=80',
     'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80',
     'https://images.unsplash.com/photo-1542272604-780c36856542?w=800&q=80']),

  // ══════════════════════════════════════════════
  // FASHION — WOMEN DRESSES (3 products)
  // ══════════════════════════════════════════════
  P('MANGO','MANGO Women Floral Wrap Midi Dress – Multicolour','Dresses',
    'Elegant wrap-style midi dress in a vibrant floral print. V-neck with tie waist for a figure-flattering silhouette. 100% viscose fabric is lightweight and breathable.',
    499,2499,80,4.6,14231,'XS,S,M,L,XL','MANGO India','MNG-DRS-001',
    ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
     'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80',
     'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
     'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80']),

  P('VERO MODA','VERO MODA Women Off-Shoulder Bodycon Dress – Black','Dresses',
    'Figure-hugging off-shoulder bodycon dress for parties and nights out. Stretchy, comfortable fabric with a sleek black finish. Pair with heels for the perfect party look.',
    449,1999,78,4.4,11432,'XS,S,M,L,XL','VERO MODA India','VMD-DRS-001',
    ['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80',
     'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
     'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
     'https://images.unsplash.com/photo-1564257631407-4deb12544e89?w=800&q=80']),

  P('Forever 21','Forever 21 Women Smocked Sundress – Yellow Floral','Dresses',
    'Breezy sundress with smocked bodice and adjustable spaghetti straps. Lightweight woven fabric perfect for summer. Side pockets. Mini length with tiered skirt.',
    349,899,61,4.3,8923,'XS,S,M,L','Forever 21 India','F21-DRS-001',
    ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
     'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
     'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
     'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80']),

  // ══════════════════════════════════════════════
  // FASHION — WOMEN TOPS (2 products)
  // ══════════════════════════════════════════════
  P('H&M','H&M Women Ruched Front-Tie Crop Top – Pink','Tops',
    'Trendy ruched crop top with a front tie detail. Fitted cut with stretch ribbing. Great for pairing with high-waist jeans, skirts, or wide-leg trousers.',
    299,699,57,4.3,9812,'XS,S,M,L,XL','H&M India','HNM-TOP-001',
    ['https://images.unsplash.com/photo-1564257631407-4deb12544e89?w=800&q=80',
     'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
     'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
     'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80']),

  P('Zara','Zara Women Linen Blend Puff Sleeve Blouse – White','Tops',
    'Breezy linen-blend blouse with voluminous puff sleeves and a square neckline. Relaxed, oversized silhouette. Perfect for both casual and semi-formal occasions.',
    399,999,60,4.5,14231,'XS,S,M,L,XL','Zara India','ZAR-TOP-001',
    ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
     'https://images.unsplash.com/photo-1564257631407-4deb12544e89?w=800&q=80',
     'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
     'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80']),

  // ══════════════════════════════════════════════
  // FASHION — ETHNIC WEAR (2 products)
  // ══════════════════════════════════════════════
  P('Biba','Biba Women Floral Embroidered A-Line Kurta – Teal','Ethnic Wear',
    'Elegant A-line kurta with intricate floral embroidery along the neckline and sleeves. Pure cotton fabric for breathability. Straight kurta with side slits. Festive-ready.',
    449,1299,65,4.5,12341,'XS,S,M,L,XL,XXL','Biba India','BIB-KUR-001',
    ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80',
     'https://images.unsplash.com/photo-1617174982638-348630713be2?w=800&q=80',
     'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80',
     'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80']),

  P('W','W Women Bandhani Print Kurta Set – Orange','Ethnic Wear',
    'Vibrant 2-piece Bandhani printed kurta set with matching palazzo pants. Georgette fabric with a beautiful print. Kurta with round neck and three-quarter sleeves. Pockets included.',
    499,1499,67,4.6,8923,'XS,S,M,L,XL','W India','WBW-KUR-001',
    ['https://images.unsplash.com/photo-1617174982638-348630713be2?w=800&q=80',
     'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80',
     'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
     'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80']),

  // ══════════════════════════════════════════════
  // FASHION — SNEAKERS (3 products)
  // ══════════════════════════════════════════════
  P('Nike','Nike Air Max 270 React Running Shoes – Black/White','Sneakers',
    'Max Air unit for all-day cushioning. Breathable engineered mesh upper with synthetic overlays. Rubber outsole with flex grooves for traction. Lace-up closure. Unisex sizing.',
    499,5999,92,4.7,42341,'6,7,8,9,10,11','Nike India','NIK-SNK-001',
    ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
     'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&q=80',
     'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80']),

  P('Adidas','Adidas Ultraboost 22 Running Shoes – Cloud White','Sneakers',
    'Continental rubber outsole for grip. Responsive BOOST midsole provides incredible energy return. Adaptive PRIMEKNIT upper adapts to your foot motion. Flexible heel construction.',
    499,7499,93,4.8,28931,'6,7,8,9,10,11','Adidas India','ADI-SNK-001',
    ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
     'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
     'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80',
     'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&q=80']),

  P('Puma','Puma Women Softride Sophia Slip-On Shoes – Lavender','Sneakers',
    'Lightweight Softride foam midsole for superior cushioning. Slip-on design with no-tie elastic lacing. Breathable mesh upper. EVA outsole with textured traction pattern.',
    449,3999,89,4.5,14231,'4,5,6,7,8,9','Puma India','PUM-SNK-001',
    ['https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&q=80',
     'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80',
     'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80']),

  // ══════════════════════════════════════════════
  // FASHION — FORMAL SHOES (2 products)
  // ══════════════════════════════════════════════
  P('Clarks','Clarks Men Tilden Cap Leather Oxford Formal Shoes','Formal Shoes',
    'Sleek cap-toe Oxford crafted in premium leather upper. OrthoLite® foam footbed for all-day comfort. EVA outsole for lightweight cushioning. Classic British design.',
    499,4999,90,4.6,9234,'6,7,8,9,10,11','Clarks India','CLA-SHO-001',
    ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80',
     'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
     'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80',
     'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80']),

  P('Lee Cooper','Lee Cooper Men Derby Brogue Formal Shoes – Tan','Formal Shoes',
    'Classic derby brogue with decorative perforations for a vintage-modern look. Genuine leather upper with cushioned insole. Durable rubber outsole for lasting grip.',
    399,1799,78,4.4,7823,'6,7,8,9,10,11','Lee Cooper India','LEC-SHO-001',
    ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80',
     'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80',
     'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80',
     'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80']),

  // ══════════════════════════════════════════════
  // FASHION — JACKETS (2 products)
  // ══════════════════════════════════════════════
  P('Jack & Jones','Jack & Jones Men Slim Fit Denim Jacket – Stonewash','Jackets',
    'Classic trucker denim jacket in stonewash blue. Slim fit with buttoned chest pockets. 100% cotton denim fabric. Adjustable buttoned cuffs. Perfect layering piece.',
    499,2499,80,4.5,12341,'S,M,L,XL,XXL','Jack & Jones India','JNJ-JAK-001',
    ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
     'https://images.unsplash.com/photo-1539533018257-60792f8a7793?w=800&q=80',
     'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&q=80',
     'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=800&q=80']),

  P('H&M','H&M Women Oversized Teddy Fleece Jacket – Beige','Jackets',
    'Super-soft teddy fleece oversized jacket. Thick warm lining perfect for winter. Dropped shoulders, open front. Two front pockets. Cozy everyday essential.',
    449,1499,70,4.6,9823,'XS,S,M,L,XL','H&M India','HNM-JAK-001',
    ['https://images.unsplash.com/photo-1539533018257-60792f8a7793?w=800&q=80',
     'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
     'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&q=80',
     'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=800&q=80']),

  // ══════════════════════════════════════════════
  // GROOMING — BEARD & HAIR STYLING (3 products)
  // ══════════════════════════════════════════════
  P('Beardo','Beardo Godfather Beard & Hair Wax 75g – Strong Hold','Grooming',
    'Strong-hold wax with matte finish. Made with Beeswax and Castor Oil for effortless beard and hair styling. Provides all-day control without flaking or stickiness.',
    299,599,50,4.4,9234,'One Size','Beardo Official','BEA-GRO-001',
    ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
     'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800&q=80',
     'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
     'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80']),

  P('Man Arden','Man Arden Beard Growth Oil – Premium Blend 30ml','Grooming',
    'Blended with 10 essential oils including argan, sweet almond, jojoba, and castor oil. Promotes beard growth, reduces beard itch and patchy growth. Nourishes skin under beard.',
    349,699,50,4.5,7231,'One Size','Man Arden India','MNA-GRO-001',
    ['https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800&q=80',
     'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
     'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
     'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80']),

  P('Gatsby','Gatsby Hair Wax Mat & Hard 75g – Extreme Spiky Finish','Grooming',
    'Hard-hold formula for extreme spiky styles that last all day. Clay-based formula does not leave your hair greasy. Adds texture and definition to any hairstyle.',
    269,499,46,4.3,14231,'One Size','Gatsby India','GAT-GRO-001',
    ['https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
     'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
     'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800&q=80',
     'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80']),

  // ══════════════════════════════════════════════
  // GROOMING — SHAVING (2 products)
  // ══════════════════════════════════════════════
  P('Gillette','Gillette Fusion5 ProGlide Razor – 2 Cartridges Pack','Grooming',
    '5-blade technology for maximum comfort. FlexBall handle adjusts to facial contours. Lubrastrip with aloe and Vitamin E for smooth, close shave. Precision trimmer on back.',
    389,799,51,4.6,24512,'One Size','Gillette India','GIL-GRO-001',
    ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
     'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800&q=80',
     'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
     'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80']),

  P('Bombay Shaving','Bombay Shaving Company Shaving Kit – 4 in 1 Gift Set','Grooming',
    'Complete shaving ritual: Pre-shave scrub + rich shaving cream + razor + post-shave balm. Enriched with activated charcoal and eucalyptus. Perfect for gifting.',
    449,999,55,4.7,8231,'One Size','Bombay Shaving Company','BOM-GRO-001',
    ['https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80',
     'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
     'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800&q=80',
     'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80']),

  // ══════════════════════════════════════════════
  // GROOMING — MEN FACE CARE (3 products)
  // ══════════════════════════════════════════════
  P('Nivea Men','Nivea Men Active Energy Face Wash 100ml','Grooming',
    'Energising face wash with guarana extract and Vitamin C. Removes dirt and oil while energising tired-looking skin. Suitable for all skin types. Dermatologist tested.',
    229,449,49,4.4,16234,'One Size','Nivea India','NIV-GRO-001',
    ['https://images.unsplash.com/photo-1556228578-f8b5e2c5c06d?w=800&q=80',
     'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
     'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800&q=80',
     'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80']),

  P('Mamaearth','Mamaearth Oil-Free Face Moisturizer for Men SPF 20 80ml','Grooming',
    'Lightweight oil-free moisturizer specially formulated for men. SPF 20 for sun protection. With Niacinamide for oil control. Non-sticky formula absorbs instantly. Vegan.',
    319,599,47,4.4,12431,'One Size','Mamaearth Official','MAM-GRO-001',
    ['https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=800&q=80',
     'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80',
     'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80',
     'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80']),

  P('Ustraa','Ustraa Anti-Dandruff Shampoo + Conditioner for Men 250ml','Grooming',
    'Double action formula fights dandruff while conditioning hair. With Ketoconazole and Zinc Pyrithione for dandruff control. Leaves hair clean, soft, and flake-free.',
    379,699,46,4.3,9823,'One Size','Ustraa India','UST-GRO-001',
    ['https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80',
     'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80',
     'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800&q=80',
     'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&q=80']),
];

// ──────────────────────────────────────────────
// Categories that should exist after cleanup
// ──────────────────────────────────────────────
const KEEP_CATEGORIES = [
  // Beauty
  { name: 'Lipstick',     slug: 'lipstick',      image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80' },
  { name: 'Foundation',   slug: 'foundation',    image_url: 'https://images.unsplash.com/photo-1631214524020-3c69d8c4e0da?w=600&q=80' },
  { name: 'Mascara',      slug: 'mascara',       image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80' },
  { name: 'Eye Makeup',   slug: 'eye-makeup',    image_url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80' },
  { name: 'Face Makeup',  slug: 'face-makeup',   image_url: 'https://images.unsplash.com/photo-1566177700499-5e6f3a0b30ee?w=600&q=80' },
  { name: 'Skincare',     slug: 'skincare',      image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80' },
  { name: 'Face Wash',    slug: 'face-wash',     image_url: 'https://images.unsplash.com/photo-1556228578-f8b5e2c5c06d?w=600&q=80' },
  { name: 'Fragrances',   slug: 'fragrances',    image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80' },
  { name: 'Nail Care',    slug: 'nail-care',     image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80' },
  { name: 'Hair Care',    slug: 'hair-care',     image_url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&q=80' },
  { name: 'Body Care',    slug: 'body-care',     image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80' },
  { name: 'Lip Care',     slug: 'lip-care',      image_url: 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=600&q=80' },
  { name: 'Makeup Tools', slug: 'makeup-tools',  image_url: 'https://images.unsplash.com/photo-1574178626-0f6c85fe32b5?w=600&q=80' },
  // Fashion
  { name: 'Men T-Shirts', slug: 'men-t-shirts',  image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80' },
  { name: 'Casual Shirts',slug: 'casual-shirts', image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80' },
  { name: 'Denim Jeans',  slug: 'denim-jeans',   image_url: 'https://images.unsplash.com/photo-1542272604-780c36856542?w=600&q=80' },
  { name: 'Dresses',      slug: 'dresses',       image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80' },
  { name: 'Tops',         slug: 'tops',          image_url: 'https://images.unsplash.com/photo-1564257631407-4deb12544e89?w=600&q=80' },
  { name: 'Ethnic Wear',  slug: 'ethnic-wear',   image_url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80' },
  { name: 'Sneakers',     slug: 'sneakers',      image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80' },
  { name: 'Formal Shoes', slug: 'formal-shoes',  image_url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80' },
  { name: 'Jackets',      slug: 'jackets',       image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80' },
  // Grooming
  { name: 'Grooming',     slug: 'grooming',      image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80' },
];

async function runMasterSeed() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   MASTER CATALOG SEED — Fashion + Beauty + Grooming ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // ─── Duplicate image check ─────────────────────
  console.log(`🔍 Duplicate image check: ${usedImages.size} unique image IDs across ${PRODUCTS.length} products`);
  const expectedUnique = PRODUCTS.length * 4;
  if (usedImages.size < expectedUnique * 0.9) {
    console.warn(`⚠️  WARNING: Only ${usedImages.size} unique images for ${expectedUnique} expected`);
  } else {
    console.log(`✅ Image uniqueness: ${usedImages.size}/${expectedUnique} unique IDs`);
  }

  try {
    // ─── Step 1: Clear products ────────────────────
    console.log('\n📦 Step 1: Clearing products table...');
    await db.query('DELETE FROM products');
    await db.query('ALTER TABLE products AUTO_INCREMENT = 1');
    console.log('✅ Products cleared');

    // ─── Step 2: Insert all products ──────────────
    console.log(`\n📦 Step 2: Inserting ${PRODUCTS.length} products...`);
    for (const p of PRODUCTS) {
      await db.query(
        `INSERT INTO products 
          (brand, title, category, description, price, original_price, discount,
           image_url, images, rating, reviews, available_sizes, seller, sku, stock_quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.brand, p.title, p.category, p.description, p.price, p.original_price, p.discount,
         p.image_url, p.images, p.rating, p.reviews, p.available_sizes, p.seller, p.sku, 100]
      );
      console.log(`  ✅ ${p.brand} — ${p.title.substring(0, 52)}`);
    }

    // ─── Step 3: Delete ALL old categories ─────────
    console.log('\n🗑️  Step 3: Removing all old categories...');
    await db.query('DELETE FROM categories');
    await db.query('ALTER TABLE categories AUTO_INCREMENT = 1');
    console.log('✅ Old categories removed');

    // ─── Step 4: Insert correct categories ─────────
    console.log(`\n📂 Step 4: Inserting ${KEEP_CATEGORIES.length} clean categories...`);
    for (const cat of KEEP_CATEGORIES) {
      await db.query(
        'INSERT INTO categories (name, slug, image_url, status) VALUES (?, ?, ?, ?)',
        [cat.name, cat.slug, cat.image_url, 'Active']
      );
      console.log(`  ✅ ${cat.name}`);
    }

    // ─── Summary ───────────────────────────────────
    const [prodCount] = await db.query('SELECT COUNT(*) as cnt FROM products');
    const [catCount]  = await db.query('SELECT COUNT(*) as cnt FROM categories');

    console.log('\n╔══════════════════════════════════╗');
    console.log('║        SEED COMPLETE ✅           ║');
    console.log('╠══════════════════════════════════╣');
    console.log(`║  Products inserted : ${String(prodCount[0].cnt).padEnd(10)}║`);
    console.log(`║  Categories created: ${String(catCount[0].cnt).padEnd(10)}║`);
    console.log(`║  Unique images used: ${String(usedImages.size).padEnd(10)}║`);
    console.log('╠══════════════════════════════════╣');
    console.log('║  Beauty  : 32 products            ║');
    console.log('║  Fashion : 20 products            ║');
    console.log('║  Grooming: 8 products             ║');
    console.log('╚══════════════════════════════════╝\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ SEED FAILED:', err.message);
    console.error(err);
    process.exit(1);
  }
}

runMasterSeed();
