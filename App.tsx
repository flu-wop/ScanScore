import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Product } from './src/api';
import {
  addHistory,
  clearHistory,
  getAvoid,
  getHistory,
  HistoryEntry,
  setAvoid as persistAvoid,
} from './src/storage';
import { colors } from './src/theme';
import Scan from './src/screens/Scan';
import Result from './src/screens/Result';
import History from './src/screens/History';
import Avoid from './src/screens/Avoid';

type Tab = 'scan' | 'history' | 'avoid';

const TABS: { key: Tab; label: string }[] = [
  { key: 'scan', label: 'Scan' },
  { key: 'history', label: 'History' },
  { key: 'avoid', label: 'Avoid' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('scan');
  const [current, setCurrent] = useState<Product | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);

  useEffect(() => {
    getHistory().then(setHistory);
    getAvoid().then(setAvoid);
  }, []);

  const onResult = useCallback(async (product: Product) => {
    setCurrent(product);
    await addHistory(product);
    setHistory(await getHistory());
  }, []);

  const onAvoidChange = useCallback((next: string[]) => {
    setAvoid(next);
    persistAvoid(next);
  }, []);

  const onClear = useCallback(async () => {
    await clearHistory();
    setHistory([]);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <View style={styles.body}>
          {current ? (
            <Result product={current} avoid={avoid} onBack={() => setCurrent(null)} />
          ) : tab === 'scan' ? (
            <Scan onResult={onResult} />
          ) : tab === 'history' ? (
            <History entries={history} avoid={avoid} onOpen={setCurrent} onClear={onClear} />
          ) : (
            <Avoid terms={avoid} onChange={onAvoidChange} />
          )}
        </View>
        {!current && (
          <View style={styles.tabBar}>
            {TABS.map((t) => (
              <Pressable key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
                <Text style={[styles.tabText, tab === t.key && styles.tabActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  body: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.card,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.unknown },
  tabActive: { color: colors.ink },
});
