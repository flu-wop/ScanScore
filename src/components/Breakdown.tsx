import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Score } from '../score';
import { colors, scoreColor, space } from '../theme';

const clamp = (v: number) => Math.max(0, Math.min(100, v));

// Waterfall chart: starts at the base score and shows each reason moving it up or down.
export default function Breakdown({ score }: { score: Score }) {
  const [open, setOpen] = useState<number | null>(null);
  let running = score.base;

  return (
    <View>
      <Row label="Starting score" from={0} to={score.base} impact={score.base} tint={colors.unknown} plain />
      {score.reasons.map((r, i) => {
        const from = running;
        running += r.impact;
        const info = r.info ?? r.detail;
        return (
          <Pressable key={i} onPress={() => info && setOpen(open === i ? null : i)}>
            <Row
              label={r.label}
              sub={r.info ? r.detail : undefined}
              from={from}
              to={running}
              impact={r.impact}
              tint={r.impact >= 0 ? colors.good : colors.bad}
              expandable={!!info}
              expanded={open === i}
            />
            {open === i && !!info && <Text style={styles.info}>{info}</Text>}
          </Pressable>
        );
      })}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Final score</Text>
        <Text style={[styles.totalValue, { color: scoreColor(score.value) }]}>
          {score.value ?? '—'}
        </Text>
      </View>
      {score.reasons.length > 0 && <Text style={styles.hint}>Tap a row to see why it counts.</Text>}
    </View>
  );
}

function Row({
  label,
  sub,
  from,
  to,
  impact,
  tint,
  plain,
  expandable,
  expanded,
}: {
  label: string;
  sub?: string;
  from: number;
  to: number;
  impact: number;
  tint: string;
  plain?: boolean;
  expandable?: boolean;
  expanded?: boolean;
}) {
  const lo = clamp(Math.min(from, to));
  const hi = clamp(Math.max(from, to));
  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
          {expandable ? <Text style={styles.chev}>{expanded ? '  ▾' : '  ▸'}</Text> : null}
        </Text>
        <Text style={[styles.impact, { color: plain ? colors.muted : tint }]}>
          {plain ? impact : impact > 0 ? `+${impact}` : impact}
        </Text>
      </View>
      {!!sub && <Text style={styles.sub}>{sub}</Text>}
      <View style={styles.track}>
        <View style={[styles.bar, { left: `${lo}%`, width: `${Math.max(hi - lo, 1)}%`, backgroundColor: tint }]} />
        {!plain && <View style={[styles.marker, { left: `${clamp(to)}%` }]} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 10 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  label: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.ink },
  chev: { color: colors.unknown, fontSize: 13 },
  sub: { fontSize: 13, color: colors.muted, marginTop: 1 },
  impact: { fontSize: 16, fontWeight: '800' },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.track, marginTop: 8, overflow: 'hidden' },
  bar: { position: 'absolute', top: 0, bottom: 0, borderRadius: 4 },
  marker: { position: 'absolute', top: -2, bottom: -2, width: 2, marginLeft: -1, backgroundColor: colors.ink },
  info: { fontSize: 14, lineHeight: 20, color: colors.ink, backgroundColor: colors.bg, borderRadius: 12, padding: 12, marginBottom: 6 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: { fontSize: 16, fontWeight: '800', color: colors.ink },
  totalValue: { fontSize: 22, fontWeight: '800' },
  hint: { fontSize: 12, color: colors.unknown, marginTop: 8 },
});
