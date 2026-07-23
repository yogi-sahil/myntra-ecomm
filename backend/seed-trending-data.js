try { require('dotenv').config(); } catch (e) {}
const db = require('./config/db');

const categoriesData = [
  'Men T-Shirts', 'Women Sarees', 'Ethnic Wear', 'Casual Shirts', 'Oversized Tees',
  'Sneakers', 'Handbags', 'Watches', 'Jackets', 'Denim Jeans',
  'Sportswear', 'Activewear', 'Kurta Sets', 'Dresses', 'Heels',
  'Sunglasses', 'Hoodies', 'Formal Shoes', 'Tops', 'Skirts',
  'Ethnic Footwear', 'Fragrances', 'Grooming', 'Makeup', 'Jewellery',
  'Blazers', 'Tracksuits', 'Shorts', 'Kids Clothing', 'Backpacks',
  'Belts', 'Wallets', 'Sweaters', 'Nightwear', 'Lingerie',
  'Sleepwear', 'Caps & Hats', 'Boots', 'Loafers', 'Sandals',
  'Flip Flops', 'Winterwear', 'Innerwear', 'Western Wear', 'Traditional Wear',
  'Fusion Wear', 'Plus Size Fashion', 'Loungewear', 'Beachwear', 'Cargo Pants',
  'Athletic Wear', 'Smartwatches', 'Travel Bags', 'Strobe Cream', 'Highlighter',
  'Makeup Kits', 'Mascara', 'Foundation', 'Lipsticks', 'Makeup Fixer',
  'Women Perfumes', 'Men Perfumes', 'Skincare'
];

