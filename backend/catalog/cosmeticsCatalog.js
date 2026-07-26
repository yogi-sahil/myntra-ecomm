const categories = [
  { name: 'Face Wash', slug: 'face-wash' },
  { name: 'Serums & Treatments', slug: 'serums-treatments' },
  { name: 'Sunscreen & Moisturiser', slug: 'sunscreen-moisturiser' },
  { name: 'Lip Care', slug: 'lip-care' },
  { name: 'Eye Makeup', slug: 'eye-makeup' },
  { name: 'Face Makeup', slug: 'face-makeup' },
  { name: 'Lip Makeup', slug: 'lip-makeup' },
  { name: 'Hair Care', slug: 'hair-care' },
  { name: 'Body & Bath', slug: 'body-bath' },
  { name: "Men's Grooming", slug: 'mens-grooming' },
  { name: 'Fragrance & Deodorant', slug: 'fragrance-deodorant' },
  { name: 'Beauty Tools', slug: 'beauty-tools' },
  { name: 'Toners & Face Mists', slug: 'toners-face-mists' },
  { name: 'Face Masks & Exfoliators', slug: 'face-masks-exfoliators' },
  { name: 'Cleansers & Makeup Removers', slug: 'cleansers-makeup-removers' },
  { name: 'Nail Care', slug: 'nail-care' },
  { name: 'Hair Styling & Masks', slug: 'hair-styling-masks' },
  { name: 'Hand & Foot Care', slug: 'hand-foot-care' },
  { name: 'Shaving & Hair Removal', slug: 'shaving-hair-removal' },
  { name: 'Intimate & Personal Care', slug: 'intimate-personal-care' },
];

