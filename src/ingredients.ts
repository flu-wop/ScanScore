import { COSMETIC_FLAGS, GENERAL_FLAGS, HIGH_CONCERN_ADDITIVES } from './score';

export type Concern = 'high' | 'medium' | 'low' | 'avoid';

export interface IngredientNote {
  concern: Concern;
  title: string;
  note: string;
}

const FOOD_NOTES: { re: RegExp; concern: Concern; title: string; note: string }[] = [
  { re: /\bhydrogenated\b/i, concern: 'high', title: 'Hydrogenated oil', note: 'Can contain trans fats, which raise LDL ("bad") cholesterol and heart disease risk.' },
  { re: /\b(sodium|potassium) nitri?te\b|\bsodium nitrate\b/i, concern: 'high', title: 'Nitrites / nitrates', note: 'Curing agents in processed meat that can form cancer-linked nitrosamines when cooked.' },
  { re: /\btitanium dioxide\b/i, concern: 'high', title: 'Titanium dioxide', note: 'White coloring banned as a food additive in the EU since 2022 over possible DNA damage.' },
  { re: /\b(red|yellow|blue|green)\s?(no\.?\s?)?\d+\b|\b(allura red|tartrazine|sunset yellow|ponceau|carmoisine|brilliant blue)\b/i, concern: 'high', title: 'Synthetic dye', note: 'Petroleum-based color. Some are linked to hyperactivity in children and need warning labels in the EU.' },
  { re: /\b(bha|bht|butylated hydroxy(anisole|toluene))\b/i, concern: 'high', title: 'BHA / BHT', note: 'Synthetic preservatives. BHA is listed as a possible carcinogen.' },
  { re: /\b(aspartame|sucralose|acesulfame|saccharin)\b/i, concern: 'medium', title: 'Artificial sweetener', note: 'Zero-calorie sweetener. Research on gut health and appetite effects is mixed; the WHO advises against using them for weight control.' },
  { re: /\b(high[- ]fructose corn syrup|glucose[- ]fructose syrup|corn syrup|invert sugar)\b/i, concern: 'medium', title: 'Added syrup', note: 'A concentrated added sugar. Diets high in added sugar are linked to weight gain, diabetes, and tooth decay.' },
  { re: /\b(cane sugar|brown sugar|sugar|dextrose|sucrose|fructose|glucose)\b/i, concern: 'medium', title: 'Added sugar', note: 'Added sugar. Health guidelines suggest keeping it under about 25-50 g a day.' },
  { re: /\bcarrageenan\b/i, concern: 'medium', title: 'Carrageenan', note: 'Seaweed-based thickener. Some studies link it to gut inflammation.' },
  { re: /\bphosphoric acid\b/i, concern: 'medium', title: 'Phosphoric acid', note: 'Acidifier common in colas. High intake is linked to lower bone density.' },
  { re: /\bpalm (oil|fat|kernel)/i, concern: 'low', title: 'Palm oil', note: 'High in saturated fat, and linked to deforestation unless sustainably sourced.' },
  { re: /\bmaltodextrin\b/i, concern: 'low', title: 'Maltodextrin', note: 'Highly processed starch that raises blood sugar quickly.' },
  { re: /\bmodified (corn |maize |potato |tapioca )?starch\b/i, concern: 'low', title: 'Modified starch', note: 'Chemically treated starch used as a thickener. A marker of processed food.' },
  { re: /\b(monosodium glutamate|msg)\b/i, concern: 'low', title: 'MSG', note: 'Flavor enhancer. Generally considered safe; some people report sensitivity.' },
  { re: /\b(natural |artificial )?flavou?rs?\b|\bflavou?ring\b/i, concern: 'low', title: 'Flavorings', note: 'Catch-all term. The exact compounds do not have to be disclosed.' },
  { re: /\b(sea )?salt\b/i, concern: 'low', title: 'Salt', note: 'Fine in moderation. Most people eat more than the recommended 5-6 g a day.' },
];

function flagConcern(impact: number): Concern {
  return impact <= -12 ? 'high' : impact <= -8 ? 'medium' : 'low';
}

export function describeIngredient(name: string, avoid: string[]): IngredientNote | null {
  const lower = name.toLowerCase();
  const hit = avoid.find((t) => t.trim() && lower.includes(t.trim().toLowerCase()));
  if (hit) {
    return { concern: 'avoid', title: 'On your avoid list', note: `Matches "${hit.trim()}" from your Avoid tab. Costs 15 points.` };
  }
  const e = name.match(/\bE\s?(\d{3,4})[a-z]?\b/i);
  if (e && HIGH_CONCERN_ADDITIVES[`E${e[1]}`]) {
    return { concern: 'high', title: HIGH_CONCERN_ADDITIVES[`E${e[1]}`], note: 'An additive on our list of ones with health concerns, warning labels, or bans in some countries.' };
  }
  for (const f of [...GENERAL_FLAGS, ...COSMETIC_FLAGS]) {
    if (f.re.test(name)) return { concern: flagConcern(f.impact), title: f.label, note: f.detail + '.' };
  }
  for (const f of FOOD_NOTES) {
    if (f.re.test(name)) return { concern: f.concern, title: f.title, note: f.note };
  }
  return null;
}

// Splits an ingredient list on top-level commas, keeping "(...)" sub-lists together.
export function splitIngredients(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  const push = () => {
    const t = cur
      .replace(/^\s*ingr[eé]dients?\s*:\s*/i, '')
      .replace(/_/g, '')
      .replace(/[.\s]+$/, '')
      .trim();
    if (t) out.push(t);
    cur = '';
  };
  for (const ch of text) {
    if (ch === '(' || ch === '[') depth++;
    if ((ch === ')' || ch === ']') && depth > 0) depth--;
    if ((ch === ',' || ch === ';') && depth === 0) push();
    else cur += ch;
  }
  push();
  return out;
}
