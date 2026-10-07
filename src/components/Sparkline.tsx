import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { colors, scoreColor } from '../theme';

// Scores (0-100) plotted oldest to newest, with a dashed line at 50.
export default function Sparkline({ values, height = 72 }: { values: number[]; height?: number }) {
  const [width, setWidth] = useState(0);
  const pad = 6;
  const x = (i: number) =>
    values.length === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (values.length - 1);
  const y = (v: number) => pad + ((100 - v) * (height - pad * 2)) / 100;
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const last = values[values.length - 1];

  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && values.length > 0 && (
        <Svg width={width} height={height}>
          <Line x1={0} x2={width} y1={y(50)} y2={y(50)} stroke={colors.line} strokeDasharray="4 4" />
          <Polyline points={points} fill="none" stroke={colors.ink} strokeWidth={2} strokeLinejoin="round" />
          {values.map((v, i) => (
            <Circle key={i} cx={x(i)} cy={y(v)} r={i === values.length - 1 ? 5 : 3} fill={scoreColor(v)} />
          ))}
          <Circle cx={x(values.length - 1)} cy={y(last)} r={8} fill={scoreColor(last)} opacity={0.2} />
        </Svg>
      )}
    </View>
  );
}