const products = [
  // Face Wash
  ['Himalaya', 'Purifying Neem Face Wash, 150 ml', 'Face Wash', 219, 279, 4.2, 6399, 'HIM-FW-150', 'Daily soap-free neem and turmeric cleanser for normal to oily, acne-prone skin.', 'https://www.bigbasket.com/pd/100134697/himalaya-purifying-neem-face-wash-150-ml/'],
  ['Clean & Clear', 'Foaming Face Wash, 150 ml', 'Face Wash', 224, 299, 4.2, 3543, 'CNC-FW-150', 'Oil-free daily cleanser that removes excess oil, dirt and pimple-causing germs without clogging pores.', 'https://www.bigbasket.com/pd/20004191/clean-clear-foaming-face-wash-150-ml/'],
  ['Nivea Men', 'Oil Control Face Wash with Vitamin C, 100 g', 'Face Wash', 239, 299, 4.1, 514, 'NIV-FW-100', 'Deep-cleansing face wash for oily skin and beard areas with a fresh, non-drying finish.', 'https://www.bigbasket.com/pd/40004452/nivea-men-oil-control-face-wash-for-oily-skin-12hr-oil-control-with-10x-vitamin-c-effect-100-g/'],

  // Serums & Treatments
  ['Minimalist', 'Niacinamide 10% + Zinc Face Serum, 30 ml', 'Serums & Treatments', 449, 599, 4.3, 8241, 'MIN-SER-10', 'Lightweight niacinamide and zinc serum for blemishes, excess oil and the appearance of acne marks.', 'https://www.bigbasket.com/pd/40233794/minimalist-niacinamide-10-zinc-face-serum-reduces-blemishes-oil-acne-marks-30-ml/'],
  ['Plum', '5% Niacinamide Face Serum with Rice Water, 30 ml', 'Serums & Treatments', 479, 599, 4.4, 6175, 'PLM-SER-05', 'Fragrance-free serum with niacinamide, rice ferment and squalane for clearer, smoother-looking skin.', 'https://www.bigbasket.com/pd/40278582/plum-5-niacinamide-face-serum-rice-water-amino-acid-complex-clears-blemishes-improves-skin-texture-30-ml/'],
  ['Pilgrim', '10% Vitamin C Face Serum with Niacinamide, 30 ml', 'Serums & Treatments', 436, 545, 4.3, 4920, 'PIL-SER-VC', 'Daily brightening serum with vitamin C, niacinamide and Kakadu plum for dull or uneven-looking skin.', 'https://www.bigbasket.com/pd/40338968/pilgrim-10-vitamin-c-face-serum-with-5-niacinamide-for-daily-brightness-30-ml/'],

  // Sunscreen & Moisturiser
  ['Lakme', 'Sun Expert Gel Sunscreen SPF 50 PA++++, 50 g', 'Sunscreen & Moisturiser', 319, 395, 4.3, 7128, 'LAK-SUN-50', 'Water-light, quick-absorbing sunscreen with niacinamide and no visible white cast.', 'https://www.bigbasket.com/pd/40280342/lakme-sun-expert-spf-50-pa-ultramatte-gel-non-sticky-quick-absorb-50-g/'],
  ['Minimalist', 'Multi-Vitamin Sunscreen SPF 50 PA++++, 50 g', 'Sunscreen & Moisturiser', 319, 399, 4.4, 9362, 'MIN-SUN-50', 'Broad-spectrum daily sunscreen with vitamins and niacinamide in a lightweight, comfortable texture.', 'https://www.bigbasket.com/pd/40233801/minimalist-multi-vitamin-spf-50-sunscreen-for-complete-sun-protection-50-ml/'],
  ['Nivea', 'Soft Light Moisturising Cream with Vitamin E, 300 ml', 'Sunscreen & Moisturiser', 399, 725, 4.3, 5727, 'NIV-MOI-300', 'Fast-absorbing, non-greasy moisturiser with vitamin E and jojoba oil for face, hands and body.', 'https://www.bigbasket.com/pd/314931/nivea-soft-light-moisturiser-for-face-hand-body-non-sticky-cream-with-vitamin-e-jojoba-oil-300-ml/'],

  // Lip Care
  ['Dot & Key', 'Gloss Boss Lip Balm SPF 30 - Cherry Pop, 12 g', 'Lip Care', 199, 249, 4.4, 2386, 'DNK-LIP-CHR', 'Glossy SPF 30 lip balm with vitamin C, vitamin E and shea butter for dry, chapped lips.', 'https://www.bigbasket.com/pd/40277802/dot-key-gloss-boss-lip-balm-with-vitamin-c-e-spf-30-cherry-pop-for-smooth-texture-12-g/'],
  ['Vaseline', 'Lip Therapy Original Care, 17 g Tin', 'Lip Care', 219, 295, 4.2, 148, 'VAS-LIP-ORG', 'Portable petroleum jelly lip treatment that seals in moisture and comforts dry lips.', 'https://www.bigbasket.com/pd/40226491/vaseline-lip-therapy-moisturise-original-care-17-g-tin/'],
  ['WOW Skin Science', 'Himalayan Rose Natural Lip Balm, 10 g', 'Lip Care', 239, 299, 4.3, 1835, 'WOW-LIP-ROS', 'Rose oil, shea butter and kokum butter balm for a soft moisturised finish and subtle tint.', 'https://www.bigbasket.com/pd/40284956/wow-skin-science-himalayan-rose-natural-lip-balm-for-moisturize-chapped-cracked-dry-damaged-lips-10-g/'],

  // Eye Makeup
  ['Maybelline New York', 'Colossal Kajal Super Black, 0.35 g', 'Eye Makeup', 299, 369, 4.5, 9548, 'MAY-EYE-KAJ', 'Smooth, waterproof and smudge-resistant kajal with an intense matte-black payoff.', 'https://www.bigbasket.com/pd/40021540/maybelline-new-york-colossal-kajal-super-black-035-g/'],
  ['Lakme', 'Eyeconic Kajal - Classic Brown, 0.35 g', 'Eye Makeup', 239, 299, 4.4, 1690, 'LAK-EYE-KAJ', 'Everyday twist-up kajal with a smooth, waterproof and smudgeproof classic-brown finish.', 'https://www.bigbasket.com/pd/40007168/lakme-eyeconic-kajal-035-g-brown/'],
  ['MARS Cosmetics', 'Fabulash Mascara - Black, 12 ml', 'Eye Makeup', 199, 249, 4.4, 3758, 'MAR-EYE-MAS', 'Affordable buildable mascara for defined, lifted-looking lashes without a heavy feel.', 'https://www.bigbasket.com/pd/40369423/mars-fabulash-mascara-12-ml-black/'],

  // Face Makeup
  ['Maybelline New York', 'Fit Me Matte Poreless Compact - 115 Ivory, 6 g', 'Face Makeup', 199, 239, 4.3, 8342, 'MAY-FAC-COM', 'Lightweight compact powder that controls shine and gives a natural-looking matte finish.', 'https://www.bigbasket.com/pd/40212688/maybelline-new-york-fit-me-12hr-oil-control-compact-8-g-115-ivory/'],
  ['Lakme', '9 To 5 CC Cream SPF 30 PA++ - Beige, 20 g', 'Face Makeup', 199, 250, 4.3, 12540, 'LAK-FAC-CC', 'Tinted daily cream that moisturises, evens the look of skin and adds light sun protection.', 'https://www.bigbasket.com/pd/40325457/lakme-9-to-5-cc-cream-spf-30-pa-20-g-beige/'],
  ['Swiss Beauty', 'Perfect Match Panstick Concealer - Natural, 7.5 g', 'Face Makeup', 239, 299, 4.2, 2910, 'SWB-FAC-CON', 'Creamy panstick concealer for spot coverage, under-eye correction and quick touch-ups.', 'https://www.bigbasket.com/pd/40318910/swiss-beauty-perfect-match-panstick-concealer-75-g-natural/'],

  // Lip Makeup
  ['Lakme', '9 To 5 Primer + Matte Lip Colour - Scarlet Surge, 3.6 g', 'Lip Makeup', 399, 550, 4.4, 9845, 'LAK-LIP-SCA', 'Creamy, high-pigment matte lip colour with a built-in primer for comfortable long wear.', 'https://www.bigbasket.com/pd/40143190/lakme-9-to-5-primer-matte-lip-colour-36-g-scarlet-surge-mr22/'],
  ['Swiss Beauty', 'Non Transfer Matte Crayon Lipstick - Plum House, 3.5 g', 'Lip Makeup', 239, 299, 4.3, 4310, 'SWB-LIP-PLM', 'Waterproof matte lip crayon with rich colour payoff and a comfortable lightweight texture.', 'https://www.bigbasket.com/pd/40259629/swiss-beauty-swiss-beauty-non-transfer-matte-crayon-lipstick-plum-house-35g-35g/'],
  ['Swiss Beauty', 'Hold Me Matte Liquid Lipstick - Tempting Pink, 4.5 ml', 'Lip Makeup', 349, 429, 4.4, 3527, 'SWB-LIP-PNK', 'Non-transfer liquid lipstick with apricot oil, saturated colour and a smooth matte finish.', 'https://www.bigbasket.com/pd/40314880/swiss-beauty-hold-me-matte-liquid-lipstick-45-ml-tempting-pink/'],

  // Hair Care
  ['Dove', 'Intense Repair 1 Minute Conditioner, 335 ml', 'Hair Care', 367, 555, 4.4, 1619, 'DOV-HAI-CON', 'Bio-protein care conditioner that smooths damaged, frizz-prone hair in one minute.', 'https://www.bigbasket.com/pd/40198198/dove-intense-repair-conditioner-340-ml/'],
  ['Livon Serum', 'Anti-Frizz Serum with Argan Oil, 100 ml', 'Hair Care', 249, 375, 4.4, 1305, 'LIV-HAI-SER', 'Lightweight serum with vitamin E and argan oil for dry, rough and hard-to-manage hair.', 'https://www.bigbasket.com/pd/40136747/livon-serum-serum-for-dry-rough-hair-100-ml/'],
  ['Tresemme', 'Keratin Smooth Professional Hair Serum, 100 ml', 'Hair Care', 349, 446, 4.4, 242, 'TRE-HAI-SER', 'Argan-oil anti-frizz serum with heat protection for smoother, shinier and more manageable hair.', 'https://www.bigbasket.com/pd/40286581/tresemme-keratin-smooth-anti-frizz-hair-serum-with-argan-oil-upto-2x-smoothness-100-ml/'],

  // Body & Bath
  ['Vaseline', 'Intensive Care Aloe Fresh Body Lotion, 400 ml', 'Body & Bath', 399, 565, 4.4, 4922, 'VAS-BOD-ALO', 'Fast-absorbing aloe body lotion for long-lasting daily hydration without a sticky finish.', 'https://www.bigbasket.com/pd/40125359/vaseline-intensive-care-aloe-fresh-body-lotion-400-ml/'],
  ['mCaffeine', 'Naked & Raw Coffee Body Scrub, 55 g', 'Body & Bath', 219, 279, 4.3, 2875, 'MCF-BOD-SCR', 'Coffee and coconut-oil body exfoliator for rough areas, tan removal and smoother-feeling skin.', 'https://www.bigbasket.com/pd/40300479/mcaffeine-naked-raw-coffee-body-scrub-removes-tan-for-normal-to-oily-skin-55-g/'],
  ['Fiama', 'Hokkaido Milk & Berries Moisturising Soap, Pack of 5', 'Body & Bath', 389, 530, 4.4, 4984, 'FIA-BOD-BAR', 'Moisturising gel-bar celebration pack with a creamy lather and long-lasting berry fragrance.', 'https://www.bigbasket.com/pd/40335245/fiama-japanese-hokkaido-milk-berries-moisturising-soap-bars-celebration-pack-125-g/'],

  // Men's Grooming
  ['Gillette', 'Fusion Manual Shaving Razor, 1 pc', "Men's Grooming", 339, 425, 4.4, 188, 'GIL-MEN-RAZ', 'Five-blade manual razor with a precision trimmer for a close shave and beard-edge styling.', 'https://www.bigbasket.com/pd/30008324/gillette-fusion-mens-grooming-razor-5-blades-precision-trimmer-for-beard-styling-1-pc/'],
  ['Bombay Shaving Company', 'Sun Protect Spray SPF 65+ PA+++, 100 g', "Men's Grooming", 349, 599, 4.4, 1206, 'BSC-MEN-SUN', 'Sweat- and water-resistant high-protection sunscreen spray for face and exposed body areas.', 'https://www.bigbasket.com/pd/40345903/bombay-shaving-company-sun-protect-spray-spf-65-pa-uva-uvb-100-g/'],
  ['Nivea Men', 'All-In-1 Charcoal Face Wash, 100 g', "Men's Grooming", 199, 265, 4.4, 634, 'NIV-MEN-FW', 'Charcoal face-and-beard cleanser that removes daily grime and excess oil without over-drying.', 'https://www.bigbasket.com/pd/40010245/nivea-men-all-in-1-charcoal-face-wash-detoxify-refresh-skin-with-10x-vitamin-c-effect-for-all-skin-types-100-g-tube/'],

  // Fragrance & Deodorant
  ['Fogg', 'Xpressio Scent Eau De Parfum for Men, 50 ml', 'Fragrance & Deodorant', 319, 399, 4.3, 2890, 'FOG-FRA-XPR', 'Long-lasting masculine eau de parfum with fresh, floral and warm notes for day or evening wear.', 'https://www.bigbasket.com/pd/40046724/fogg-scent-xpressio-for-men-100-ml/'],
  ['Engage', "L'Amante Sunkissed Eau De Parfum for Women, 100 ml", 'Fragrance & Deodorant', 399, 999, 4.3, 1820, 'ENG-FRA-SUN', 'Modern floral fragrance with tuberose, blueberry and apricot-inspired notes.', 'https://www.bigbasket.com/pd/40203937/engage-lamante-sunkissed-eau-de-parfum-perfume-for-women-100-ml/'],
  ['Engage', "L'Amante Absolute & Intensity Perfume Gift Set, Pack of 2", 'Fragrance & Deodorant', 479, 2399, 4.4, 2245, 'ENG-FRA-DUO', 'His-and-her eau de parfum duo combining spicy amber notes with bright citrus and berries.', 'https://www.bigbasket.com/pd/40284092/engage-lamante-eau-de-perfume-combo-gift-box-absolute-intensity-for-him-her-100-ml/'],

  // Beauty Tools
  ['Vega', 'EC-02 Premium Eyelash Curler, 1 pc', 'Beauty Tools', 219, 290, 4.5, 846, 'VEG-TOO-CUR', 'Non-pinching stainless-steel eyelash curler with a comfortable grip and cushioned pad.', 'https://www.bigbasket.com/pd/40364650/vega-ec-02-eyelash-curler-for-women-1-pc/'],
  ['Vega', 'E18-PB Paddle Hair Brush with Cleaning Comb, 1 pc', 'Beauty Tools', 349, 450, 4.4, 1124, 'VEG-TOO-PAD', 'Unisex paddle brush for detangling and smoothing, supplied with a compact cleaning comb.', 'https://www.bigbasket.com/pd/30003250/vega-paddle-brush-with-cleaner-e18-pb-185-g/'],
  ['Vega', 'Hair Scalp Massager Shampoo Brush, 1 pc', 'Beauty Tools', 299, 399, 4.5, 932, 'VEG-TOO-SCA', 'Waterproof shampoo brush with soft silicone bristles and an easy-grip handle for scalp massage.', 'https://www.bigbasket.com/pd/40360847/vega-hair-scalp-massagershampoo-brush-with-soft-silicone-bristles-1-pc/'],
].map(([brand, title, category, price, originalPrice, rating, ratingsCount, sku, description, sourcePage]) => ({
  brand,
  title,
  category,
  price,
  originalPrice,
  discount: Math.round(((originalPrice - price) / originalPrice) * 100),
  rating,
  ratingsCount,
  sku,
  description,
  sourcePage,
}));

