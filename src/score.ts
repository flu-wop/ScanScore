import { Product } from './api';

export type Verdict = 'Excellent' | 'Good' | 'Poor' | 'Bad' | 'Unknown';

export interface Reason {
  label: string;
  impact: number;
  detail?: string;
}

export interface Score {
  value: number | null;
  verdict: Verdict;
  reasons: Reason[];
}

const HIGH_CONCERN_ADDITIVES: Record<string, string> = {
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

interface Flag {
  re: RegExp;
  label: string;
  impact: number;
  detail: string;
}

const COSMETIC_FLAGS: Flag[] = [
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

const GENERAL_FLAGS: Flag[] = [
  { re: /\b(pfas|ptfe|perfluoro\w*|polytetrafluoroethylene)\b/i, label: 'PFAS', impact: -20, detail: 'Persistent "forever chemical" compounds' },
  { re: /\b(bpa|bisphenol)\b/i, label: 'Bisphenols', impact: -15, detail: 'Hormone-disrupting plastic chemicals' },
];

const NUTRI: Record<string, number> = { a: 40, b: 25, c: 5, d: -15, e: -35 };
const NOVA: Record<number, number> = { 1: 10, 2: 0, 3: -8, 4: -18 };
const ECO: Record<string, number> = { a: 4, b: 2, c: 0, d: -2, e: -4 };

function verdictFor(value: number): Verdict {
  if (value >= 75) return 'Excellent';
  if (value >= 50) return 'Good';
  if (value >= 25) return 'Poor';
  return 'Bad';
}

function additiveCode(tag: string): string {
  return tag.replace(/^[a-z]{2}:/i, '').toUpperCase();
}

export function scoreProduct(product: Product, avoidTerms: string[]): Score {
  const reasons: Reason[] = [];
  const ingredientsLower = product.ingredients.toLowerCase();
  const hasIngredients = product.ingredients.length > 0;
  const isFood = product.category === 'food';

  if (isFood) {
    if (!product.nutriscore && !hasIngredients && product.nova === undefined) {
      return { value: null, verdict: 'Unknown', reasons: [] };
    }
    if (product.nutriscore && NUTRI[product.nutriscore] !== undefined) {
      reasons.push({
        label: `Nutri-Score ${product.nutriscore.toUpperCase()}`,
        impact: NUTRI[product.nutriscore],
        detail: 'Overall nutritional quality',
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
        });
      } else {
        lowConcern += 1;
      }
    }
    if (lowConcern > 0) {
      reasons.push({
        label: `${lowConcern} other additive${lowConcern > 1 ? 's' : ''}`,
        impact: -Math.min(10, lowConcern * 2),
      });
    }
    if (product.labels.includes('en:organic')) {
      reasons.push({ label: 'Organic', impact: 5 });
    }
    if (product.ecoscore && ECO[product.ecoscore] !== undefined && ECO[product.ecoscore] !== 0) {
      reasons.push({
        label: `Eco-Score ${product.ecoscore.toUpperCase()}`,
        impact: ECO[product.ecoscore],
      });
    }
  } else {
    if (!hasIngredients) {
      return { value: null, verdict: 'Unknown', reasons: [] };
    }
    for (const f of COSMETIC_FLAGS) {
      if (f.re.test(product.ingredients)) {
        reasons.push({ label: f.label, impact: f.impact, detail: f.detail });
      }
    }
    if (product.labels.includes('en:organic')) {
      reasons.push({ label: 'Organic', impact: 5 });
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

  const base = isFood ? 50 : 80;
  const total = reasons.reduce((sum, r) => sum + r.impact, base);
  const value = Math.max(0, Math.min(100, Math.round(total)));
  reasons.sort((a, b) => a.impact - b.impact);
  return { value, verdict: verdictFor(value), reasons };
}
