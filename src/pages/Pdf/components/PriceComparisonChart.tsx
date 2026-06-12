import React from 'react';

type ChartTheme = {
  primary: string;
  secondary: string;
  secondaryLight: string;
  text: string;
  textMuted: string;
  cardBackground: string;
  cardBorder: string;
};

interface SimilarProperty {
  id: number;
  valor: number;
  area: number;
}

interface EvaluatedProperty {
  valorEstimado: number;
  area: number;
}

interface PriceComparisonChartProps {
  samples: SimilarProperty[];
  evaluatedProperty: EvaluatedProperty;
  accentColor?: 'blue' | 'emerald';
  size?: 'default' | 'large'; // 'large' for TV/presentation mode
  theme?: ChartTheme;
}

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const h = hex.trim();
  if (!h.startsWith('#')) return null;
  const raw = h.slice(1);
  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16);
    const g = parseInt(raw[1] + raw[1], 16);
    const b = parseInt(raw[2] + raw[2], 16);
    return { r, g, b };
  }
  if (raw.length === 6) {
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
};

const toRgba = (color: string, alpha: number) => {
  const c = (color || '').trim();
  if (/^rgba\(/i.test(c)) {
    const inner = c.replace(/^rgba\(|\)$/gi, '');
    const parts = inner.split(',').map(p => p.trim());
    if (parts.length >= 3) {
      const [r, g, b] = parts;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  if (/^rgb\(/i.test(c)) {
    const inner = c.replace(/^rgb\(|\)$/gi, '');
    const parts = inner.split(',').map(p => p.trim());
    if (parts.length >= 3) {
      const [r, g, b] = parts;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  const rgb = hexToRgb(c);
  if (rgb) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  return c;
};

interface ChartData {
  label: string;
  pricePerSqm: number;
  area: number;
  isEvaluated: boolean;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}k`;
  }
  return `R$ ${value.toFixed(0)}`;
};

const formatFullCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    maximumFractionDigits: 0 
  }).format(value);
};

export const PriceComparisonChart: React.FC<PriceComparisonChartProps> = ({
  samples,
  evaluatedProperty,
  accentColor = 'blue',
  size = 'default',
  theme
}) => {
  // Size configuration for TV/presentation mode
  const isLarge = size === 'large';
  const titleFontSize = isLarge ? 'text-sm' : 'text-xs';
  const legendFontSize = isLarge ? 'text-xs' : 'text-[10px]';
  const legendDotSize = isLarge ? 'w-4 h-4' : 'w-3 h-3';
  const svgValueFontSize = isLarge ? 12 : 9;
  const svgLabelFontSize = isLarge ? 11 : 8;
  const svgAreaFontSize = isLarge ? 9 : 7;
  const svgAxisFontSize = isLarge ? 11 : 9;
  const svgAxisLabelFontSize = isLarge ? 10 : 8;
  // Limit samples to max 5
  const limitedSamples = samples.slice(0, 5);
  
  // Calculate price per sqm for each sample
  const sampleData: ChartData[] = limitedSamples.map((sample, idx) => ({
    label: `Amostra ${String(idx + 1).padStart(2, '0')}`,
    pricePerSqm: sample.area > 0 ? sample.valor / sample.area : 0,
    area: sample.area,
    isEvaluated: false
  }));

  // Calculate price per sqm for evaluated property
  const evaluatedData: ChartData = {
    label: 'Seu Imóvel',
    pricePerSqm: evaluatedProperty.area > 0 
      ? evaluatedProperty.valorEstimado / evaluatedProperty.area 
      : 0,
    area: evaluatedProperty.area,
    isEvaluated: true
  };

  // Intercalate: first half of samples, evaluated, second half
  const half = Math.ceil(sampleData.length / 2);
  const chartData: ChartData[] = [
    ...sampleData.slice(0, half),
    evaluatedData,
    ...sampleData.slice(half)
  ];

  // Filter out zero values
  const validData = chartData.filter(d => d.pricePerSqm > 0);
  
  if (validData.length < 2) return null;

  // Calculate scale
  const allValues = validData.map(d => d.pricePerSqm);
  const minValue = Math.min(...allValues) * 0.85;
  const maxValue = Math.max(...allValues) * 1.1;
  const range = maxValue - minValue;

  // Chart dimensions
  const chartWidth = 480;
  const chartHeight = 160;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;
  const barAreaWidth = chartWidth - paddingLeft - paddingRight;
  const barAreaHeight = chartHeight - paddingTop - paddingBottom;
  const barWidth = Math.min(50, (barAreaWidth / validData.length) * 0.65);
  const barGap = (barAreaWidth - (barWidth * validData.length)) / (validData.length + 1);

  // Color scheme (prefer theme if provided)
  const sampleColor = theme ? toRgba(theme.textMuted, 0.35) : '#374151'; // slate-700 fallback
  const evaluatedColor = theme ? theme.primary : '#DF6009';
  const gridColor = theme
    ? toRgba(theme.secondary, 0.15)
    : accentColor === 'emerald'
      ? 'rgba(16, 185, 129, 0.15)'
      : 'rgba(59, 130, 246, 0.15)';
  const textColor = theme
    ? toRgba(theme.textMuted, 0.75)
    : accentColor === 'emerald'
      ? 'rgba(167, 243, 208, 0.6)'
      : 'rgba(147, 197, 253, 0.6)';
  const accentTextColor = theme
    ? toRgba(theme.secondaryLight, 0.85)
    : accentColor === 'emerald'
      ? 'rgba(167, 243, 208, 0.6)'
      : 'rgba(147, 197, 253, 0.6)';
  const borderColor = theme
    ? theme.cardBorder
    : accentColor === 'emerald'
      ? 'rgba(16, 185, 129, 0.2)'
      : 'rgba(96, 165, 250, 0.2)';

  // Generate Y-axis ticks (3 ticks)
  const tickCount = 3;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const value = minValue + (range * (i / (tickCount - 1)));
    return value;
  });

  // Calculate bar height based on value
  const getBarHeight = (value: number) => {
    const normalizedValue = (value - minValue) / range;
    return Math.max(10, normalizedValue * barAreaHeight);
  };

  return (
    <div 
      className={`backdrop-blur-xl rounded-xl ${isLarge ? 'p-5' : 'p-4'} mb-4 h-full flex flex-col`}
      style={{
        background: theme
          ? theme.cardBackground
          : accentColor === 'emerald' 
            ? 'rgba(16, 185, 129, 0.1)' 
            : 'rgba(59, 130, 246, 0.1)',
        border: `1px solid ${borderColor}`
      }}
    >
      <p 
        className={`${titleFontSize} uppercase tracking-wider mb-3 text-center font-semibold`}
        style={{ color: accentTextColor }}
      >
        Comparativo de Valor por m²
      </p>
      
      <div className="flex-1 min-h-0">
        <svg 
          width="100%" 
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible"
        >
          {/* Grid lines */}
          {ticks.map((tick, i) => {
            const y = paddingTop + barAreaHeight - ((tick - minValue) / range) * barAreaHeight;
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke={gridColor}
                  strokeWidth={1}
                  strokeDasharray={i === 0 ? "0" : "4 4"}
                />
                <text
                  x={paddingLeft - 8}
                  y={y}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fill={textColor}
                  fontSize={svgAxisFontSize}
                  fontFamily="Inter, sans-serif"
                >
                  {formatCurrency(tick)}
                </text>
              </g>
            );
          })}

          {/* Y-axis label */}
          <text
            x={10}
            y={chartHeight / 2}
            textAnchor="middle"
            fill={textColor}
            fontSize={svgAxisLabelFontSize}
            fontFamily="Inter, sans-serif"
            transform={`rotate(-90, 10, ${chartHeight / 2})`}
          >
            Valor por m²
          </text>

          {/* Bars */}
          {validData.map((item, index) => {
            const barHeight = getBarHeight(item.pricePerSqm);
            const x = paddingLeft + barGap + index * (barWidth + barGap);
            const y = paddingTop + barAreaHeight - barHeight;
            const fillColor = item.isEvaluated ? evaluatedColor : sampleColor;

            return (
              <g key={index}>
                {/* Bar shadow for depth */}
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill="rgba(0,0,0,0.2)"
                />
                
                {/* Main bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill={fillColor}
                  className={item.isEvaluated ? 'drop-shadow-lg' : ''}
                />

                {/* Highlight gradient for evaluated property */}
                {item.isEvaluated && (
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={4}
                    fill="url(#evaluatedGradient)"
                    style={{ mixBlendMode: 'overlay' }}
                  />
                )}

                {/* Value label above bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                   fill={item.isEvaluated ? (theme ? theme.text : '#FFFFFF') : (theme ? toRgba(theme.text, 0.8) : 'rgba(255,255,255,0.8)')}
                  fontSize={svgValueFontSize}
                  fontWeight={item.isEvaluated ? 'bold' : 'normal'}
                  fontFamily="Inter, sans-serif"
                >
                  {formatFullCurrency(item.pricePerSqm)}/m²
                </text>

                {/* Label below bar */}
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + barAreaHeight + 14}
                  textAnchor="middle"
                  fill={item.isEvaluated ? evaluatedColor : textColor}
                  fontSize={svgLabelFontSize}
                  fontWeight={item.isEvaluated ? 'bold' : 'normal'}
                  fontFamily="Inter, sans-serif"
                >
                  {item.label}
                </text>

                {/* Area below label */}
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + barAreaHeight + 26}
                  textAnchor="middle"
                  fill={textColor}
                  fontSize={svgAreaFontSize}
                  fontFamily="Inter, sans-serif"
                >
                  ({item.area}m²)
                </text>
              </g>
            );
          })}

          {/* Gradient definition for evaluated bar */}
          <defs>
            <linearGradient id="evaluatedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Legend */}
      <div className={`flex justify-center gap-6 ${isLarge ? 'mt-4' : 'mt-3'}`}>
        <div className="flex items-center gap-2">
          <div 
            className={`${legendDotSize} rounded-sm`}
            style={{ backgroundColor: sampleColor }}
          />
          <span 
            className={legendFontSize}
            style={{ color: textColor }}
          >
            Amostras
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className={`${legendDotSize} rounded-sm`}
            style={{ backgroundColor: evaluatedColor }}
          />
          <span 
            className={legendFontSize}
            style={{ color: textColor }}
          >
            Seu Imóvel
          </span>
        </div>
      </div>
    </div>
  );
};
