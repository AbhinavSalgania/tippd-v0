import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from 'remotion';

// ============================================
// TRUST STATS SCENE
// Credibility beat with concrete proof points
// ============================================

interface TrustStatsProps {
  frame: number;
}

// Design tokens
const COLORS = {
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  midnight: '#0F172A',
  slate: '#64748B',
  emerald: '#10B981',
  emeraldLight: '#D1FAE5',
};

const FONTS = {
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
};

// Stats data from landing page
const STATS = [
  {
    value: '90',
    suffix: '%',
    label: 'Time Saved',
    sublabel: 'vs. Spreadsheets',
    color: COLORS.emerald,
  },
  {
    value: '2',
    suffix: ' min',
    label: 'Average',
    sublabel: 'Processing Time',
    color: COLORS.emerald,
  },
  {
    value: '100',
    suffix: '%',
    label: 'IRS',
    sublabel: 'Compliant',
    color: COLORS.emerald,
  },
];

export const TrustStats: React.FC<TrustStatsProps> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Scene fade in
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.offWhite,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: FONTS.system,
        opacity: sceneOpacity,
        padding: '60px 40px',
      }}
    >
      {/* Header */}
      <TrustHeader frame={frame} />

      {/* Stats Row */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          marginTop: 60,
        }}
      >
        {STATS.map((stat, index) => (
          <StatCard
            key={stat.label}
            stat={stat}
            index={index}
            frame={frame}
            fps={fps}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Header component
const TrustHeader: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(frame, [5, 20], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  return (
    <div
      style={{
        textAlign: 'center',
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <p
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: COLORS.slate,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          margin: 0,
          marginBottom: 12,
        }}
      >
        Trusted by restaurants
      </p>
      <h2
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: COLORS.midnight,
          margin: 0,
          letterSpacing: '-0.025em',
        }}
      >
        Results that matter
      </h2>
    </div>
  );
};

// Individual stat card
interface StatCardProps {
  stat: {
    value: string;
    suffix: string;
    label: string;
    sublabel: string;
    color: string;
  };
  index: number;
  frame: number;
  fps: number;
}

const StatCard: React.FC<StatCardProps> = ({ stat, index, frame, fps }) => {
  // Staggered entrance
  const delay = 15 + index * 10;
  const cardFrame = frame - delay;

  // Card entrance with spring
  const springProgress = spring({
    frame: cardFrame,
    fps,
    config: {
      damping: 18,
      mass: 0.8,
      stiffness: 150,
    },
  });

  const opacity = interpolate(cardFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(springProgress, [0, 1], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(springProgress, [0, 1], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Count-up animation for the value
  const countUpStart = delay + 10;
  const countUpDuration = 25;
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

  const displayValue = Math.round(parseInt(stat.value) * countProgress);

  return (
    <div
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: '40px 48px',
        textAlign: 'center',
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        minWidth: 260,
      }}
    >
      {/* Value */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: stat.color,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {displayValue}
        <span style={{ fontSize: 48 }}>{stat.suffix}</span>
      </div>

      {/* Label */}
      <p
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: COLORS.midnight,
          margin: 0,
          marginTop: 16,
        }}
      >
        {stat.label}
      </p>

      {/* Sublabel */}
      <p
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: COLORS.slate,
          margin: 0,
          marginTop: 4,
        }}
      >
        {stat.sublabel}
      </p>
    </div>
  );
};

export default TrustStats;
