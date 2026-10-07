import { Nutrition, Product } from './api';

export type Verdict = 'Excellent' | 'Good' | 'Poor' | 'Bad' | 'Unknown';

export interface Reason {
  label: string;
  impact: number;
  detail?: string;
  info?: string;
}

export interface Confidence {
  level: 'High' | 'Medium' | 'Low';
  have: string[];
  missing: string[];
}

export interface Score {
  value: number | null;
  verdict: Verdict;
  base: number;
  reasons: Reason[];
  confidence: Confidence;
}

export const HIGH_CONCERN_ADDITIVES: Record<string, string> = {
  E102: 'Tartrazine (dye)',
  E104: 'Quinoline yellow (dye)',
  E110: 'Sunset yellow (dye)',
  E122: 'Carmoisine (dye)',
  E124: 'Ponceau 4R (dye)',
  E129: 'Allura red (dye)',
  E133: 'Brilliant blue (dye)',
  E171: 'Titanium dioxide',
  E249: 'Potassium nitrite',
  E250: 'Sodium nitrite',
  E251: 'Sodium nitrate',
  E320: 'BHA',
  E321: 'BHT',
  E338: 'Phosphoric acid',
  E950: 'Acesulfame K',
  E951: 'Aspartame',
  E954: 'Saccharin',
  E955: 'Sucralose',
  E407: 'Carrageenan',
  E621: 'MSG',
};

export interface Flag {
  re: RegExp;
  label: string;
  impact: number;
  detail: string;
}

export const COSMETIC_FLAGS: Flag[] = [
  { re: /\b(methyl|ethyl|propyl|butyl|isobutyl)paraben\b/i, label: 'Parabens', impact: -10, detail: 'Preservatives with endocrine-disruption concerns' },
  { re: /\bphthalate\b/i, label: 'Phthalates', impact: -12, detail: 'Plasticizers linked to hormone disruption' },
  { re: /\b(fragrance|parfum)\b/i, label: 'Fragrance', impact: -8, detail: 'Undisclosed mix; common allergen source' },
  { re: /\btriclosan\b/i, label: 'Triclosan', impact: -14, detail: 'Antimicrobial with resistance and hormone concerns' },
  { re: /\b(formaldehyde|dmdm hydantoin|quaternium-15|imidazolidinyl urea|diazolidinyl urea)\b/i, label: 'Formaldehyde releasers', impact: -14, detail: 'Preservatives that release formaldehyde' },
  { re: /\bsodium lauryl sulfate\b|\bsls\b/i, label: 'Sodium lauryl sulfate', impact: -6, detail: 'Harsh surfactant; can irritate skin' },
  { re: /\boxybenzone\b|\bbenzophenone-3\b/i, label: 'Oxybenzone', impact: -12, detail: 'UV filter with hormone-disruption concerns' },
  { re: /\b(bha|bht|butylated hydroxy(anisole|toluene))\b/i, label: 'BHA/BHT', impact: -8, detail: 'Synthetic antioxidant preservatives' },
  { re: /\bpeg-\d+/i, label: 'PEG compounds', impact: -5, detail: 'Petroleum-derived; possible contamination' },
  { re: /\b(petrolatum|paraffinum liquidum|mineral oil)\b/i, label: 'Petroleum-derived oils', impact: -5, detail: 'Occlusive petrochemical ingredients' },
  { re: /\btalc\b/i, label: 'Talc', impact: -8, detail: 'Can be contaminated with asbestos' },
  { re: /\b(polyethylene|acrylates? copolymer|polypropylene|nylon-12)\b/i, label: 'Microplastics', impact: -8, detail: 'Synthetic polymers that persist in the environment' },
  { re: /\balcohol denat\b/i, label: 'Denatured alcohol', impact: -4, detail: 'Drying and irritating for many skin types' },
  { re: /\b(methylisothiazolinone|methylchloroisothiazolinone)\b/i, label: 'Isothiazolinones', impact: -12, detail: 'Strong contact allergens' },
];

export const GENERAL_FLAGS: Flag[] = [
  { re: /\b(pfas|ptfe|perfluoro\w*|polytetrafluoroethylene)\b/i, label: 'PFAS', impact: -20, detail: 'Persistent "forever chemical" compounds' },
  { re: /\b(bpa|bisphenol)\b/i, label: 'Bisphenols', impact: -15, detail: 'Hormone-disrupting plastic chemicals' },
];

const NUTRI: Record<string, number> = { a: 40, b: 25, c: 5, d: -15, e: -35 };
const NOVA: Record<number, number> = { 1: 10, 2: 0, 3: -8, 4: -18 };
const ECO: Record<string, number> = { a: 4, b: 2, c: 0, d: -2, e: -4 };

