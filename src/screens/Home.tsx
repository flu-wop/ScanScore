import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Product } from '../api';
import { HistoryEntry } from '../storage';
import { Reason, scoreProduct, Verdict } from '../score';
import { card, colors, scoreColor, space, type } from '../theme';
import ScoreRing from '../components/ScoreRing';
import Sparkline from '../components/Sparkline';

const DAY = 24 * 60 * 60 * 1000;
const VERDICTS: Verdict[] = ['Excellent', 'Good', 'Poor', 'Bad', 'Unknown'];
const VERDICT_COLOR: Record<Verdict, string> = {
  Excellent: colors.good,
  Good: colors.ok,
  Poor: colors.poor,
  Bad: colors.bad,
  Unknown: colors.unknown,
};

// Groups similar reasons so the dashboard counts "Ultra-processed" once, not per NOVA label.
function flagName(r: Reason): string | null {
  if (r.impact >= 0) return null;
  if (r.label.startsWith('Nutri-Score')) return 'Poor nutrition (Nutri-Score D/E)';
  if (r.label === 'NOVA group 4') return 'Ultra-processed';
  if (r.label === 'NOVA group 3') return 'Processed';
  if (r.label.startsWith('Eco-Score')) return 'Poor Eco-Score';
  if (/other additive/.test(r.label)) return 'Other additives';
  return r.label;
}

function average(values: number[]): number | null {
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
}

