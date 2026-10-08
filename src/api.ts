import { Platform } from 'react-native';

export type Category = 'food' | 'beauty' | 'other';

export interface Nutrition {
  energyKcal?: number;
  fat?: number;
  saturatedFat?: number;
  sugars?: number;
  salt?: number;
  fiber?: number;
  proteins?: number;
}

export interface Product {
  code: string;
  name: string;
  brand: string;
  image?: string;
  category: Category;
  ingredients: string;
  additives: string[];
  nutriscore?: string;
  nova?: number;
  ecoscore?: string;
  labels: string[];
  quantity?: string;
  categories?: string[];
  nutrition?: Nutrition;
}

const SOURCES: { host: string; category: Category }[] = [
  { host: 'world.openfoodfacts.org', category: 'food' },
  { host: 'world.openbeautyfacts.org', category: 'beauty' },
  { host: 'world.openproductsfacts.org', category: 'other' },
];

const FIELDS = [
  'code',
  'product_name',
  'product_name_en',
  'product_type',
  'brands',
  'image_front_url',
  'ingredients_text',
  'ingredients_text_en',
  'additives_tags',
  'nutriscore_grade',
  'nova_group',
  'ecoscore_grade',
  'labels_tags',
  'quantity',
  'categories_tags',
  'nutriments',
].join(',');

// The databases share barcodes and forward a request to whichever one holds the
// product, so the source we asked is not a reliable category. product_type is.
const PRODUCT_TYPES: Record<string, Category> = {
  food: 'food',
  beauty: 'beauty',
  petfood: 'other',
  product: 'other',
};

function num(v: unknown): number | undefined {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
}

function parseNutrition(n: Record<string, unknown> | undefined): Nutrition | undefined {
  if (!n) return undefined;
  const out: Nutrition = {
    energyKcal: num(n['energy-kcal_100g']),
    fat: num(n['fat_100g']),
    saturatedFat: num(n['saturated-fat_100g']),
    sugars: num(n['sugars_100g']),
    salt: num(n['salt_100g']),
    fiber: num(n['fiber_100g']),
    proteins: num(n['proteins_100g']),
  };
  return Object.values(out).some((v) => v !== undefined) ? out : undefined;
}

async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      // Browsers forbid a custom User-Agent on cross-origin requests.
      headers: Platform.OS === 'web' ? undefined : { 'User-Agent': 'ScanScore/1.0 (personal use)' },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function lookupOne(
  host: string,
  sourceCategory: Category,
  code: string
): Promise<Product | null> {
  const res = await fetchWithTimeout(
    `https://${host}/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`
  );
  if (!res.ok) return null;
  const json = await res.json();
  if (json.status !== 1 || !json.product) return null;
  const p = json.product;
  const name: string = (p.product_name || p.product_name_en || '').trim();
  const ingredients: string = (p.ingredients_text || p.ingredients_text_en || '').trim();
  if (!name && !ingredients) return null;
  const category = PRODUCT_TYPES[p.product_type] ?? sourceCategory;
  return {
    code,
    name: name || 'Unnamed product',
    brand: (p.brands || '').split(',')[0].trim(),
    image: p.image_front_url || undefined,
    category,
    ingredients,
    additives: Array.isArray(p.additives_tags) ? p.additives_tags : [],
    nutriscore: p.nutriscore_grade ? String(p.nutriscore_grade).toLowerCase() : undefined,
    nova: typeof p.nova_group === 'number' ? p.nova_group : undefined,
    ecoscore: p.ecoscore_grade ? String(p.ecoscore_grade).toLowerCase() : undefined,
    labels: Array.isArray(p.labels_tags) ? p.labels_tags : [],
    quantity: p.quantity || undefined,
    categories: Array.isArray(p.categories_tags) ? p.categories_tags : [],
    nutrition: category === 'food' ? parseNutrition(p.nutriments) : undefined,
  };
}

// Scanners report US barcodes as 12-digit UPC-A or 13-digit EAN with a leading 0.
function codeVariants(code: string): string[] {
  if (code.length === 12) return [code, '0' + code];
  if (code.length === 13 && code.startsWith('0')) return [code, code.slice(1)];
  return [code];
}

export async function fetchProduct(code: string): Promise<Product | null> {
  const clean = code.replace(/\D/g, '');
  if (!clean) return null;
  let anyOk = false;
  for (const variant of codeVariants(clean)) {
    const results = await Promise.allSettled(
      SOURCES.map((s) => lookupOne(s.host, s.category, variant))
    );
    const found: Product[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled') {
        anyOk = true;
        if (r.value) found.push(r.value);
      }
    }
    // Prefer the richest record: one with ingredients beats one without.
    found.sort((a, b) => Number(!!b.ingredients) - Number(!!a.ingredients));
    if (found.length) return { ...found[0], code: clean };
  }
  if (!anyOk) throw new Error('network');
  return null;
}
