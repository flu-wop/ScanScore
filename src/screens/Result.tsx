import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Product } from '../api';
import { scoreProduct } from '../score';
import { card, colors, scoreColor, space, type } from '../theme';
import ScoreRing from '../components/ScoreRing';
import Breakdown from '../components/Breakdown';
import NutritionBars from '../components/NutritionBars';
import ConfidenceMeter from '../components/ConfidenceMeter';
import IngredientChips from '../components/IngredientChips';

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

      <View style={[card, styles.scoreCard]}>
        <ScoreRing value={score.value} size={104} stroke={10} caption="/ 100" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.verdict, { color: tint }]}>{score.verdict}</Text>
          <Text style={styles.meta}>
            {score.value === null
              ? 'Not enough data in the open databases to score this product.'
              : `${score.confidence.level} confidence · ${score.reasons.length} factor${score.reasons.length === 1 ? '' : 's'}`}
          </Text>
        </View>
      </View>

      {score.value !== null && (
        <>
          <Text style={styles.label}>HOW THE SCORE ADDS UP</Text>
          <View style={card}>
            <Breakdown score={score} />
          </View>
        </>
      )}

      {!!product.nutrition && (
        <>
          <Text style={styles.label}>NUTRITION</Text>
          <View style={card}>
            <NutritionBars product={product} />
          </View>
        </>
      )}

      <Text style={styles.label}>DATA CONFIDENCE</Text>
      <View style={card}>
        <ConfidenceMeter confidence={score.confidence} />
      </View>

      {!!product.ingredients && (
        <>
          <Text style={styles.label}>INGREDIENTS</Text>
          <View style={card}>
            <IngredientChips text={product.ingredients} avoid={avoid} />
          </View>
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
  scoreCard: { flexDirection: 'row', alignItems: 'center', gap: space.lg, padding: space.lg, borderRadius: 24 },
  verdict: { fontSize: 28, fontWeight: '800' },
  label: { ...type.label, color: colors.muted, marginTop: space.sm, marginBottom: space.sm },
  footnote: { fontSize: 12, color: colors.unknown, marginTop: space.lg, lineHeight: 17 },
});
