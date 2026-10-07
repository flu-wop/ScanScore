import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Product } from '../api';
import { scoreProduct } from '../score';
import { colors, scoreColor, space, type } from '../theme';

export default function Result({
  product,
  avoid,
  onBack,
}: {
  product: Product;
  avoid: string[];
  onBack: () => void;
}) {
  const score = useMemo(() => scoreProduct(product, avoid), [product, avoid]);
  const tint = scoreColor(score.value);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Text style={styles.back}>‹ Back</Text>
      </Pressable>

      <View style={styles.header}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.imageEmpty]} />
        )}
        <View style={styles.headerText}>
          {!!product.brand && <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>}
          <Text style={styles.name}>{product.name}</Text>
          {!!product.quantity && <Text style={styles.meta}>{product.quantity}</Text>}
        </View>
      </View>

      <View style={styles.scoreCard}>
        <View style={[styles.scoreCircle, { borderColor: tint }]}>
          <Text style={[styles.scoreValue, { color: tint }]}>
            {score.value === null ? '—' : score.value}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.verdict, { color: tint }]}>{score.verdict}</Text>
          <Text style={styles.meta}>
            {score.value === null
              ? 'Not enough data in the open databases to score this product.'
              : 'Out of 100. Based on ingredients and open data.'}
          </Text>
        </View>
      </View>

      {score.reasons.length > 0 && (
        <>
          <Text style={styles.label}>WHY</Text>
          {score.reasons.map((r, i) => (
            <View key={i} style={styles.reason}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reasonLabel}>{r.label}</Text>
                {!!r.detail && <Text style={styles.meta}>{r.detail}</Text>}
              </View>
              <Text
                style={[styles.impact, { color: r.impact >= 0 ? colors.good : colors.bad }]}
              >
                {r.impact > 0 ? `+${r.impact}` : r.impact}
              </Text>
            </View>
          ))}
        </>
      )}

      {!!product.ingredients && (
        <>
          <Text style={styles.label}>INGREDIENTS</Text>
          <Text style={styles.ingredients}>{product.ingredients}</Text>
        </>
      )}

      <Text style={styles.footnote}>
        Barcode {product.code}. Data from Open Food Facts, Open Beauty Facts, and Open
        Products Facts. Scores are a personal heuristic, not medical advice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: space.xl * 2 },
  back: { ...type.body, color: colors.muted, marginBottom: space.md },
  header: { flexDirection: 'row', gap: space.md, alignItems: 'center', marginBottom: space.lg },
  image: { width: 96, height: 96, borderRadius: 16, backgroundColor: colors.card },
  imageEmpty: { borderWidth: 1, borderColor: colors.line },
  headerText: { flex: 1 },
  brand: { ...type.label, color: colors.muted, marginBottom: 2 },
  name: { ...type.title, color: colors.ink },
  meta: { fontSize: 14, color: colors.muted, marginTop: 2 },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: space.lg,
    marginBottom: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  scoreCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: { fontSize: 32, fontWeight: '800' },
  verdict: { fontSize: 26, fontWeight: '800' },
  label: { ...type.label, color: colors.muted, marginTop: space.md, marginBottom: space.sm },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: space.md,
  },
  reasonLabel: { fontSize: 16, fontWeight: '600', color: colors.ink },
  impact: { fontSize: 18, fontWeight: '800' },
  ingredients: { ...type.body, color: colors.ink, lineHeight: 23 },
  footnote: { fontSize: 12, color: colors.unknown, marginTop: space.xl, lineHeight: 17 },
});
