import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Concern, describeIngredient, splitIngredients } from '../ingredients';
import { colors, space } from '../theme';

const CONCERN_COLOR: Record<Concern, string> = {
  avoid: colors.bad,
  high: colors.bad,
  medium: colors.poor,
  low: colors.ok,
};

const CONCERN_LABEL: Record<Concern, string> = {
  avoid: 'Avoid list',
  high: 'High concern',
  medium: 'Moderate concern',
  low: 'Minor concern',
};

export default function IngredientChips({ text, avoid }: { text: string; avoid: string[] }) {
  const items = useMemo(
    () => splitIngredients(text).map((name) => ({ name, note: describeIngredient(name, avoid) })),
    [text, avoid]
  );
  const [open, setOpen] = useState<number | null>(null);
  const flagged = items.filter((i) => i.note).length;
  const selected = open !== null ? items[open] : null;

  return (
    <View>
      <Text style={styles.summary}>
        {items.length} ingredient{items.length === 1 ? '' : 's'}
        {flagged > 0 ? ` · ${flagged} flagged` : ' · nothing flagged'}. Tap one for details.
      </Text>
      <View style={styles.wrap}>
        {items.map((item, i) => {
          const tint = item.note ? CONCERN_COLOR[item.note.concern] : undefined;
          const active = open === i;
          return (
            <Pressable
              key={i}
              onPress={() => setOpen(active ? null : i)}
              style={[
                styles.chip,
                tint && { borderColor: tint, backgroundColor: tint + '14' },
                active && { backgroundColor: tint ?? colors.ink, borderColor: tint ?? colors.ink },
              ]}
            >
              {tint && !active && <View style={[styles.dot, { backgroundColor: tint }]} />}
              <Text style={[styles.chipText, active && { color: '#fff' }]} numberOfLines={2}>
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {selected && (
        <View style={styles.detail}>
          <Text style={styles.detailName}>{selected.name}</Text>
          {selected.note ? (
            <>
              <Text style={[styles.detailTag, { color: CONCERN_COLOR[selected.note.concern] }]}>
                {CONCERN_LABEL[selected.note.concern]} · {selected.note.title}
              </Text>
              <Text style={styles.detailNote}>{selected.note.note}</Text>
            </>
          ) : (
            <Text style={styles.detailNote}>Nothing on our watch list. No known concerns flagged.</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { fontSize: 14, color: colors.muted, marginBottom: space.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { fontSize: 14, color: colors.ink, flexShrink: 1 },
  detail: { marginTop: space.md, backgroundColor: colors.bg, borderRadius: 14, padding: space.md },
  detailName: { fontSize: 16, fontWeight: '700', color: colors.ink },
  detailTag: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  detailNote: { fontSize: 14, lineHeight: 20, color: colors.ink, marginTop: 6 },
});