const reviewThemes = {
  'Face Wash': ['cleans without making my skin feel tight', 'controls the oily look well', 'feels fresh after every wash', 'works nicely in my daily routine', 'the tube is convenient and easy to use'],
  'Serums & Treatments': ['absorbs quickly without stickiness', 'layers well under moisturiser', 'makes my skin look more even', 'has a light and comfortable texture', 'has become a regular part of my night routine'],
  'Sunscreen & Moisturiser': ['blends easily without a heavy feel', 'sits comfortably under makeup', 'keeps my skin soft for hours', 'does not leave an obvious white cast', 'works well for everyday outdoor use'],
  'Lip Care': ['keeps my lips soft for hours', 'feels nourishing without being waxy', 'is easy to carry and reapply', 'gives a healthy moisturised finish', 'helped with my dry and chapped lips'],
  'Eye Makeup': ['has a rich colour payoff in one swipe', 'stays neat through a long workday', 'is easy to apply even for beginners', 'does not feel heavy on my eyes', 'is excellent value for daily makeup'],
  'Face Makeup': ['blends quickly and looks natural', 'gives neat everyday coverage', 'feels lightweight through the day', 'works well for quick touch-ups', 'matches the finish shown in the product photos'],
  'Lip Makeup': ['has beautiful colour payoff', 'feels comfortable after it sets', 'survives drinks better than expected', 'glides on evenly without tugging', 'is a flattering shade for Indian skin tones'],
  'Hair Care': ['makes detangling much easier', 'helps control frizz without greasiness', 'leaves my hair softer and shinier', 'needs only a small amount per use', 'works well in humid weather'],
  'Body & Bath': ['leaves my skin soft after a shower', 'has a pleasant fragrance that is not overpowering', 'rinses clean without a sticky layer', 'is a useful everyday body-care pick', 'offers very good value for the pack size'],
  "Men's Grooming": ['fits easily into my morning routine', 'feels comfortable on skin and beard areas', 'gives a clean finish without irritation', 'has sturdy and travel-friendly packaging', 'offers strong value at this price'],
  'Fragrance & Deodorant': ['smells fresh and gets compliments', 'lasts well for the price', 'works for both office and evening wear', 'has a balanced fragrance that is not harsh', 'comes in attractive gift-worthy packaging'],
  'Beauty Tools': ['feels sturdy and comfortable to hold', 'makes my routine quicker and neater', 'is easy to clean after use', 'works exactly as shown in the photos', 'is a useful tool at a very good price'],
  'Toners & Face Mists': ['feels refreshing without drying my skin', 'fits easily between cleansing and serum', 'has a fine mist that spreads evenly', 'helps my skin feel calm and balanced', 'is a useful everyday skincare step'],
  'Face Masks & Exfoliators': ['leaves my skin feeling smoother', 'is easy to rinse without residue', 'helps freshen dull-looking skin', 'works well as a weekly treatment', 'has a comfortable texture and pleasant fragrance'],
  'Cleansers & Makeup Removers': ['removes sunscreen and makeup effectively', 'does not leave my face feeling tight', 'works well as the first cleansing step', 'feels gentle around my eyes and lips', 'makes my night routine faster'],
  'Nail Care': ['has a smooth and even finish', 'dries faster than I expected', 'looks true to the colour shown', 'lasts well with a top coat', 'makes an at-home manicure easy'],
  'Hair Styling & Masks': ['makes my hair easier to style', 'controls frizz without feeling heavy', 'leaves my lengths softer and shinier', 'works well before an event or workday', 'needs only a small amount per use'],
  'Hand & Foot Care': ['softens dry areas noticeably', 'absorbs without a greasy residue', 'is convenient to use before bed', 'keeps my hands and feet comfortable', 'offers excellent care for the price'],
  'Shaving & Hair Removal': ['gives a clean result with less irritation', 'is easy to handle and rinse', 'makes grooming quicker at home', 'works comfortably on sensitive areas', 'has become a dependable grooming essential'],
  'Intimate & Personal Care': ['feels gentle and fresh for daily use', 'has discreet and travel-friendly packaging', 'is comfortable on sensitive skin', 'fits easily into my hygiene routine', 'offers reliable everyday freshness'],
};

const reviewers = ['Aarohi S.', 'Mehak R.', 'Riya K.', 'Kabir M.', 'Neha P.'];
const reviewTimes = ['3 days ago', '1 week ago', '2 weeks ago', '3 weeks ago', '1 month ago'];

const buildReviews = (product) => reviewThemes[product.category].map((theme, index) => ({
  name: reviewers[index],
  stars: index === 3 ? 4 : 5,
  ago: reviewTimes[index],
  text: `${product.title} ${theme}.`,
}));

const withReviews = products.map((product) => ({
  ...product,
  reviews: buildReviews(product),
}));

module.exports = { categories, products: withReviews, buildReviews };