const NUTRI_INFO: Record<string, string> = {
  a: 'Nutri-Score is a European grade from A (best) to E (worst). A means low sugar, salt and saturated fat, often with fiber, protein, or fruit and vegetables.',
  b: 'Nutri-Score is a European grade from A (best) to E (worst). B is a good grade with only small drawbacks.',
  c: 'Nutri-Score is a European grade from A (best) to E (worst). C is middle of the road: some sugar, salt, or saturated fat balanced by some positives.',
  d: 'Nutri-Score is a European grade from A (best) to E (worst). D usually means high sugar, saturated fat, salt, or calories with few positives to offset them.',
  e: 'Nutri-Score is a European grade from A (best) to E (worst). E is the lowest grade: high in sugar, saturated fat, salt, or calories.',
};

const NOVA_INFO: Record<number, string> = {
  1: 'NOVA group 1: whole or minimally processed foods like fruit, vegetables, plain milk, or fresh meat.',
  2: 'NOVA group 2: processed culinary ingredients like oils, butter, sugar, and salt.',
  3: 'NOVA group 3: processed foods made by adding salt, sugar, or oil to whole foods, like canned vegetables, cheese, or fresh bread.',
  4: 'NOVA group 4: ultra-processed. Made with industrial ingredients you would not use at home, like flavorings, emulsifiers, or sweeteners. Studies link diets high in these foods to poorer health.',
};

// UK Food Standards Agency traffic-light thresholds, per 100 g (food) or 100 ml (drinks).
export type Rating = 'good' | 'ok' | 'bad' | 'neutral';

export interface NutrientDef {
  key: keyof Nutrition;
  label: string;
  max: number;
  better: 'low' | 'high';
  food: [number, number];
  drink: [number, number];
}

export const NUTRIENTS: NutrientDef[] = [
  { key: 'sugars', label: 'Sugar', max: 50, better: 'low', food: [5, 22.5], drink: [2.5, 11.25] },
  { key: 'fat', label: 'Fat', max: 50, better: 'low', food: [3, 17.5], drink: [1.5, 8.75] },
  { key: 'saturatedFat', label: 'Saturated fat', max: 20, better: 'low', food: [1.5, 5], drink: [0.75, 2.5] },
  { key: 'salt', label: 'Salt', max: 3, better: 'low', food: [0.3, 1.5], drink: [0.3, 0.75] },
  { key: 'fiber', label: 'Fiber', max: 15, better: 'high', food: [3, 6], drink: [1.5, 3] },
  { key: 'proteins', label: 'Protein', max: 30, better: 'high', food: [5, 10], drink: [2.5, 5] },
];

export function isDrink(product: Product): boolean {
  return (product.categories ?? []).includes('en:beverages');
}

export function rateNutrient(def: NutrientDef, value: number, drink: boolean): Rating {
  const [lo, hi] = drink ? def.drink : def.food;
  if (def.better === 'low') return value <= lo ? 'good' : value <= hi ? 'ok' : 'bad';
  return value >= hi ? 'good' : value >= lo ? 'ok' : 'neutral';
}

function nutritionSummary(product: Product): string {
  const n = product.nutrition;
  if (!n) return '';
  const drink = isDrink(product);
  const unit = drink ? '100 ml' : '100 g';
  const high: string[] = [];
  const medium: string[] = [];
  const plus: string[] = [];
  for (const d of NUTRIENTS) {
    const v = n[d.key];
    if (v === undefined) continue;
    const r = rateNutrient(d, v, drink);
    const text = `${d.label.toLowerCase()} (${round(v)} g per ${unit})`;
    if (d.better === 'low' && r === 'bad') high.push(text);
    else if (d.better === 'low' && r === 'ok') medium.push(text);
    else if (d.better === 'high' && r === 'good') plus.push(text);
  }
  const parts: string[] = [];
  if (high.length) parts.push(`This product is high in ${high.join(', ')}.`);
  if (medium.length) parts.push(`It has a moderate amount of ${medium.join(', ')}.`);
  if (plus.length) parts.push(`On the plus side, it is a good source of ${plus.join(', ')}.`);
  return parts.length ? ' ' + parts.join(' ') : '';
}

function round(v: number): string {
  return v >= 10 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, '');
}

function verdictFor(value: number): Verdict {
  if (value >= 75) return 'Excellent';
  if (value >= 50) return 'Good';
  if (value >= 25) return 'Poor';
  return 'Bad';
}

function additiveCode(tag: string): string {
  return tag.replace(/^[a-z]{2}:/i, '').toUpperCase();
}