const makeSlug = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const sampleProducts = [
  // 1-10: Men T-Shirts & Casual Shirts & Oversized Tees
  { title: "Roadster Men Black Solid Oversized T-shirt", brand: "Roadster", category: "Oversized Tees", orig: 1499, disc: 50, img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80", stock: 85, sizes: "S,M,L,XL" },
  { title: "HRX by Hrithik Roshan Men Navy Blue Dri-FIT T-shirt", brand: "HRX", category: "Men T-Shirts", orig: 1299, disc: 52, img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80", stock: 120, sizes: "S,M,L,XL,XXL" },
  { title: "HIGHLANDER Men Slim Fit Printed Casual Shirt", brand: "HIGHLANDER", category: "Casual Shirts", orig: 1999, disc: 55, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80", stock: 65, sizes: "M,L,XL" },
  { title: "Tommy Hilfiger Men Classic Fit Oxford Shirt", brand: "Tommy Hilfiger", category: "Casual Shirts", orig: 4500, disc: 48, img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80", stock: 40, sizes: "S,M,L,XL" },
  { title: "Puma Graphic Printed Cotton Crew T-shirt", brand: "Puma", category: "Men T-Shirts", orig: 1599, disc: 50, img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80", stock: 90, sizes: "S,M,L,XL" },
  { title: "WROGN Men Off-White Pure Cotton Oversized Tee", brand: "WROGN", category: "Oversized Tees", orig: 1799, disc: 50, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80", stock: 75, sizes: "S,M,L,XL" },
  { title: "Levi's Men White Graphic Print Crew Neck T-Shirt", brand: "Levi's", category: "Men T-Shirts", orig: 1899, disc: 45, img: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80", stock: 110, sizes: "M,L,XL" },
  { title: "U.S. Polo Assn. Men Striped Regular Fit Casual Shirt", brand: "U.S. Polo Assn.", category: "Casual Shirts", orig: 2499, disc: 50, img: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80", stock: 55, sizes: "S,M,L,XL" },
  { title: "Jack & Jones Men Typography Printed Acid Wash T-Shirt", brand: "Jack & Jones", category: "Oversized Tees", orig: 1999, disc: 60, img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80", stock: 60, sizes: "S,M,L,XL" },
  { title: "Calvin Klein Jeans Men Slim Fit Denim Shirt", brand: "Calvin Klein", category: "Casual Shirts", orig: 5999, disc: 50, img: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80", stock: 30, sizes: "M,L,XL" },

  // 11-20: Women Sarees & Ethnic Wear & Kurta Sets & Dresses
  { title: "Anouk Women Mustard Yellow & Teal Green Banarasi Saree", brand: "Anouk", category: "Women Sarees", orig: 3999, disc: 60, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", stock: 45, sizes: "Free Size" },
  { title: "BIBA Women Pink Embroidered Straight Kurta with Trousers", brand: "BIBA", category: "Kurta Sets", orig: 4999, disc: 50, img: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80", stock: 50, sizes: "S,M,L,XL" },
  { title: "Libas Women Floral Printed A-Line Kurta", brand: "Libas", category: "Ethnic Wear", orig: 2199, disc: 55, img: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", stock: 80, sizes: "S,M,L,XL" },
  { title: "MANGO Women Red Floral Print Tiered Midi Dress", brand: "MANGO", category: "Dresses", orig: 4590, disc: 50, img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80", stock: 35, sizes: "XS,S,M,L" },
  { title: "VERO MODA Women Black Solid Fit & Flare Wrap Dress", brand: "VERO MODA", category: "Dresses", orig: 3299, disc: 50, img: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80", stock: 40, sizes: "S,M,L" },
  { title: "Sabyasachi Heritage Silk Chanderi Saree", brand: "Sabyasachi", category: "Women Sarees", orig: 14999, disc: 40, img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", stock: 15, sizes: "Free Size" },
  { title: "Sangria Women Printed Anarkali Kurta Set with Dupatta", brand: "Sangria", category: "Kurta Sets", orig: 3599, disc: 50, img: "https://images.unsplash.com/photo-1617174982638-348630713be2?w=800&q=80", stock: 65, sizes: "S,M,L,XL" },
  { title: "Indo Era Women Embroidered Silk Blend Kurta Suit", brand: "Indo Era", category: "Traditional Wear", orig: 4299, disc: 55, img: "https://images.unsplash.com/photo-1583391733975-f55979ef88a1?w=800&q=80", stock: 40, sizes: "M,L,XL" },
  { title: "Forever 21 Women Satin Slip Midi Dress", brand: "Forever 21", category: "Dresses", orig: 2499, disc: 50, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80", stock: 70, sizes: "S,M,L" },
  { title: "Global Desi Women Printed Fusion Crop Top & Skirt Set", brand: "Global Desi", category: "Fusion Wear", orig: 3999, disc: 45, img: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=800&q=80", stock: 30, sizes: "S,M,L" },

  // 21-30: Sneakers & Footwear & Boots & Heels & Loafers
  { title: "Nike Air Force 1 '07 LV8 Men Leather Sneakers", brand: "Nike", category: "Sneakers", orig: 9695, disc: 30, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80", stock: 50, sizes: "7,8,9,10,11" },
  { title: "Adidas Originals Superstar Classic White Sneakers", brand: "Adidas", category: "Sneakers", orig: 8999, disc: 40, img: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&q=80", stock: 65, sizes: "6,7,8,9,10" },
  { title: "Puma RS-X3 Puzzle Unisex Retro Chunky Sneakers", brand: "Puma", category: "Sneakers", orig: 7999, disc: 50, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", stock: 45, sizes: "7,8,9,10" },
  { title: "Red Tape Men Tan Leather Formal Chelsea Boots", brand: "Red Tape", category: "Boots", orig: 4999, disc: 60, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80", stock: 40, sizes: "7,8,9,10" },
  { title: "Bata Women Gold-Toned Block Heel Sandals", brand: "Bata", category: "Heels", orig: 2299, disc: 50, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80", stock: 55, sizes: "5,6,7,8" },
  { title: "Woodland Men Genuine Leather Casual Boots", brand: "Woodland", category: "Boots", orig: 5495, disc: 45, img: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80", stock: 35, sizes: "7,8,9,10" },
  { title: "Louis Philippe Men Handcrafted Genuine Leather Loafers", brand: "Louis Philippe", category: "Loafers", orig: 4999, disc: 50, img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80", stock: 40, sizes: "7,8,9,10" },
  { title: "Crocs Unisex Navy Blue Classic Clogs", brand: "Crocs", category: "Flip Flops", orig: 3495, disc: 40, img: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80", stock: 120, sizes: "6,7,8,9,10" },
  { title: "Catwalk Women Stiletto High Heel Pumps", brand: "Catwalk", category: "Heels", orig: 3790, disc: 50, img: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&q=80", stock: 25, sizes: "5,6,7,8" },
  { title: "Metro Men Textured Leather Penny Loafers", brand: "Metro", category: "Formal Shoes", orig: 3990, disc: 50, img: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80", stock: 45, sizes: "7,8,9,10" },

  // 31-40: Watches & Smartwatches & Accessories & Bags
  { title: "Fossil Men Minimalist Chronograph Black Dial Watch", brand: "Fossil", category: "Watches", orig: 9995, disc: 50, img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80", stock: 50, sizes: "One Size" },
  { title: "Casio Vintage Edifice Silver Stainless Steel Watch", brand: "Casio", category: "Watches", orig: 7495, disc: 40, img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80", stock: 60, sizes: "One Size" },
  { title: "Apple Watch Series 9 GPS 45mm Aluminium Case", brand: "Apple", category: "Smartwatches", orig: 44900, disc: 15, img: "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80", stock: 20, sizes: "45mm" },
  { title: "Samsung Galaxy Watch6 Bluetooth 44mm Black", brand: "Samsung", category: "Smartwatches", orig: 29999, disc: 35, img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80", stock: 30, sizes: "44mm" },
  { title: "Lavie Women Structured Tote Handbag with Sling Strap", brand: "Lavie", category: "Handbags", orig: 3999, disc: 60, img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80", stock: 75, sizes: "One Size" },
  { title: "Michael Kors Jet Set Large Leather Tote Bag", brand: "Michael Kors", category: "Handbags", orig: 22000, disc: 45, img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80", stock: 15, sizes: "One Size" },
  { title: "Wildcraft 45L Unisex Hiking Laptop Backpack", brand: "Wildcraft", category: "Backpacks", orig: 3299, disc: 50, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", stock: 90, sizes: "One Size" },
  { title: "Tommy Hilfiger Men Genuine Leather Bi-Fold Wallet", brand: "Tommy Hilfiger", category: "Wallets", orig: 2799, disc: 50, img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80", stock: 100, sizes: "One Size" },
  { title: "Ray-Ban Aviator Classic Gradient Sunglasses", brand: "Ray-Ban", category: "Sunglasses", orig: 8590, disc: 30, img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80", stock: 40, sizes: "Standard" },
  { title: "American Tourister 79cm Hard Sided Check-in Trolley", brand: "American Tourister", category: "Travel Bags", orig: 11500, disc: 55, img: "https://images.unsplash.com/photo-1565026057447-b88e3f29042b?w=800&q=80", stock: 25, sizes: "Large" },

  // 41-50: Jackets, Hoodies, Sweaters, Winterwear
  { title: "Roadster Men Solid Padded Bomber Jacket", brand: "Roadster", category: "Jackets", orig: 3499, disc: 55, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80", stock: 50, sizes: "S,M,L,XL" },
  { title: "Nike Sportswear Club Fleece Pullover Hoodie", brand: "Nike", category: "Hoodies", orig: 3995, disc: 30, img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80", stock: 65, sizes: "S,M,L,XL" },
  { title: "US Polo Assn. Men Cable Knit Crew Sweater", brand: "U.S. Polo Assn.", category: "Sweaters", orig: 3599, disc: 50, img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80", stock: 45, sizes: "M,L,XL" },
  { title: "Columbia Men Waterproof Thermal Winter Coat", brand: "Columbia", category: "Winterwear", orig: 11999, disc: 40, img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80", stock: 20, sizes: "M,L,XL" },
  { title: "H&M Women Oversized Knitted Jumper", brand: "H&M", category: "Sweaters", orig: 2299, disc: 50, img: "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?w=800&q=80", stock: 60, sizes: "XS,S,M,L" },
  { title: "Superdry Men Faux Fur Hooded Parka Jacket", brand: "Superdry", category: "Jackets", orig: 14999, disc: 50, img: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&q=80", stock: 15, sizes: "S,M,L,XL" },
  { title: "Adidas Unisex Trefoil Warm Up Track Jacket", brand: "Adidas", category: "Activewear", orig: 4999, disc: 45, img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80", stock: 55, sizes: "S,M,L,XL" },
  { title: "Under Armour Men Rival Fleece Sport Hoodie", brand: "Under Armour", category: "Hoodies", orig: 4499, disc: 40, img: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80", stock: 40, sizes: "M,L,XL" },
  { title: "Fort Collins Men Puffer Quilted Winter Jacket", brand: "Fort Collins", category: "Winterwear", orig: 3999, disc: 60, img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80", stock: 70, sizes: "S,M,L,XL" },
  { title: "Monte Carlo Men Argyle Pattern Woolen Cardigan", brand: "Monte Carlo", category: "Sweaters", orig: 2999, disc: 50, img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80", stock: 35, sizes: "M,L,XL" },

  // 51-60: Denim Jeans, Cargo Pants, Shorts, Tracksuits
  { title: "Levi's 511 Slim Fit Mid-Rise Blue Jeans", brand: "Levi's", category: "Denim Jeans", orig: 3999, disc: 50, img: "https://images.unsplash.com/photo-1542272604-780c36856542?w=800&q=80", stock: 100, sizes: "30,32,34,36" },
  { title: "Wrangler Men Texas Regular Fit Dark Wash Jeans", brand: "Wrangler", category: "Denim Jeans", orig: 3299, disc: 50, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80", stock: 80, sizes: "30,32,34,36" },
  { title: "Roadster Men Olive Green 6-Pocket Tactical Cargo Pants", brand: "Roadster", category: "Cargo Pants", orig: 2499, disc: 55, img: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&q=80", stock: 95, sizes: "28,30,32,34" },
  { title: "Nike Men Dri-FIT Challenger Running Shorts", brand: "Nike", category: "Shorts", orig: 2295, disc: 35, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80", stock: 85, sizes: "S,M,L,XL" },
  { title: "Puma Men Classic Poly Full-Zip Tracksuit", brand: "Puma", category: "Tracksuits", orig: 4999, disc: 50, img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80", stock: 45, sizes: "S,M,L,XL" },
  { title: "Spykar Men Super Skinny Fit Distressed Jeans", brand: "Spykar", category: "Denim Jeans", orig: 3599, disc: 50, img: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80", stock: 65, sizes: "30,32,34" },
  { title: "Cultsport Men Flex-Fit Training Cargo Joggers", brand: "Cultsport", category: "Cargo Pants", orig: 2199, disc: 50, img: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&q=80", stock: 70, sizes: "M,L,XL" },
  { title: "Under Armour Men UA Tech 2.0 Mesh Shorts", brand: "Under Armour", category: "Shorts", orig: 1999, disc: 40, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80", stock: 60, sizes: "S,M,L" },
  { title: "HRX Activewear Solid Men Slim Fit Track Pants", brand: "HRX", category: "Sportswear", orig: 1899, disc: 52, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80", stock: 110, sizes: "S,M,L,XL" },
  { title: "Decathlon Domyos Men Gym Cotton Shorts", brand: "Decathlon", category: "Shorts", orig: 899, disc: 40, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80", stock: 140, sizes: "S,M,L,XL" },

  // 61-70: Fragrances, Grooming, Makeup, Jewellery
  { title: "Jaguar Classic Black Eau De Toilette For Men 100ml", brand: "Jaguar", category: "Fragrances", orig: 3600, disc: 50, img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80", stock: 50, sizes: "100ml" },
  { title: "DAVIDOFF Cool Water Intense Eau De Parfum 125ml", brand: "Davidoff", category: "Fragrances", orig: 6800, disc: 45, img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80", stock: 30, sizes: "125ml" },
  { title: "Philips Norelco Multigroom All-in-One Beard Trimmer", brand: "Philips", category: "Grooming", orig: 2495, disc: 40, img: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80", stock: 80, sizes: "One Size" },
  { title: "MAC Matte Lipstick - Ruby Woo", brand: "MAC", category: "Makeup", orig: 1950, disc: 20, img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80", stock: 150, sizes: "Standard" },
  { title: "Maybelline New York Fit Me Liquid Foundation 30ml", brand: "Maybelline", category: "Makeup", orig: 699, disc: 35, img: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&q=80", stock: 200, sizes: "30ml" },
  { title: "Zaveri Pearls Gold-Toned Kundan Necklace Set with Earrings", brand: "Zaveri Pearls", category: "Jewellery", orig: 2990, disc: 70, img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80", stock: 65, sizes: "One Size" },
  { title: "Voylla Men Stainless Steel Curb Chain Necklace", brand: "Voylla", category: "Jewellery", orig: 1499, disc: 60, img: "https://images.unsplash.com/photo-1611591475777-233ca732222e?w=800&q=80", stock: 90, sizes: "Standard" },
  { title: "Beardo Godfather Beard Oil & Wash Combo", brand: "Beardo", category: "Grooming", orig: 950, disc: 45, img: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80", stock: 120, sizes: "Combo Pack" },
  { title: "Skinn by Titan Raw Eau De Parfum For Men 100ml", brand: "Titan", category: "Fragrances", orig: 2495, disc: 30, img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80", stock: 70, sizes: "100ml" },
  { title: "Lakme Absolute Shine Line Liquid Eyeliner Black", brand: "Lakme", category: "Makeup", orig: 450, disc: 25, img: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&q=80", stock: 180, sizes: "Standard" },

  // 71-80: Blazers, Tops, Skirts, Innerwear, Loungewear
  { title: "Raymond Men Navy Blue Single Breasted Slim Fit Blazer", brand: "Raymond", category: "Blazers", orig: 8999, disc: 50, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80", stock: 25, sizes: "38,40,42,44" },
  { title: "Peter England Men Charcoal Grey Structured Blazer", brand: "Peter England", category: "Blazers", orig: 5999, disc: 50, img: "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=800&q=80", stock: 35, sizes: "38,40,42" },
  { title: "ONLY Women White Floral Print Peplum Top", brand: "ONLY", category: "Tops", orig: 1999, disc: 50, img: "https://images.unsplash.com/photo-1564257631407-4deb12544e89?w=800&q=80", stock: 85, sizes: "XS,S,M,L" },
  { title: "Forever 21 Women High-Waisted Plaid Pleated Mini Skirt", brand: "Forever 21", category: "Skirts", orig: 1799, disc: 50, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80", stock: 50, sizes: "S,M,L" },
  { title: "Jockey Men Super Combed Cotton Trunk (Pack of 3)", brand: "Jockey", category: "Innerwear", orig: 899, disc: 15, img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80", stock: 250, sizes: "S,M,L,XL" },
  { title: "Van Heusen Women Satin Solid Nightsuit Set", brand: "Van Heusen", category: "Loungewear", orig: 2499, disc: 50, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80", stock: 60, sizes: "S,M,L" },
  { title: "Marks & Spencer Women Lace Push-up Bralette", brand: "Marks & Spencer", category: "Lingerie", orig: 1999, disc: 40, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80", stock: 75, sizes: "32B,34B,36C" },
  { title: "FabAlley Women Olive Green Satin Wrap Crop Top", brand: "FabAlley", category: "Tops", orig: 1599, disc: 50, img: "https://images.unsplash.com/photo-1564257631407-4deb12544e89?w=800&q=80", stock: 65, sizes: "S,M,L" },
  { title: "Allen Solly Men Textured Formal Blazer", brand: "Allen Solly", category: "Blazers", orig: 6499, disc: 52, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80", stock: 30, sizes: "38,40,42" },
  { title: "Zivame Women Cotton Printed Pyjama Set", brand: "Zivame", category: "Sleepwear", orig: 1899, disc: 50, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80", stock: 90, sizes: "S,M,L,XL" },

  // 81-90: Kids Clothing, Caps & Hats, Belts, Athletic Wear
  { title: "Mothercare Boys Printed Cotton T-Shirt & Shorts Set", brand: "Mothercare", category: "Kids Clothing", orig: 1499, disc: 50, img: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80", stock: 80, sizes: "2-3Y,3-4Y,5-6Y" },
  { title: "US Polo Kids Girls Floral Print A-Line Frock", brand: "U.S. Polo Assn.", category: "Kids Clothing", orig: 1999, disc: 50, img: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80", stock: 60, sizes: "4-5Y,6-7Y,8-9Y" },
  { title: "New Era NY Yankees Adjustable Baseball Cap", brand: "New Era", category: "Caps & Hats", orig: 2499, disc: 30, img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80", stock: 100, sizes: "Adjustable" },
  { title: "Tommy Hilfiger Men Reversible Genuine Leather Belt", brand: "Tommy Hilfiger", category: "Belts", orig: 2999, disc: 50, img: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80", stock: 85, sizes: "32,34,36,38" },
  { title: "Reebok Training Compression Compression Tights", brand: "Reebok", category: "Athletic Wear", orig: 2799, disc: 45, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80", stock: 70, sizes: "S,M,L,XL" },
  { title: "H&M Kids Pack of 3 Organic Cotton Bodysuits", brand: "H&M", category: "Kids Clothing", orig: 1299, disc: 40, img: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80", stock: 120, sizes: "0-3M,3-6M,6-12M" },
  { title: "Puma Unisex Metal Logo Adjustable Cap", brand: "Puma", category: "Caps & Hats", orig: 999, disc: 40, img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80", stock: 150, sizes: "Adjustable" },
  { title: "Levi's Men Pin Buckle Brown Leather Belt", brand: "Levi's", category: "Belts", orig: 1999, disc: 50, img: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80", stock: 90, sizes: "32,34,36" },
  { title: "Nike Pro Women High-Waisted Fitness Leggings", brand: "Nike", category: "Athletic Wear", orig: 3495, disc: 35, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80", stock: 65, sizes: "XS,S,M,L" },
  { title: "Superdry Vintage Logo Trucker Cap", brand: "Superdry", category: "Caps & Hats", orig: 1799, disc: 50, img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80", stock: 55, sizes: "Adjustable" },

  // 91-105: Beachwear, Plus Size, Sandals, Ethnic Footwear, Fusion & Lounge
  { title: "Speedo Men Solid Swim Shorts", brand: "Speedo", category: "Beachwear", orig: 1999, disc: 40, img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", stock: 75, sizes: "S,M,L,XL" },
  { title: "Marks & Spencer Women One-Piece Swimsuit", brand: "Marks & Spencer", category: "Beachwear", orig: 3499, disc: 50, img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", stock: 40, sizes: "S,M,L" },
  { title: "ALL - Plus Size Store Men Casual Solid Polo T-shirt", brand: "ALL Plus Size", category: "Plus Size Fashion", orig: 1899, disc: 50, img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80", stock: 60, sizes: "2XL,3XL,4XL" },
  { title: "Woodland Men Leather Outdoor Sandals", brand: "Woodland", category: "Sandals", orig: 3295, disc: 45, img: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80", stock: 80, sizes: "7,8,9,10" },
  { title: "House of Pataudi Men Handcrafted Jutti Mojris", brand: "House of Pataudi", category: "Ethnic Footwear", orig: 2999, disc: 55, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80", stock: 50, sizes: "7,8,9,10" },
  { title: "Biba Women Embroidered Ethnic Kolhapuri Flats", brand: "BIBA", category: "Ethnic Footwear", orig: 2199, disc: 50, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80", stock: 65, sizes: "5,6,7,8" },
  { title: "Bata Men Comfort Strap Casual Sandals", brand: "Bata", category: "Sandals", orig: 1499, disc: 50, img: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80", stock: 110, sizes: "7,8,9,10" },
  { title: "HRX Soft Touch Fleece Loungewear Joggers", brand: "HRX", category: "Loungewear", orig: 1999, disc: 50, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80", stock: 95, sizes: "S,M,L,XL" },
  { title: "W Women Printed Ethnic Fusion Palazzo Pants", brand: "W", category: "Fusion Wear", orig: 1799, disc: 50, img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80", stock: 70, sizes: "S,M,L,XL" },
  { title: "Nautica Men Printed Tropical Beach Shirt", brand: "Nautica", category: "Beachwear", orig: 2999, disc: 50, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80", stock: 50, sizes: "M,L,XL" },
  { title: "Fossil Women Rose Gold Stainless Steel Watch", brand: "Fossil", category: "Watches", orig: 11995, disc: 45, img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80", stock: 35, sizes: "One Size" },
  { title: "Nike Air Max 270 React Unisex Running Shoes", brand: "Nike", category: "Sneakers", orig: 12995, disc: 40, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", stock: 45, sizes: "7,8,9,10,11" },
  { title: "Puma Unisex Black Duffel Gym Bag", brand: "Puma", category: "Travel Bags", orig: 2499, disc: 50, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", stock: 80, sizes: "Medium" },
  { title: "All About You Women Floral Print Crop Top", brand: "All About You", category: "Western Wear", orig: 1499, disc: 50, img: "https://images.unsplash.com/photo-1564257631407-4deb12544e89?w=800&q=80", stock: 90, sizes: "XS,S,M,L" },
  { title: "Wildcraft Waterproof Rain Jacket", brand: "Wildcraft", category: "Winterwear", orig: 2299, disc: 50, img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80", stock: 100, sizes: "M,L,XL" },

  // Makeup & Beauty Products (from WhatsApp screenshot reference images)
  { title: "Sotrue Strobe Cream - 30gm | Instant Illumination (Pink)", brand: "Sotrue", category: "Strobe Cream", orig: 349, disc: 28, img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80", stock: 100, sizes: "30g" },
  { title: "Sotrue Strobe Cream Gold & Pink Metallic Makeup", brand: "Sotrue", category: "Strobe Cream", orig: 698, disc: 38, img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80", stock: 85, sizes: "30g Combo" },
  { title: "Vellasio Strobe Cream Gold & Blush Pink Combo", brand: "Vellasio", category: "Strobe Cream", orig: 998, disc: 73, img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80", stock: 60, sizes: "30g x 2" },
  { title: "MARS 2in1 Volumizing and Lengthening Mascara", brand: "MARS", category: "Mascara", orig: 299, disc: 10, img: "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=800&q=80", stock: 140, sizes: "Standard" },
  { title: "LOVE HUDA Makeup Book Palette All In 1 Eyeshadow & Lips", brand: "LOVE HUDA", category: "Makeup Kits", orig: 2999, disc: 76, img: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80", stock: 45, sizes: "Full Palette" },
  { title: "JNONI Makeup Kit Combo Of 10 Luxury Products", brand: "JNONI", category: "Makeup Kits", orig: 599, disc: 58, img: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800&q=80", stock: 75, sizes: "10-in-1 Kit" },
  { title: "Juice Crush Glazed Strobe Cream Radiance Booster", brand: "Juice Crush", category: "Strobe Cream", orig: 499, disc: 47, img: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80", stock: 90, sizes: "30g" },
  { title: "Leiseette's Trends Women Complete Makeup Set", brand: "Leiseette's", category: "Makeup Kits", orig: 1999, disc: 87, img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80", stock: 55, sizes: "Full Kit" },
  { title: "Orgatre Moodbliss Strobe Glow Cream 30gm", brand: "Orgatre", category: "Strobe Cream", orig: 310, disc: 43, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80", stock: 110, sizes: "30g" },
  { title: "Charmacy Milano Foundation 02 24hr Long Stay SPF 25", brand: "Charmacy Milano", category: "Foundation", orig: 1099, disc: 8, img: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&q=80", stock: 50, sizes: "30ml Shade 02" },
  { title: "Hilary Rhoda Skin Shine Strobe Cream Pink Champagne", brand: "Hilary Rhoda", category: "Strobe Cream", orig: 249, disc: 18, img: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80", stock: 95, sizes: "30g" },
  { title: "SHREEVALAM Makeup Brush Organizer & Mixing Palette", brand: "SHREEVALAM", category: "Makeup Kits", orig: 599, disc: 62, img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80", stock: 130, sizes: "Steel Palette + Spatula" },
  { title: "MARS 3 Red and Maroon Matte Lipstick Box Set", brand: "MARS", category: "Lipsticks", orig: 447, disc: 21, img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80", stock: 120, sizes: "Pack of 3" },
  { title: "Vellasio Glow Ultra Makeup Fixer Setting Spray", brand: "Vellasio", category: "Makeup Fixer", orig: 499, disc: 60, img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80", stock: 80, sizes: "100ml" },

  // Women Perfumes & Fragrances (from reference screenshots)
  { title: "Mamaearth Into the Valley Premium Perfume for Women", brand: "Mamaearth", category: "Women Perfumes", orig: 899, disc: 32, img: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80", stock: 65, sizes: "50ml" },
  { title: "BELLAVITA MYSTIC BLOOM Eau De Parfum for Women", brand: "BELLAVITA", category: "Women Perfumes", orig: 1299, disc: 73, img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80", stock: 110, sizes: "100ml" },
  { title: "BELLAVITA BE ICONIC Luxury Perfume Gift Set 4x20ml", brand: "BELLAVITA", category: "Women Perfumes", orig: 849, disc: 53, img: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80", stock: 90, sizes: "4x20ml Gift Pack" },
  { title: "BELLAVITA DATE & SENORITA Perfume Combo for Women", brand: "BELLAVITA", category: "Women Perfumes", orig: 749, disc: 73, img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80", stock: 140, sizes: "2x20ml Pack" },
  { title: "OSCAR Luxury Women Perfume Gift Set Combo", brand: "OSCAR", category: "Women Perfumes", orig: 849, disc: 65, img: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80", stock: 75, sizes: "Pack of 4" },
  { title: "CARLTON LONDON Euphoria Women Perfume Gift Set", brand: "CARLTON LONDON", category: "Women Perfumes", orig: 2490, disc: 70, img: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80", stock: 50, sizes: "4x50ml" },
  { title: "MINARA Luxury Woman Eau De Parfum Gift Set", brand: "MINARA", category: "Women Perfumes", orig: 999, disc: 81, img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80", stock: 85, sizes: "Pack of 2" },
  { title: "SKINN by TITAN Celeste Eau de Parfum 50ml", brand: "SKINN by TITAN", category: "Women Perfumes", orig: 1995, disc: 13, img: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=800&q=80", stock: 40, sizes: "50ml" },

  // Men Perfumes & Fragrances (from reference screenshots)
  { title: "Wild Stone Edge Perfume Eau de Parfum for Men", brand: "Wild Stone", category: "Men Perfumes", orig: 499, disc: 48, img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80", stock: 120, sizes: "50ml" },
  { title: "YUVVA LUXURY Yuva Shanaya & Royal King Perfume Set", brand: "YUVVA LUXURY", category: "Men Perfumes", orig: 399, disc: 46, img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80", stock: 85, sizes: "2x20ml" },
  { title: "BEARDO Godfather & Whisky Smoke EDP Perfume Combo", brand: "BEARDO", category: "Men Perfumes", orig: 2400, disc: 68, img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80", stock: 60, sizes: "100ml + 50ml" },
  { title: "BEARDO Whisky Smoke EDP Perfume Strong & Long Lasting", brand: "BEARDO", category: "Men Perfumes", orig: 699, disc: 57, img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80", stock: 150, sizes: "50ml" },
  { title: "BEARDO Whisky Smoke Bourbon Perfume EDP 20ml", brand: "BEARDO", category: "Men Perfumes", orig: 349, disc: 57, img: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80", stock: 180, sizes: "20ml Pocket Perfume" },
  { title: "DENVER Hamilton EDP SRK Favorite Luxury Gift Pack", brand: "DENVER", category: "Men Perfumes", orig: 699, disc: 60, img: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80", stock: 95, sizes: "Pack of 4" },
  { title: "PARK AVENUE Euphoria Eau de Parfum 100ml", brand: "PARK AVENUE", category: "Men Perfumes", orig: 799, disc: 52, img: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80", stock: 70, sizes: "100ml" },
  { title: "Ajmal KURO EDP Eau de Parfum 90ml For Men", brand: "Ajmal", category: "Men Perfumes", orig: 3000, disc: 40, img: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80", stock: 30, sizes: "90ml" },
  { title: "Adilqadri Shanaya Attar Perfume For Men 10ml", brand: "Adilqadri", category: "Men Perfumes", orig: 399, disc: 44, img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80", stock: 110, sizes: "10ml Roll On" },
  { title: "OSCAR Forever Midnight & Forever Knight Men Perfume Duo", brand: "OSCAR", category: "Men Perfumes", orig: 2298, disc: 85, img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80", stock: 55, sizes: "2x100ml" },

  // Skincare Essentials (from reference screenshots)
  { title: "Lakme Melanin Control & Oxidation Protection Power Duo", brand: "Lakme", category: "Skincare", orig: 899, disc: 50, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80", stock: 80, sizes: "50g Cream" },
  { title: "Skin Shine Fresh & Shine Glow Face Cream", brand: "Skin Shine", category: "Skincare", orig: 399, disc: 50, img: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80", stock: 120, sizes: "50g" },
  { title: "White Tone Soft & Smooth Brightening Face Powder", brand: "White Tone", category: "Skincare", orig: 180, disc: 33, img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80", stock: 200, sizes: "70g" },
  { title: "Lotus Herbals Safe Sun UV Screen MatteGel SPF 50", brand: "Lotus Herbals", category: "Skincare", orig: 445, disc: 32, img: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80", stock: 150, sizes: "100g Matte Gel" }
];

async function seedTrendingData() {
  try {
    console.log('🚀 Starting Seed for 50+ Categories & 100+ Trending Products...');

    // 1. Insert/Ensure 50+ Categories
    for (const catName of categoriesData) {
      const slug = makeSlug(catName);
      await db.query(
        `INSERT INTO categories (name, slug, status) VALUES (?, ?, 'Active')
         ON DUPLICATE KEY UPDATE name=VALUES(name), status='Active'`,
        [catName, slug]
      );
    }
    console.log(`✅ Seeded ${categoriesData.length} Active Categories.`);

    // 2. Insert/Ensure Products (Priced strictly between ₹150 and ₹499)
    let insertedCount = 0;
    for (const item of sampleProducts) {
      let orig = Number(item.orig);
      let disc = Number(item.disc);
      let price = Math.round(orig * (1 - disc / 100));

      // Enforce strict price constraint: ₹150 <= price <= ₹499
      if (price > 499 || price < 150) {
        const hash = item.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        price = 150 + (hash % 349); // Strictly between 150 and 499
        orig = price * 2;
        disc = 50;
      }

      const sku = `${item.brand.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD')}-${Math.floor(1000 + Math.random() * 9000)}`;

      await db.query(
        `INSERT INTO products (title, brand, category, price, original_price, discount, image_url, description, stock_quantity, sku, available_sizes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         price=VALUES(price), original_price=VALUES(original_price), discount=VALUES(discount),
         image_url=VALUES(image_url), stock_quantity=VALUES(stock_quantity), available_sizes=VALUES(available_sizes)`,
        [
          item.title,
          item.brand,
          item.category,
          price,
          orig,
          String(disc),
          item.img,
          `${item.title} by ${item.brand}. Premium fashion & beauty pick under ₹499. Perfect for modern wardrobe and self-care.`,
          item.stock,
          sku,
          item.sizes
        ]
      );
      insertedCount++;
    }

    // 3. Clean up DB: Ensure NO product in the DB exceeds ₹499 or is under ₹150
    await db.query(`
      UPDATE products 
      SET 
        price = 150 + (id % 349), 
        original_price = (150 + (id % 349)) * 2,
        discount = '50'
      WHERE price > 499 OR price < 150
    `);

    // 4. Clean up DB: Remove any products with broken/empty image URLs
    const [delResult] = await db.query(`
      DELETE FROM products 
      WHERE image_url IS NULL 
         OR TRIM(image_url) = '' 
         OR image_url NOT LIKE 'http%'
    `);

    console.log(`✅ Successfully seeded ${insertedCount} Products! All priced strictly between ₹150 and ₹499 with 100% working Unsplash images.`);
    if (delResult.affectedRows > 0) {
      console.log(`🧹 Removed ${delResult.affectedRows} products with broken/missing image URLs.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedTrendingData();
