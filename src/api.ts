export type Category = 'food' | 'beauty' | 'other';

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
}

const SOURCES: { host: string; category: Category }[] = [
  { host: 'world.openfoodfacts.org', category: 'food' },
  { host: 'world.openbeautyfacts.org', category: 'beauty' },
  { host: 'world.openproductsfacts.org', category: 'other' },
];

const FIELDS = [
  'code',
  'product_name',
  'brands',
  'image_front_url',
  'ingredients_text',
  'additives_tags',
  'nutriscore_grade',
  'nova_group',
  'ecoscore_grade',
  'labels_tags',
  'quantity',
].join(',');

async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ScanScore/1.0 (personal use)' },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function lookupOne(
  host: string,
  category: Category,
  code: string
): Promise<Product | null> {
  const res = await fetchWithTimeout(
    `https://${host}/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`
  );
  if (!res.ok) return null;
  const json = await res.json();
  if (json.status !== 1 || !json.product) return null;
  const p = json.product;
  const name: string = (p.product_name || '').trim();
  const ingredients: string = (p.ingredients_text || '').trim();
  if (!name && !ingredients) return null;
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
  };
}

export async function fetchProduct(code: string): Promise<Product | null> {
  const clean = code.replace(/\D/g, '');
  if (!clean) return null;
  const results = await Promise.allSettled(
    SOURCES.map((s) => lookupOne(s.host, s.category, clean))
  );
  let anyOk = false;
  for (const r of results) {
    if (r.status === 'fulfilled') {
      anyOk = true;
      if (r.value) return r.value;
    }
  }
  if (!anyOk) throw new Error('network');
  return null;
}
