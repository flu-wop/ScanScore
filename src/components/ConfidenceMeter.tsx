import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Confidence } from '../score';
import { colors, space } from '../theme';

const TINT = { High: colors.good, Medium: colors.ok, Low: colors.poor };
const BLURB = {
  High: 'The database has most of what we need. This score is a solid read.',
  Medium: 'Some data is missing, so treat this score as a rough guide.',
  Low: 'Little data is available. The score could change a lot with more info.',
};

export default function ConfidenceMeter({ confidence }: { confidence: Confidence }) {
  const total = confidence.have.length + confidence.missing.length;
  const tint = TINT[confidence.level];
  return (
    <View>
      <View style={styles.top}>
        <Text style={[styles.level, { color: tint }]}>{confidence.level} confidence</Text>
        <Text style={styles.count}>
          {confidence.have.length} of {total} data points
        </Text>
      </View>
      <View style={styles.segments}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[styles.segment, { backgroundColor: i < confidence.have.length ? tint : colors.track }]}
          />
        ))}
      </View>
      <Text style={styles.blurb}>{BLURB[confidence.level]}</Text>
      {confidence.have.map((k) => (
        <Text key={k} style={styles.item}>
          <Text style={{ color: colors.good }}>✓ </Text>
          {k}
        </Text>
      ))}
      {confidence.missing.map((k) => (
        <Text key={k} style={[styles.item, styles.missing]}>
          <Text style={{ color: colors.unknown }}>✕ </Text>
          {k} not in database
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  level: { fontSize: 17, fontWeight: '800' },
  count: { fontSize: 13, color: colors.muted },
  segments: { flexDirection: 'row', gap: 4, marginTop: 10, marginBottom: 10 },
  segment: { flex: 1, height: 8, borderRadius: 4 },
  blurb: { fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: space.sm },
  item: { fontSize: 14, color: colors.ink, paddingVertical: 2 },
  missing: { color: colors.muted },
});
