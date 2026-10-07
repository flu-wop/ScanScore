import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Product } from '../api';
import { HistoryEntry } from '../storage';
import { scoreProduct } from '../score';
import { colors, scoreColor, space, type } from '../theme';

export default function History({
  entries,
  avoid,
  onOpen,
  onClear,
}: {
  entries: HistoryEntry[];
  avoid: string[];
  onOpen: (p: Product) => void;
  onClear: () => void;
}) {
  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>History</Text>
        {entries.length > 0 && (
          <Pressable onPress={onClear} hitSlop={12}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        )}
      </View>
      <FlatList
        data={entries}
        keyExtractor={(e) => e.product.code}
        ListEmptyComponent={<Text style={styles.empty}>Scanned products appear here.</Text>}
        renderItem={({ item }) => {
          const score = scoreProduct(item.product, avoid);
          const tint = scoreColor(score.value);
          return (
            <Pressable style={styles.row} onPress={() => onOpen(item.product)}>
              {item.product.image ? (
                <Image source={{ uri: item.product.image }} style={styles.thumb} resizeMode="contain" />
              ) : (
                <View style={[styles.thumb, styles.thumbEmpty]} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {item.product.brand || item.product.code}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: tint }]}>
                <Text style={styles.badgeText}>{score.value === null ? '—' : score.value}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: space.lg, backgroundColor: colors.bg },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: space.md,
  },
  title: { ...type.display, color: colors.ink },
  clear: { ...type.body, color: colors.muted },
  empty: { ...type.body, color: colors.muted, marginTop: space.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  thumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.card },
  thumbEmpty: { borderWidth: 1, borderColor: colors.line },
  name: { fontSize: 16, fontWeight: '600', color: colors.ink },
  meta: { fontSize: 14, color: colors.muted, marginTop: 2 },
  badge: {
    minWidth: 44,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
