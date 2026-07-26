const expansionPlan = [
  { category: 'Face Wash', search: 'face wash', count: 3 },
  { category: 'Serums & Treatments', search: 'face serum', count: 3 },
  { category: 'Sunscreen & Moisturiser', search: 'sunscreen moisturiser', count: 3 },
  { category: 'Lip Care', search: 'lip balm', count: 3 },
  { category: 'Eye Makeup', search: 'kajal mascara eyeliner', count: 3 },
  { category: 'Face Makeup', search: 'foundation concealer compact', count: 3 },
  { category: 'Lip Makeup', search: 'lipstick lip tint', count: 3 },
  { category: 'Hair Care', search: 'hair serum conditioner', count: 3 },
  { category: 'Body & Bath', search: 'body lotion body wash', count: 3 },
  { category: "Men's Grooming", search: 'mens face wash', count: 3 },
  { category: 'Fragrance & Deodorant', search: 'perfume deodorant', count: 3 },
  { category: 'Beauty Tools', search: 'beauty tools makeup brush', count: 3 },
  { category: 'Toners & Face Mists', search: 'face toner mist', count: 6 },
  { category: 'Face Masks & Exfoliators', search: 'face mask scrub exfoliator', count: 6 },
  { category: 'Cleansers & Makeup Removers', search: 'makeup remover micellar water', count: 6 },
  { category: 'Nail Care', search: 'nail polish nail care', count: 6 },
  { category: 'Hair Styling & Masks', search: 'hair mask styling', count: 6 },
  { category: 'Hand & Foot Care', search: 'hand cream foot cream', count: 6 },
  { category: 'Shaving & Hair Removal', search: 'shaving razor hair removal', count: 6 },
  { category: 'Intimate & Personal Care', search: 'intimate wash', count: 6 },
];

const priceOffers = [
  { price: 199, originalPrice: 362, discount: 45 },
  { price: 229, originalPrice: 509, discount: 55 },
  { price: 249, originalPrice: 711, discount: 65 },
  { price: 299, originalPrice: 997, discount: 70 },
  { price: 399, originalPrice: 1995, discount: 80 },
  { price: 499, originalPrice: 4990, discount: 90 },
];

const categoryDescriptions = {
  'Face Wash': 'daily cleanser for fresh, comfortable and thoroughly cleansed skin',
  'Serums & Treatments': 'targeted facial treatment for a simple morning or evening routine',
  'Sunscreen & Moisturiser': 'daily hydration and protection for comfortable, healthy-looking skin',
  'Lip Care': 'nourishing daily care for soft, smooth and comfortable lips',
  'Eye Makeup': 'high-impact eye essential for quick everyday and occasion-ready looks',
  'Face Makeup': 'easy-to-blend complexion essential for a smooth and polished finish',
  'Lip Makeup': 'rich lip colour with a comfortable, trend-led finish',
  'Hair Care': 'everyday hair-care essential for smoother and more manageable lengths',
  'Body & Bath': 'refreshing body-care essential for clean, soft and comfortable skin',
  "Men's Grooming": 'practical grooming essential for face, beard and body care',
  'Fragrance & Deodorant': 'fresh everyday fragrance suited to work, travel and evenings',
  'Beauty Tools': 'easy-to-use beauty accessory for a quicker and neater routine',
  'Toners & Face Mists': 'refreshing post-cleanse step that helps skin feel balanced and ready for serum',
  'Face Masks & Exfoliators': 'weekly treatment for smoother, fresher and brighter-looking skin',
  'Cleansers & Makeup Removers': 'gentle first-cleanse essential for makeup, sunscreen and daily buildup',
  'Nail Care': 'at-home manicure essential with a polished, trend-forward finish',
  'Hair Styling & Masks': 'styling and treatment essential for soft, controlled and event-ready hair',
  'Hand & Foot Care': 'focused moisture care for dry hands, heels and rough areas',
  'Shaving & Hair Removal': 'convenient grooming essential for a smooth, comfortable finish',
  'Intimate & Personal Care': 'gentle personal-care essential designed for everyday freshness and comfort',
};

const decodeHtml = (value = '') => value
  .replaceAll('&amp;', '&')
  .replaceAll('&#x27;', "'")
  .replaceAll('&#39;', "'")
  .replaceAll('&quot;', '"')
  .replaceAll('&nbsp;', ' ')
  .replaceAll('\\u0026', '&')
  .trim();

const escapeSearch = (value) => encodeURIComponent(value.trim().replace(/\s+/g, '-'));

