import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, scoreColor } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ScoreRing({
  value,
  size = 96,
  stroke = 9,
  caption,
}: {
  value: number | null;
  size?: number;
  stroke?: number;
  caption?: string;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);
  const target = value ?? 0;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const tint = scoreColor(value);

  useEffect(() => {
    progress.setValue(0);
    const id = progress.addListener(({ value: v }) => setShown(Math.round(v)));
    Animated.timing(progress, {
      toValue: target,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => progress.removeListener(id);
  }, [target, progress]);

  const offset = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.track} strokeWidth={stroke} fill="none" />
        {value !== null && (
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={tint}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
          />
        )}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[styles.value, { color: tint, fontSize: size * 0.34 }]}>
          {value === null ? '—' : shown}
        </Text>
        {!!caption && <Text style={styles.caption}>{caption}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  value: { fontWeight: '800' },
  caption: { fontSize: 11, fontWeight: '600', color: colors.muted, marginTop: -2 },
});
