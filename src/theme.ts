export const colors = {
  bg: '#FAFAF7',
  card: '#FFFFFF',
  ink: '#111111',
  muted: '#6B6B66',
  line: '#E8E8E2',
  good: '#1F9D55',
  ok: '#D99A12',
  poor: '#E0711D',
  bad: '#D23B3B',
  unknown: '#9A9A94',
  track: '#EFEFEA',
};

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const type = {
  display: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.8 },
};

export const card = {
  backgroundColor: colors.card,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.line,
  padding: space.md,
  marginBottom: space.md,
};

export function scoreColor(value: number | null): string {
  if (value === null) return colors.unknown;
  if (value >= 75) return colors.good;
  if (value >= 50) return colors.ok;
  if (value >= 25) return colors.poor;
  return colors.bad;
}

export function ratingColor(r: 'good' | 'ok' | 'bad' | 'neutral'): string {
  return r === 'good' ? colors.good : r === 'ok' ? colors.ok : r === 'bad' ? colors.bad : colors.unknown;
}
