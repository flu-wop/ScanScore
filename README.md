# ScanScore

Personal barcode scanner that scores food, beauty, and household products out of 100.

## Run

```
npm install
npx expo start
```

Open the Expo Go app on your phone and scan the QR code.

## How it works

- Scan a barcode (or type one). The app queries Open Food Facts, Open Beauty Facts, and Open Products Facts in parallel and uses the first match.
- Food: scored from Nutri-Score, NOVA processing group, additives of concern, organic label, and Eco-Score.
- Beauty and other: scored from flagged ingredients (parabens, phthalates, fragrance, PFAS, microplastics, and more).
- Avoid tab: add your own ingredients to avoid; matches cost 15 points.
- Home tab: a dashboard with your average score, trend, verdict breakdown, top red flags, and best and worst products.
- Result screen: a chart showing how each factor moves the score, nutrition traffic lights, a data-confidence meter, and tappable ingredients with explanations.
- History is stored on-device only. No account, no backend.

## Tune it

- Scoring rules: `src/score.ts`
- Ingredient explanations: `src/ingredients.ts`
- Data sources: `src/api.ts`
- Colors and type: `src/theme.ts`

## Limits

Open databases are crowdsourced, so coverage is uneven and some products have no ingredients listed. Those show as "Unknown" instead of a made-up score.
