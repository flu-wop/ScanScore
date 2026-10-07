import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Product } from '../api';
import { isDrink, NUTRIENTS, rateNutrient } from '../score';
import { colors, ratingColor, space } from '../theme';

const RATING_LABEL = { good: 'Low', ok: 'Medium', bad: 'High', neutral: 'Low' } as const;
const PLUS_LABEL = { good: 'High', ok: 'Some', bad: 'Low', neutral: 'Low' } as const;

export default function NutritionBars({ product }: { product: Product }) {
  const n = product.nutrition;
  if (!n) return null;
  const drink = isDrink(product);
  const rows = NUTRIENTS.filter((d) => n[d.key] !== undefined);

  return (
    <View>
      {n.energyKcal !== undefined && (
        <Text style={styles.kcal}>
          {Math.round(n.energyKcal)} kcal per {drink ? '100 ml' : '100 g'}
        </Text>
      )}
      {rows.map((d) => {
        const v = n[d.key]!;
        const r = rateNutrient(d, v, drink);
        const tint = ratingColor(r);
        const tag = d.better === 'low' ? RATING_LABEL[r] : PLUS_LABEL[r];
        return (
          <View key={d.key} style={styles.row}>
            <View style={styles.top}>
              <Text style={styles.label}>{d.label}</Text>
              <Text style={styles.value}>
                {v >= 10 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, '')} g{'  '}
                <Text style={[styles.tag, { color: tint }]}>{tag}</Text>
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.bar, { width: `${Math.min(100, (v / d.max) * 100)}%`, backgroundColor: tint }]} />
            </View>
          </View>
        );
      })}
      <Text style={styles.note}>
        Colors use UK Food Standards Agency traffic-light levels{drink ? ' for drinks' : ''}.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kcal: { fontSize: 14, color: colors.muted, marginBottom: 4 },
  row: { paddingVertical: 8 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { fontSize: 15, fontWeight: '600', color: colors.ink },
  value: { fontSize: 15, color: colors.ink },
  tag: { fontSize: 13, fontWeight: '700' },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.track, marginTop: 6, overflow: 'hidden' },
  bar: { height: 8, borderRadius: 4 },
  note: { fontSize: 12, color: colors.unknown, marginTop: space.sm },
});
