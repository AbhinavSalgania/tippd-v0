import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from 'remotion';

// ============================================
// TIP BREAKDOWN SCENE
// Shows transparency - how tips were calculated
// Based on employee-dashboard.png data
// ============================================

interface TipBreakdownProps {
  frame: number;
}

// Design tokens
const COLORS = {
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  midnight: '#0F172A',
  slate: '#64748B',
  slateLight: '#94A3B8',
  emerald: '#10B981',
  emeraldLight: '#D1FAE5',
  emeraldFaint: '#ECFDF5',
  red: '#EF4444',
  redFaint: '#FEF2F2',
  amber: '#F59E0B',
  amberFaint: '#FFFBEB',
  border: 'rgba(0, 0, 0, 0.06)',
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowDeep: 'rgba(0, 0, 0, 0.12)',
};

const FONTS = {
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
};

// Real data from employee-dashboard.png
const BREAKDOWN_DATA = {
  shift: 'Fri, Jan 16 · Dinner',
  beforeTipOuts: {
    sales: 319.15,
    tips: 68.55,
    tipRate: 21.5,
  },
  tipOuts: [
    { label: 'Kitchen tip-out', amount: -15.96 },
    { label: 'Bartender tip-out', amount: -6.38 },
  ],
  afterTipOuts: {
    netTips: 46.21,
    netTipRate: 14.5,
  },
};

export const TipBreakdown: React.FC<TipBreakdownProps> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Scene fade in
  const sceneOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.offWhite,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 60,
        fontFamily: FONTS.system,
        opacity: sceneOpacity,
      }}
    >
      {/* Header */}
      <BreakdownHeader frame={frame} />

      {/* Main Card */}
      <BreakdownCard frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

// Header
const BreakdownHeader: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [5, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(frame, [5, 18], [15, 0], {
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
        marginBottom: 24,
      }}
    >
      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.slate,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          margin: 0,
          marginBottom: 8,
        }}
      >
        Staff sees exactly
      </p>
      <h2
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: COLORS.midnight,
          margin: 0,
          letterSpacing: '-0.02em',
        }}
      >
        How tips were calculated
      </h2>
    </div>
  );
};

// Main breakdown card
const BreakdownCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const cardDelay = 15;
  const cardFrame = frame - cardDelay;

  const springProgress = spring({
    frame: cardFrame,
    fps,
    config: {
      damping: 20,
      mass: 0.8,
      stiffness: 120,
    },
  });

  const opacity = interpolate(cardFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(springProgress, [0, 1], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(springProgress, [0, 1], [0.96, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        width: '100%',
        maxWidth: 380,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 24,
          padding: '28px 32px',
          boxShadow: `
            0 4px 12px ${COLORS.shadow},
            0 12px 32px ${COLORS.shadowDeep}
          `,
        }}
      >
        {/* Shift Label */}
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: COLORS.slate,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              backgroundColor: COLORS.emeraldFaint,
              color: COLORS.emerald,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Dinner
          </span>
          {BREAKDOWN_DATA.shift}
        </div>

        {/* Before Tip-Outs Section */}
        <BeforeTipOuts frame={frame} />

        {/* Tip-Outs Section */}
        <TipOutsSection frame={frame} />

        {/* After Tip-Outs Section */}
        <AfterTipOuts frame={frame} />
      </div>
    </div>
  );
};

// Before tip-outs section
const BeforeTipOuts: React.FC<{ frame: number }> = ({ frame }) => {
  const sectionDelay = 25;
  const sectionFrame = frame - sectionDelay;

  const opacity = interpolate(sectionFrame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        marginBottom: 16,
        padding: '16px',
        backgroundColor: COLORS.offWhite,
        borderRadius: 12,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: COLORS.emerald,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: 0,
          marginBottom: 12,
        }}
      >
        Before Tip-Outs
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <BreakdownRow
          label="Sales total"
          value={`$${BREAKDOWN_DATA.beforeTipOuts.sales.toFixed(2)}`}
        />
        <BreakdownRow
          label="Tips collected"
          value={`$${BREAKDOWN_DATA.beforeTipOuts.tips.toFixed(2)}`}
          valueColor={COLORS.emerald}
        />
        <BreakdownRow
          label="Tip rate"
          value={`${BREAKDOWN_DATA.beforeTipOuts.tipRate}%`}
        />
      </div>
    </div>
  );
};

// Tip-outs section
const TipOutsSection: React.FC<{ frame: number }> = ({ frame }) => {
  const sectionDelay = 35;
  const sectionFrame = frame - sectionDelay;

  const opacity = interpolate(sectionFrame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        marginBottom: 16,
        padding: '16px',
        backgroundColor: COLORS.amberFaint,
        borderRadius: 12,
        border: `1px solid rgba(245, 158, 11, 0.2)`,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: COLORS.amber,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: 0,
          marginBottom: 12,
        }}
      >
        Tip-Outs
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {BREAKDOWN_DATA.tipOuts.map((tipOut) => (
          <BreakdownRow
            key={tipOut.label}
            label={tipOut.label}
            value={`$${tipOut.amount.toFixed(2)}`}
            valueColor={COLORS.red}
          />
        ))}
      </div>
    </div>
  );
};

// After tip-outs section
const AfterTipOuts: React.FC<{ frame: number }> = ({ frame }) => {
  const sectionDelay = 45;
  const sectionFrame = frame - sectionDelay;

  const opacity = interpolate(sectionFrame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(sectionFrame, [0, 15], [0.98, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.1)),
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        padding: '20px 16px',
        backgroundColor: COLORS.emeraldFaint,
        borderRadius: 12,
        border: `1px solid ${COLORS.emeraldLight}`,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: COLORS.emerald,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: 0,
          marginBottom: 12,
        }}
      >
        Your Take-Home
      </p>

      <div
        style={{
          fontSize: 42,
          fontWeight: 800,
          color: COLORS.emerald,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        ${BREAKDOWN_DATA.afterTipOuts.netTips.toFixed(2)}
      </div>

      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: COLORS.slate,
          margin: 0,
        }}
      >
        Net tip rate: {BREAKDOWN_DATA.afterTipOuts.netTipRate}%
      </p>
    </div>
  );
};

// Reusable row component
interface BreakdownRowProps {
  label: string;
  value: string;
  valueColor?: string;
}

const BreakdownRow: React.FC<BreakdownRowProps> = ({
  label,
  value,
  valueColor = COLORS.midnight,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: COLORS.slate,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: valueColor,
        }}
      >
        {value}
      </span>
    </div>
  );
};

export default TipBreakdown;
