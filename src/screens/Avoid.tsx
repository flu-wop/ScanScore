import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, space, type } from '../theme';

export default function Avoid({
  terms,
  onChange,
}: {
  terms: string[];
  onChange: (next: string[]) => void;
}) {
  const [value, setValue] = useState('');

  const add = () => {
    const t = value.trim();
    if (!t || terms.some((x) => x.toLowerCase() === t.toLowerCase())) {
      setValue('');
      return;
    }
    onChange([...terms, t]);
    setValue('');
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Avoid</Text>
      <Text style={styles.sub}>
        Ingredients you want to steer clear of. Any product containing one loses 15 points.
      </Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="e.g. palm oil, aspartame, fragrance"
          placeholderTextColor={colors.unknown}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={add}
        />
        <Pressable style={[styles.button, !value.trim() && styles.disabled]} onPress={add}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>
      <FlatList
        data={terms}
        keyExtractor={(t) => t}
        ListEmptyComponent={<Text style={styles.empty}>Nothing on your list yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item}</Text>
            <Pressable onPress={() => onChange(terms.filter((t) => t !== item))} hitSlop={12}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: space.lg, backgroundColor: colors.bg },
  title: { ...type.display, color: colors.ink },
  sub: { ...type.body, color: colors.muted, marginTop: space.xs, marginBottom: space.lg },
  row: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.ink,
  },
  button: {
    backgroundColor: colors.ink,
    borderRadius: 14,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
  },
  disabled: { opacity: 0.35 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  empty: { ...type.body, color: colors.muted, marginTop: space.md },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  itemText: { fontSize: 16, fontWeight: '600', color: colors.ink },
  remove: { fontSize: 14, color: colors.bad },
});