function confidenceFor(product: Product): Confidence {
  const checks: [string, boolean][] =
    product.category === 'food'
      ? [
          ['Nutri-Score', !!product.nutriscore],
          ['Processing level (NOVA)', product.nova !== undefined],
          ['Ingredient list', product.ingredients.length > 0],
          ['Nutrition facts', !!product.nutrition],
          ['Eco-Score', !!product.ecoscore],
        ]
      : [
          ['Ingredient list', product.ingredients.length > 0],
          ['Product photo', !!product.image],
        ];
  const have = checks.filter(([, ok]) => ok).map(([k]) => k);
  const missing = checks.filter(([, ok]) => !ok).map(([k]) => k);
  const ratio = have.length / checks.length;
  const level = product.category === 'food'
    ? ratio >= 0.8 ? 'High' : ratio >= 0.5 ? 'Medium' : 'Low'
    : product.ingredients.length > 0 ? 'High' : 'Low';
  return { level, have, missing };
}

export function scoreProduct(product: Product, avoidTerms: string[]): Score {
  const reasons: Reason[] = [];
  const ingredientsLower = product.ingredients.toLowerCase();
  const hasIngredients = product.ingredients.length > 0;
  const isFood = product.category === 'food';
  const base = isFood ? 50 : 80;
  const confidence = confidenceFor(product);

  if (isFood) {
    if (!product.nutriscore && !hasIngredients && product.nova === undefined) {
      return { value: null, verdict: 'Unknown', base, reasons: [], confidence };
    }
    if (product.nutriscore && NUTRI[product.nutriscore] !== undefined) {
      reasons.push({
        label: `Nutri-Score ${product.nutriscore.toUpperCase()}`,
        impact: NUTRI[product.nutriscore],
        detail: 'Overall nutritional quality',
        info: NUTRI_INFO[product.nutriscore] + nutritionSummary(product),
      });
    }
    if (product.nova && NOVA[product.nova] !== undefined) {
      reasons.push({
        label: `NOVA group ${product.nova}`,
        impact: NOVA[product.nova],
        detail:
          product.nova === 4
            ? 'Ultra-processed'
            : product.nova === 3
            ? 'Processed'
            : product.nova === 1
            ? 'Unprocessed or minimally processed'
            : 'Processed culinary ingredient',
        info: NOVA_INFO[product.nova],
      });
    }
    let lowConcern = 0;
    for (const tag of product.additives) {
      const code = additiveCode(tag);
      if (HIGH_CONCERN_ADDITIVES[code]) {
        reasons.push({
          label: `${code} ${HIGH_CONCERN_ADDITIVES[code]}`,
          impact: -8,
          detail: 'Additive of concern',
          info: 'This additive is on our list of ones with health concerns, warning labels, or bans in some countries. Each one costs 8 points.',
        });
      } else {
        lowConcern += 1;
      }
    }
    if (lowConcern > 0) {
      reasons.push({
        label: `${lowConcern} other additive${lowConcern > 1 ? 's' : ''}`,
        impact: -Math.min(10, lowConcern * 2),
        info: 'Additives with no specific concern on our list. Each costs 2 points, up to 10, because more additives usually means more processing.',
      });
    }
    if (product.labels.includes('en:organic')) {
      reasons.push({
        label: 'Organic',
        impact: 5,
        info: 'Certified organic: grown without synthetic pesticides or fertilizers, and without artificial colors or preservatives.',
      });
    }
    if (product.ecoscore && ECO[product.ecoscore] !== undefined && ECO[product.ecoscore] !== 0) {
      reasons.push({
        label: `Eco-Score ${product.ecoscore.toUpperCase()}`,
        impact: ECO[product.ecoscore],
        info: 'Environmental impact grade from A to E, covering farming, processing, packaging, and transport. It has a small effect on the score.',
      });
    }
  } else {
    if (!hasIngredients) {
      return { value: null, verdict: 'Unknown', base, reasons: [], confidence };
    }
    for (const f of COSMETIC_FLAGS) {
      if (f.re.test(product.ingredients)) {
        reasons.push({ label: f.label, impact: f.impact, detail: f.detail });
      }
    }
    if (product.labels.includes('en:organic')) {
      reasons.push({ label: 'Organic', impact: 5, info: 'Certified organic ingredients.' });
    }
  }

  if (hasIngredients) {
    for (const f of GENERAL_FLAGS) {
      if (f.re.test(product.ingredients)) {
        reasons.push({ label: f.label, impact: f.impact, detail: f.detail });
      }
    }
  }

  for (const term of avoidTerms) {
    const t = term.trim().toLowerCase();
    if (t && ingredientsLower.includes(t)) {
      reasons.push({
        label: `Avoid list: ${term.trim()}`,
        impact: -15,
        detail: 'Matches an ingredient you chose to avoid',
      });
    }
  }

  const total = reasons.reduce((sum, r) => sum + r.impact, base);
  const value = Math.max(0, Math.min(100, Math.round(total)));
  reasons.sort((a, b) => a.impact - b.impact);
  return { value, verdict: verdictFor(value), base, reasons, confidence };
}
