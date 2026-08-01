const version = 'cosmetics-2026-08-02-featured-perfume-masks';

const perfumeReviewThemes = [
  'smells refined and gets compliments without feeling overpowering',
  'lasts surprisingly well through a full workday',
  'works nicely for both everyday wear and evening plans',
  'has attractive packaging that feels suitable for gifting',
  'offers excellent value at the discounted price',
];

const maskReviewThemes = [
  'feels cooling and comfortable during use',
  'leaves my skin looking fresh and well hydrated',
  'fits easily into my weekly skincare routine',
  'has enough serum and does not dry out too quickly',
  'makes dull skin feel softer without a sticky finish',
];

const reviewers = ['Aarohi S.', 'Mehak R.', 'Riya K.', 'Kabir M.', 'Neha P.'];
const reviewTimes = ['3 days ago', '1 week ago', '2 weeks ago', '3 weeks ago', '1 month ago'];

const buildReviews = (product) => {
  const themes = product.category === 'Fragrance & Deodorant'
    ? perfumeReviewThemes
    : maskReviewThemes;
  return themes.map((theme, index) => ({
    name: reviewers[index],
    stars: index === 3 ? 4 : 5,
    ago: reviewTimes[index],
    text: `${product.title} ${theme}.`,
  }));
};

const rawProducts = [
  {
    brand: 'Yardley London',
    title: 'Morning Dew Compact Perfume - 90% Naturally Derived',
    category: 'Fragrance & Deodorant',
    price: 229,
    originalPrice: 509,
    discount: 55,
    rating: 4.2,
    ratingsCount: 637,
    sku: 'BB-40156814',
    description: 'A portable floral compact perfume with fresh morning-inspired notes for everyday wear.',
    images: [
      'https://www.bbassets.com/media/uploads/p/xxl/40156814_6-yardley-london-morning-dew-compact-perfume.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40156814-2_3-yardley-london-morning-dew-compact-perfume.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40156814-3_3-yardley-london-morning-dew-compact-perfume.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40156814-4_2-yardley-london-morning-dew-compact-perfume.jpg',
    ],
  },
  {
    brand: 'Denver',
    title: 'Sporting Club Rider Perfume For Men, 60 ml',
    category: 'Fragrance & Deodorant',
    price: 249,
    originalPrice: 711,
    discount: 65,
    rating: 3.9,
    ratingsCount: 507,
    sku: 'BB-40346100',
    description: 'A fresh masculine perfume with an energetic profile suited to daily and casual wear.',
    images: [
      'https://www.bbassets.com/media/uploads/p/xxl/40346100_1-denver-sporting-club-rider-perfume-for-men.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40346100-2_1-denver-sporting-club-rider-perfume-for-men.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40346100-3_1-denver-sporting-club-rider-perfume-for-men.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40346100-4_1-denver-sporting-club-rider-perfume-for-men.jpg',
    ],
  },
  {
    brand: 'Engage',
    title: 'W1 Perfume Spray For Women, 120 ml',
    category: 'Fragrance & Deodorant',
    price: 299,
    originalPrice: 997,
    discount: 70,
    rating: 4.0,
    ratingsCount: 391,
    sku: 'BB-40049913',
    description: 'A bright feminine perfume spray with a soft floral character for work, travel and evenings.',
    images: [
      'https://www.bbassets.com/media/uploads/p/xxl/40049913_3-engage-w1-perfume-spray-for-women.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40049913-2_3-engage-w1-perfume-spray-for-women.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40049913-3_3-engage-w1-perfume-spray-for-women.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40049913-4_3-engage-w1-perfume-spray-for-women.jpg',
    ],
  },
  {
    brand: 'Denver',
    title: 'Hamilton Pride Eau De Parfum - Long-Lasting Fragrance',
    category: 'Fragrance & Deodorant',
    price: 399,
    originalPrice: 1995,
    discount: 80,
    rating: 4.1,
    ratingsCount: 718,
    sku: 'BB-40286341',
    description: 'A bold long-lasting eau de parfum with a polished masculine profile and premium presentation.',
    images: [
      'https://www.bbassets.com/media/uploads/p/xxl/40286341_2-denver-hamilton-eau-de-perfum-pride-for-man-unique-longlasting-fragrance.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40286341-2_2-denver-hamilton-eau-de-perfum-pride-for-man-unique-longlasting-fragrance.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40286341-3_2-denver-hamilton-eau-de-perfum-pride-for-man-unique-longlasting-fragrance.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40286341-4_2-denver-hamilton-eau-de-perfum-pride-for-man-unique-longlasting-fragrance.jpg',
    ],
  },
  {
    brand: 'The Man Company',
    title: 'Black Eau De Toilette, 100 ml',
    category: 'Fragrance & Deodorant',
    price: 499,
    originalPrice: 4990,
    discount: 90,
    rating: 4.1,
    ratingsCount: 950,
    sku: 'BB-40349614',
    description: 'A sophisticated black-bottle eau de toilette with a confident scent for office and evening wear.',
    images: [
      'https://www.bbassets.com/media/uploads/p/xxl/40349614_1-the-man-company-black-eau-de-toilette.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40349614-2_1-the-man-company-black-eau-de-toilette.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40349614-3_1-the-man-company-black-eau-de-toilette.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40349614-4_1-the-man-company-black-eau-de-toilette.jpg',
    ],
  },
  {
    brand: 'Lakme',
    title: 'Blush & Glow Lemon Sheet Mask',
    category: 'Face Masks & Exfoliators',
    price: 199,
    originalPrice: 362,
    discount: 45,
    rating: 4.2,
    ratingsCount: 269,
    sku: 'BB-40192224',
    description: 'A lemon-infused sheet mask designed to refresh dull-looking skin with a quick boost of hydration.',
    images: [
      'https://www.bbassets.com/media/uploads/p/xxl/40192224_3-lakme-blush-glow-lemon-sheet-mask.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40192224-2_3-lakme-blush-glow-lemon-sheet-mask.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40192224-3_3-lakme-blush-glow-lemon-sheet-mask.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40192224-4_2-lakme-blush-glow-lemon-sheet-mask.jpg',
    ],
  },
  {
    brand: 'Garnier',
    title: 'Sakura White Face Serum Sheet Mask - Hydrates & Brightens',
    category: 'Face Masks & Exfoliators',
    price: 229,
    originalPrice: 509,
    discount: 55,
    rating: 4.1,
    ratingsCount: 296,
    sku: 'BB-40177451',
    description: 'A serum-rich sakura sheet mask for a soft, hydrated and brighter-looking complexion.',
    images: [
      'https://www.bbassets.com/media/uploads/p/xxl/40177451_11-garnier-skin-naturals-sakura-white-face-serum-sheet-mask-pink.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40177451-2_11-garnier-skin-naturals-sakura-white-face-serum-sheet-mask-pink.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40177451-3_10-garnier-skin-naturals-sakura-white-face-serum-sheet-mask-pink.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40177451-4_10-garnier-skin-naturals-sakura-white-face-serum-sheet-mask-pink.jpg',
    ],
  },
  {
    brand: 'Garnier',
    title: 'Hydra Bomb Face Serum Sheet Mask - Hyaluronic Acid & Pomegranate',
    category: 'Face Masks & Exfoliators',
    price: 249,
    originalPrice: 711,
    discount: 65,
    rating: 4.1,
    ratingsCount: 121,
    sku: 'BB-40177450',
    description: 'A hydrating pomegranate and hyaluronic-acid sheet mask for tired or dehydrated-looking skin.',
    images: [
      'https://www.bbassets.com/media/uploads/p/xxl/40177450_8-garnier-skin-naturals-hydra-bomb-face-serum-sheet-mask-blue.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40177450-2_8-garnier-skin-naturals-hydra-bomb-face-serum-sheet-mask-blue.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40177450-3_8-garnier-skin-naturals-hydra-bomb-face-serum-sheet-mask-blue.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40177450-4_8-garnier-skin-naturals-hydra-bomb-face-serum-sheet-mask-blue.jpg',
    ],
  },
  {
    brand: 'Garnier',
    title: 'Skin Naturals Charcoal Face Serum Sheet Mask',
    category: 'Face Masks & Exfoliators',
    price: 299,
    originalPrice: 997,
    discount: 70,
    rating: 4.2,
    ratingsCount: 375,
    sku: 'BB-40174567',
    description: 'A charcoal serum sheet mask that helps skin feel clean, hydrated and refreshed after a long day.',
    images: [
      'https://www.bbassets.com/media/uploads/p/xxl/40174567_5-garnier-skin-naturals-charcoal-face-serum-sheet-mask-black.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40174567-2_3-garnier-skin-naturals-charcoal-face-serum-sheet-mask-black.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40174567-3_3-garnier-skin-naturals-charcoal-face-serum-sheet-mask-black.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40174567-4_3-garnier-skin-naturals-charcoal-face-serum-sheet-mask-black.jpg',
    ],
  },
  {
    brand: 'Lakme',
    title: 'Blush & Glow Strawberry Sheet Mask',
    category: 'Face Masks & Exfoliators',
    price: 399,
    originalPrice: 1995,
    discount: 80,
    rating: 4.3,
    ratingsCount: 405,
    sku: 'BB-40192220',
    description: 'A strawberry sheet mask with a juicy serum texture for soft, fresh and glow-ready skin.',
    images: [
      'https://www.bbassets.com/media/uploads/p/xxl/40192220_3-lakme-blush-glow-strawberry-sheet-mask.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40192220-2_2-lakme-blush-glow-strawberry-sheet-mask.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40192220-3_2-lakme-blush-glow-strawberry-sheet-mask.jpg',
      'https://www.bbassets.com/media/uploads/p/xxl/40192220-4_2-lakme-blush-glow-strawberry-sheet-mask.jpg',
    ],
  },
];

const products = rawProducts.map((product) => ({
  ...product,
  imageUrl: product.images[0],
  seller: `${product.brand} Authorized Seller`,
  stockQuantity: 75,
  availableSizes: 'One Size',
  reviews: buildReviews(product),
}));

module.exports = { products, version };
