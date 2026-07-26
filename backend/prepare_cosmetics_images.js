const fs = require('node:fs/promises');
const path = require('node:path');
const { products } = require('./catalog/cosmeticsCatalog');

const outputPath = path.join(__dirname, 'catalog', 'cosmeticsImages.json');

const decodeHtml = (value) => value
  .replaceAll('&amp;', '&')
  .replaceAll('&#x27;', "'")
  .replaceAll('&quot;', '"')
  .replaceAll('\\u0026', '&');

const extractImages = (html) => {
  const urls = decodeHtml(html).match(/https:\/\/www\.bbassets\.com\/media\/uploads\/p\/(?:xxl|xl|l)\/[^"'<>\\ ]+\.(?:jpg|jpeg|png|webp)/gi) || [];
  const uniqueProducts = [];
  const seenAssetNames = new Set();

  for (const url of urls) {
    const normalized = url.replace('/p/xl/', '/p/xxl/').replace('/p/l/', '/p/xxl/');
    const assetName = normalized.split('/').pop();
    if (seenAssetNames.has(assetName)) continue;
    seenAssetNames.add(assetName);
    uniqueProducts.push(normalized);
  }
  return uniqueProducts.slice(0, 4);
};

async function fetchProductImages(product) {
  const response = await fetch(product.sourcePage, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; CatalogImageAudit/1.0)' },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const images = extractImages(await response.text());
  if (images.length < 3) throw new Error(`only ${images.length} distinct product images found`);
  return [product.sku, images];
}

async function main() {
  const entries = [];
  for (let offset = 0; offset < products.length; offset += 4) {
    const batch = products.slice(offset, offset + 4);
    const results = await Promise.all(batch.map(async (product) => {
      try {
        const entry = await fetchProductImages(product);
        console.log(`✓ ${product.sku}: ${entry[1].length} images`);
        return entry;
      } catch (error) {
        throw new Error(`${product.sku}: ${error.message}`);
      }
    }));
    entries.push(...results);
  }

  await fs.writeFile(outputPath, `${JSON.stringify(Object.fromEntries(entries), null, 2)}\n`);
  console.log(`Saved verified image manifest to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
