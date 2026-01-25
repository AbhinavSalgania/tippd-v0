import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from 'remotion';

// ============================================
// DASHBOARD ZEN SCENE
// The "solution" moment - calm, precise, trustworthy
// ============================================

interface DashboardZenProps {
  frame: number;
  startCountAtFrame?: number; // Frame when count-up animations begin (default: 60)
}

// Design tokens - Fintech Clean
const COLORS = {
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  midnight: '#0F172A',
  slate: '#64748B',
  slateLight: '#94A3B8',
  emerald: '#10B981',
  emeraldLight: '#D1FAE5',
  cardBg: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.06)',
};

const FONTS = {
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
};

// Real data from ShiftSummary - no invented metrics
const SHIFT_DATA = {
  netTips: 256.43,
  tipRate: 18.5,
  totalSales: 1450.0,
};

export const DashboardZen: React.FC<DashboardZenProps> = ({ frame, startCountAtFrame = 60 }) => {
  // Scene-level fade in only - TransitionSeries handles exit
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.offWhite,
        opacity: bgOpacity,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '60px 40px',
        fontFamily: FONTS.system,
      }}
    >
      {/* Header */}
      <DashboardHeader frame={frame} />

      {/* Main Dashboard Container */}
      <DashboardContainer frame={frame} startCountAtFrame={startCountAtFrame} />

      {/* Stat Cards Row */}
      <StatCardsRow frame={frame} startCountAtFrame={startCountAtFrame} />
    </AbsoluteFill>
  );
};

// Header with Tippd branding
const DashboardHeader: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Header enters after background - faster for tighter scene
  const headerDelay = 12;
  const headerFrame = frame - headerDelay;

  const opacity = interpolate(headerFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Expo easing for softer settle - contrast with chaos scene
  const y = interpolate(headerFrame, [0, 20], [15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        textAlign: 'center',
        marginBottom: 40,
      }}
    >
      {/* Logo Mark + Wordmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: COLORS.emerald,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${COLORS.emerald}40`,
          }}
        >
          <span
            style={{
              color: COLORS.white,
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            T
          </span>
        </div>
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: COLORS.midnight,
            letterSpacing: '-0.02em',
          }}
        >
          Tippd
        </span>
      </div>

      {/* Headline - direct, not jargon */}
      <h1
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: COLORS.midnight,
          margin: 0,
          letterSpacing: '-0.025em',
          lineHeight: 1.2,
        }}
      >
        Every shift, handled.
      </h1>

      {/* Subheadline */}
      <p
        style={{
          fontSize: 20,
          fontWeight: 500,
          color: COLORS.slate,
          margin: 0,
          marginTop: 12,
          letterSpacing: '-0.01em',
        }}
      >
        Friday, January 24 · Dinner Shift
      </p>
    </div>
  );
};

// Main dashboard container with summary card
const DashboardContainer: React.FC<{ frame: number; startCountAtFrame: number }> = ({ frame, startCountAtFrame }) => {
  const { fps } = useVideoConfig();

  // Faster entrance for tighter scene
  const containerDelay = 25;
  const containerFrame = frame - containerDelay;

  const opacity = interpolate(containerFrame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Expo easing for softer settle
  const y = interpolate(containerFrame, [0, 25], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  // Count-up starts at startCountAtFrame
  const countUpStart = startCountAtFrame;
  const countUpDuration = 40;
  const countProgress = interpolate(
    frame,
    [countUpStart, countUpStart + countUpDuration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  const displayedNetTips = SHIFT_DATA.netTips * countProgress;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        width: '100%',
        maxWidth: 900,
        marginBottom: 32,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.cardBg,
          borderRadius: 24,
          padding: '48px 56px',
          boxShadow: `0 8px 32px ${COLORS.shadow}, 0 2px 8px ${COLORS.shadow}`,
          textAlign: 'center',
        }}
      >
        {/* Label */}
        <p
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: COLORS.slate,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: 0,
            marginBottom: 12,
          }}
        >
          Your Net Tips
        </p>

        {/* Main Value */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: COLORS.emerald,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            margin: 0,
          }}
        >
          ${displayedNetTips.toFixed(2)}
        </div>

        {/* Supporting Detail */}
        <p
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: COLORS.slateLight,
            margin: 0,
            marginTop: 16,
          }}
        >
          After tip-outs · Ready for payout
        </p>
      </div>
    </div>
  );
};

// Three stat cards in a row
const StatCardsRow: React.FC<{ frame: number; startCountAtFrame: number }> = ({ frame, startCountAtFrame }) => {
  // Offset stat card delays relative to startCountAtFrame
  const baseDelay = startCountAtFrame + 20;
  const stats = [
    {
      label: 'Total Sales',
      value: SHIFT_DATA.totalSales,
      format: 'currency',
      delay: baseDelay,
    },
    {
      label: 'Tip Rate',
      value: SHIFT_DATA.tipRate,
      format: 'percent',
      delay: baseDelay + 8,
    },
    {
      label: 'Staff Paid',
      value: 5,
      format: 'number',
      delay: baseDelay + 16,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        width: '100%',
        maxWidth: 900,
      }}
    >
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          format={stat.format as 'currency' | 'percent' | 'number'}
          delay={stat.delay}
          frame={frame}
          index={index}
        />
      ))}
    </div>
  );
};

// Individual stat card with count-up
interface StatCardProps {
  label: string;
  value: number;
  format: 'currency' | 'percent' | 'number';
  delay: number;
  frame: number;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  format,
  delay,
  frame,
  index,
}) => {
  const { fps } = useVideoConfig();

  const cardFrame = frame - delay;

  // Card entrance - gentle fade + slide
  const opacity = interpolate(cardFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(cardFrame, [0, 20], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Count-up animation - starts 20 frames after card appears
  const countUpStart = delay + 20;
  const countUpDuration = 35;
  const countProgress = interpolate(
    frame,
    [countUpStart, countUpStart + countUpDuration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  const displayedValue = value * countProgress;

  // Format the displayed value
  const formattedValue = formatValue(displayedValue, format);

  if (cardFrame < 0) return null;

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: COLORS.cardBg,
        borderRadius: 20,
        padding: '32px 24px',
        textAlign: 'center',
        opacity,
        transform: `translateY(${y}px)`,
        boxShadow: `0 4px 16px ${COLORS.shadow}`,
      }}
    >
      {/* Label */}
      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.slate,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: 0,
          marginBottom: 12,
        }}
      >
        {label}
      </p>

      {/* Value - larger for mobile readability */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: format === 'currency' ? COLORS.emerald : COLORS.midnight,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {formattedValue}
      </div>
    </div>
  );
};

// Format value based on type
function formatValue(
  value: number,
  format: 'currency' | 'percent' | 'number'
): string {
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'number':
      return Math.round(value).toString();
    default:
      return value.toString();
  }
}

export default DashboardZen;
