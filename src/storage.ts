import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from './api';

const HISTORY_KEY = 'scanscore:history';
const AVOID_KEY = 'scanscore:avoid';
const MAX_HISTORY = 200;

export interface HistoryEntry {
  product: Product;
  ts: number;
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export async function addHistory(product: Product): Promise<void> {
  const current = await getHistory();
  const next = [
    { product, ts: Date.now() },
    ...current.filter((e) => e.product.code !== product.code),
  ].slice(0, MAX_HISTORY);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}

export async function getAvoid(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(AVOID_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function setAvoid(terms: string[]): Promise<void> {
  await AsyncStorage.setItem(AVOID_KEY, JSON.stringify(terms));
}