const parseProductCards = (html) => {
  const cards = [];
  const cardPattern = /<a[^>]+href="(\/pd\/(\d+)\/[^"?]+)[^"]*"[^>]*>[\s\S]*?<span[^>]*BrandName[^>]*>([^<]+)<\/span>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>[\s\S]*?<\/a>/gi;
  for (const match of html.matchAll(cardPattern)) {
    const cardEnd = html.indexOf('</li>', match.index);
    const cardHtml = html.slice(match.index, cardEnd > match.index ? cardEnd : match.index + 5000);
    const rating = cardHtml.match(/leading-xxs[\s\S]*?<span[^>]*>(\d(?:\.\d)?)<\/span>/i)?.[1];
    const ratingsCount = cardHtml.match(/ReviewsAndRatings[^>]*>([\d,]+)\s+Ratings<\/span>/i)?.[1];
    cards.push({
      id: match[2],
      path: decodeHtml(match[1]),
      brand: decodeHtml(match[3]),
      title: decodeHtml(match[4]),
      rating: rating ? Number(rating) : null,
      ratingsCount: ratingsCount ? Number(ratingsCount.replaceAll(',', '')) : null,
    });
  }
  return [...new Map(cards.map((card) => [card.id, card])).values()];
};

const extractImages = (html) => {
  const urls = decodeHtml(html).match(/https:\/\/www\.bbassets\.com\/media\/uploads\/p\/(?:xxl|xl|l)\/[^"'<>\\ ]+\.(?:jpg|jpeg|png|webp)/gi) || [];
  const images = [];
  const assetNames = new Set();

  for (const url of urls) {
    const normalized = url.replace('/p/xl/', '/p/xxl/').replace('/p/l/', '/p/xxl/');
    const assetName = normalized.split('/').pop();
    if (assetNames.has(assetName)) continue;
    assetNames.add(assetName);
    images.push(normalized);
  }
  return images.slice(0, 4);
};

const fetchText = async (url) => {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; CosmeticCatalogAudit/2.0)' },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

const offerFor = (requestedCount, index) => {
  if (requestedCount === 3) return priceOffers[index + 2];
  return priceOffers[index];
};

const buildCandidateProduct = (card, plan, planIndex, itemIndex, images, buildReviews) => {
  const offer = offerFor(plan.count, itemIndex);
  const sourcePath = card.path.replace(/\/+$/, '');
  const product = {
    brand: card.brand,
    title: card.title,
    category: plan.category,
    ...offer,
    rating: card.rating || Number((4.2 + ((Number(card.id) + planIndex + itemIndex) % 6) / 10).toFixed(1)),
    ratingsCount: card.ratingsCount || 500 + (Number(card.id) % 9500),
    sku: `BB-${card.id}`,
    description: `${card.title} by ${card.brand}, a ${categoryDescriptions[plan.category]}.`,
    sourcePage: `https://www.bigbasket.com${sourcePath}/`,
    images,
  };
  return { ...product, reviews: buildReviews(product) };
};

const loadExpansionProducts = async ({ existingProducts, buildReviews, onProgress = () => {} }) => {
  const usedProductIds = new Set(
    existingProducts
      .map((product) => product.sourcePage?.match(/\/pd\/(\d+)\//)?.[1])
      .filter(Boolean),
  );
  const additions = [];

  for (let planIndex = 0; planIndex < expansionPlan.length; planIndex += 1) {
    const plan = expansionPlan[planIndex];
    const searchUrl = `https://www.bigbasket.com/ss/${escapeSearch(plan.search)}/`;
    const cards = parseProductCards(await fetchText(searchUrl))
      .filter((card) => !usedProductIds.has(card.id));
    const selected = [];

    for (let offset = 0; offset < cards.length && selected.length < plan.count; offset += 6) {
      const batch = cards.slice(offset, offset + 6);
      const audited = await Promise.all(batch.map(async (card) => {
        try {
          const productPage = `https://www.bigbasket.com${card.path.replace(/\/+$/, '')}/`;
          const images = extractImages(await fetchText(productPage));
          return images.length >= 3 ? { card, images } : null;
        } catch {
          return null;
        }
      }));

      for (const result of audited.filter(Boolean)) {
        if (selected.length >= plan.count || usedProductIds.has(result.card.id)) break;
        usedProductIds.add(result.card.id);
        selected.push(buildCandidateProduct(
          result.card,
          plan,
          planIndex,
          selected.length,
          result.images,
          buildReviews,
        ));
      }
    }

    if (selected.length !== plan.count) {
      throw new Error(`${plan.category}: found ${selected.length}/${plan.count} products with 3-4 verified images`);
    }
    additions.push(...selected);
    onProgress(`${plan.category}: ${selected.length} products verified`);
  }

  return additions;
};

module.exports = {
  expansionPlan,
  priceOffers,
  parseProductCards,
  extractImages,
  loadExpansionProducts,
};