export default function Home({
  entries,
  avoid,
  onOpen,
  onScan,
}: {
  entries: HistoryEntry[];
  avoid: string[];
  onOpen: (p: Product) => void;
  onScan: () => void;
}) {
  const stats = useMemo(() => {
    const now = Date.now();
    const scored = entries.map((e) => ({ entry: e, score: scoreProduct(e.product, avoid) }));
    const valued = scored.filter((x) => x.score.value !== null);
    const thisWeek = valued.filter((x) => x.entry.ts >= now - 7 * DAY);
    const lastWeek = valued.filter((x) => x.entry.ts < now - 7 * DAY && x.entry.ts >= now - 14 * DAY);
    const pool = thisWeek.length ? thisWeek : valued;
    const avg = average(pool.map((x) => x.score.value!));
    const prevAvg = thisWeek.length ? average(lastWeek.map((x) => x.score.value!)) : null;

    const counts = Object.fromEntries(VERDICTS.map((v) => [v, 0])) as Record<Verdict, number>;
    scored.forEach((x) => (counts[x.score.verdict] += 1));

    const flagCounts = new Map<string, number>();
    let avoidHits = 0;
    for (const x of scored) {
      const names = new Set(x.score.reasons.map(flagName).filter((n): n is string => !!n));
      names.forEach((n) => flagCounts.set(n, (flagCounts.get(n) ?? 0) + 1));
      if (x.score.reasons.some((r) => r.label.startsWith('Avoid list'))) avoidHits += 1;
    }
    const flags = [...flagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    const sorted = [...valued].sort((a, b) => b.score.value! - a.score.value!);
    const best = sorted.slice(0, 3);
    const worst = sorted.slice(Math.max(3, sorted.length - 3)).reverse();

    const trend = valued.slice(0, 20).reverse().map((x) => x.score.value!);

    return {
      total: scored.length,
      avg,
      prevAvg,
      period: thisWeek.length ? 'this week' : 'all time',
      poolSize: pool.length,
      counts,
      flags,
      avoidHits,
      best,
      worst,
      trend,
    };
  }, [entries, avoid]);

  if (stats.total === 0) {
    return (
      <View style={[styles.root, styles.empty]}>
        <ScoreRing value={null} size={140} stroke={12} />
        <Text style={[styles.title, { marginTop: space.lg }]}>Your dashboard</Text>
        <Text style={styles.emptyText}>
          Scan a few products and this fills up with your average score, trends, and the red
          flags that show up most in what you buy.
        </Text>
        <Pressable style={styles.cta} onPress={onScan}>
          <Text style={styles.ctaText}>Scan your first product</Text>
        </Pressable>
      </View>
    );
  }

  const delta = stats.avg !== null && stats.prevAvg !== null ? stats.avg - stats.prevAvg : null;
  const maxFlag = stats.flags[0]?.[1] ?? 1;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.sub}>
        {stats.total} product{stats.total === 1 ? '' : 's'} scanned
      </Text>

      <View style={[card, styles.hero]}>
        <ScoreRing value={stats.avg} size={128} stroke={12} caption="avg" />
        <View style={{ flex: 1 }}>
          <Text style={styles.heroLabel}>AVERAGE SCORE</Text>
          <Text style={styles.heroPeriod}>
            {stats.period} · {stats.poolSize} scan{stats.poolSize === 1 ? '' : 's'}
          </Text>
          {delta !== null && (
            <View style={[styles.delta, { backgroundColor: (delta >= 0 ? colors.good : colors.bad) + '1A' }]}>
              <Text style={[styles.deltaText, { color: delta >= 0 ? colors.good : colors.bad }]}>
                {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} vs last week
              </Text>
            </View>
          )}
          <Pressable style={styles.heroCta} onPress={onScan}>
            <Text style={styles.ctaText}>Scan</Text>
          </Pressable>
        </View>
      </View>

      {stats.trend.length >= 2 && (
        <View style={card}>
          <Text style={styles.cardTitle}>Trend</Text>
          <Text style={styles.cardSub}>Last {stats.trend.length} scans, oldest to newest</Text>
          <Sparkline values={stats.trend} />
        </View>
      )}

      <View style={card}>
        <Text style={styles.cardTitle}>Breakdown</Text>
        <View style={styles.stack}>
          {VERDICTS.filter((v) => stats.counts[v] > 0).map((v) => (
            <View key={v} style={{ flex: stats.counts[v], backgroundColor: VERDICT_COLOR[v] }} />
          ))}
        </View>
        <View style={styles.legend}>
          {VERDICTS.filter((v) => stats.counts[v] > 0).map((v) => (
            <View key={v} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: VERDICT_COLOR[v] }]} />
              <Text style={styles.legendText}>
                {v} <Text style={styles.legendCount}>{stats.counts[v]}</Text>
              </Text>
            </View>
          ))}
        </View>
      </View>

      {stats.flags.length > 0 && (
        <View style={card}>
          <Text style={styles.cardTitle}>Top red flags</Text>
          <Text style={styles.cardSub}>What shows up most in what you scan</Text>
          {stats.flags.map(([name, count]) => (
            <View key={name} style={styles.flagRow}>
              <View style={styles.flagTop}>
                <Text style={styles.flagName} numberOfLines={1}>{name}</Text>
                <Text style={styles.flagCount}>{count}</Text>
              </View>
              <View style={styles.flagTrack}>
                <View style={[styles.flagBar, { width: `${(count / maxFlag) * 100}%` }]} />
              </View>
            </View>
          ))}
        </View>
      )}

      {avoid.length > 0 && (
        <View style={[card, styles.avoidCard]}>
          <Text style={styles.avoidNum}>{stats.avoidHits}</Text>
          <Text style={styles.avoidText}>
            product{stats.avoidHits === 1 ? '' : 's'} contained something on your avoid list
          </Text>
        </View>
      )}

      {stats.best.length > 0 && (
        <View style={card}>
          <Text style={styles.cardTitle}>Best picks</Text>
          {stats.best.map((x) => (
            <ProductRow key={x.entry.product.code} product={x.entry.product} value={x.score.value} onPress={onOpen} />
          ))}
        </View>
      )}

      {stats.worst.length > 0 && (
        <View style={card}>
          <Text style={styles.cardTitle}>Worth swapping</Text>
          {stats.worst.map((x) => (
            <ProductRow key={x.entry.product.code} product={x.entry.product} value={x.score.value} onPress={onOpen} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function ProductRow({
  product,
  value,
  onPress,
}: {
  product: Product;
  value: number | null;
  onPress: (p: Product) => void;
}) {
  return (
    <Pressable style={styles.productRow} onPress={() => onPress(product)}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.thumb} resizeMode="contain" />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty]} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.productMeta} numberOfLines={1}>{product.brand || product.code}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: scoreColor(value) }]}>
        <Text style={styles.badgeText}>{value ?? '—'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: space.xl },
  empty: { alignItems: 'center', justifyContent: 'center', padding: space.xl },
  emptyText: { ...type.body, color: colors.muted, textAlign: 'center', marginTop: space.sm, lineHeight: 23 },
  title: { ...type.display, color: colors.ink },
  sub: { ...type.body, color: colors.muted, marginTop: space.xs, marginBottom: space.md },
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.lg, padding: space.lg, borderRadius: 24 },
  heroLabel: { ...type.label, color: colors.muted },
  heroPeriod: { fontSize: 15, color: colors.ink, marginTop: 4 },
  delta: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
  deltaText: { fontSize: 13, fontWeight: '700' },
  heroCta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 10,
    marginTop: 12,
  },
  cta: { backgroundColor: colors.ink, borderRadius: 14, paddingHorizontal: space.lg, paddingVertical: 16, marginTop: space.lg },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  cardSub: { fontSize: 13, color: colors.muted, marginTop: 2, marginBottom: space.sm },
  stack: { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', gap: 2, marginTop: space.md },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 14, color: colors.muted },
  legendCount: { fontWeight: '800', color: colors.ink },
  flagRow: { paddingVertical: 7 },
  flagTop: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  flagName: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.ink },
  flagCount: { fontSize: 15, fontWeight: '800', color: colors.bad },
  flagTrack: { height: 6, borderRadius: 3, backgroundColor: colors.track, marginTop: 6, overflow: 'hidden' },
  flagBar: { height: 6, borderRadius: 3, backgroundColor: colors.bad },
  avoidCard: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avoidNum: { fontSize: 34, fontWeight: '800', color: colors.bad },
  avoidText: { flex: 1, fontSize: 15, color: colors.ink },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 8 },
  thumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.bg },
  thumbEmpty: { borderWidth: 1, borderColor: colors.line },
  productName: { fontSize: 15, fontWeight: '600', color: colors.ink },
  productMeta: { fontSize: 13, color: colors.muted, marginTop: 1 },
  badge: { minWidth: 40, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
