import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from 'remotion';

// ============================================
// SHIFT NOTIFICATION SCENE
// The "completion" moment - calm, iOS-native, trustworthy
// ============================================

interface ShiftNotificationProps {
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
  border: 'rgba(16, 185, 129, 0.15)',
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowDeep: 'rgba(0, 0, 0, 0.12)',
};

const FONTS = {
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
};

// Timing constants (in frames, 30fps)
const TIMING = {
  entryStart: 0,
  entryEnd: 10,
  settleEnd: 20,
  checkDrawStart: 20,
  checkDrawEnd: 45,
  holdStart: 45,
  holdEnd: 60,
};

// Notification data
const NOTIFICATION_DATA = {
  amount: '$450.00',
  staffCount: 5,
};

export const ShiftNotification: React.FC<ShiftNotificationProps> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Scene fade in only - TransitionSeries handles exit
  const sceneOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.offWhite,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 280,
        fontFamily: FONTS.system,
        opacity: sceneOpacity,
      }}
    >
      <NotificationCard frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

// The main floating notification card
const NotificationCard: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Card entry spring - slides down from above
  // Higher damping (22) for slower, more deliberate settle - premium feel
  const slideProgress = spring({
    frame: frame - TIMING.entryStart,
    fps,
    config: {
      damping: 22,
      mass: 0.8,
      stiffness: 120,
    },
  });

  // Map spring to Y position: -100 → 0
  const cardY = interpolate(slideProgress, [0, 1], [-100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Card opacity (fades in with entry)
  const cardOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtle scale settle (1.02 → 1.0) for premium feel
  const cardScale = interpolate(
    slideProgress,
    [0, 0.7, 1],
    [0.96, 1.01, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `translateY(${cardY}px) scale(${cardScale})`,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 28,
          padding: '48px 64px',
          boxShadow: `
            0 4px 6px ${COLORS.shadow},
            0 12px 24px ${COLORS.shadow},
            0 24px 48px ${COLORS.shadowDeep}
          `,
          border: `1px solid ${COLORS.border}`,
          textAlign: 'center',
          minWidth: 420,
        }}
      >
        {/* Checkmark Badge */}
        <CheckmarkBadge frame={frame} />

        {/* Title */}
        <NotificationTitle frame={frame} />

        {/* Supporting Text */}
        <NotificationSubtext frame={frame} />
      </div>
    </div>
  );
};

// Animated checkmark badge with SVG stroke draw
const CheckmarkBadge: React.FC<{ frame: number }> = ({ frame }) => {
  // Badge container fade in (slightly before check draws)
  const badgeOpacity = interpolate(frame, [8, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Badge scale entrance
  const badgeScale = interpolate(frame, [8, 20], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.2)),
  });

  // Circle stroke draw (frame 20-32)
  const circleProgress = interpolate(
    frame,
    [TIMING.checkDrawStart, TIMING.checkDrawStart + 12],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  // Checkmark stroke draw (frame 28-45, starts slightly after circle)
  const checkProgress = interpolate(
    frame,
    [TIMING.checkDrawStart + 8, TIMING.checkDrawEnd],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  // SVG measurements
  const circleRadius = 38;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const checkPathLength = 52; // Approximate length of checkmark path

  return (
    <div
      style={{
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.emeraldFaint,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 28px',
        opacity: badgeOpacity,
        transform: `scale(${badgeScale})`,
      }}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        style={{ overflow: 'visible' }}
      >
        {/* Background circle (static, faint) */}
        <circle
          cx="40"
          cy="40"
          r={circleRadius}
          stroke={COLORS.emeraldLight}
          strokeWidth="3"
          fill="none"
        />

        {/* Animated circle stroke */}
        <circle
          cx="40"
          cy="40"
          r={circleRadius}
          stroke={COLORS.emerald}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circleCircumference}
          strokeDashoffset={circleCircumference * (1 - circleProgress)}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
          }}
        />

        {/* Checkmark path - draws after circle */}
        <path
          d="M24 42 L35 53 L56 28"
          stroke={COLORS.emerald}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={checkPathLength}
          strokeDashoffset={checkPathLength * (1 - checkProgress)}
        />
      </svg>
    </div>
  );
};

// Title with fade-in tied to checkmark completion
const NotificationTitle: React.FC<{ frame: number }> = ({ frame }) => {
  // Title fades in as checkmark begins drawing
  const titleOpacity = interpolate(
    frame,
    [TIMING.checkDrawStart, TIMING.checkDrawStart + 15],
    [0.4, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Subtle Y slide
  const titleY = interpolate(
    frame,
    [TIMING.checkDrawStart, TIMING.checkDrawStart + 15],
    [8, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  return (
    <h2
      style={{
        fontSize: 44,
        fontWeight: 700,
        color: COLORS.midnight,
        margin: 0,
        marginBottom: 12,
        letterSpacing: '-0.02em',
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
      }}
    >
      Shift Closed
    </h2>
  );
};

// Supporting text with staggered fade
const NotificationSubtext: React.FC<{ frame: number }> = ({ frame }) => {
  // Subtext fades in slightly after title
  const subtextOpacity = interpolate(
    frame,
    [TIMING.checkDrawStart + 10, TIMING.checkDrawStart + 25],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const subtextY = interpolate(
    frame,
    [TIMING.checkDrawStart + 10, TIMING.checkDrawStart + 25],
    [6, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  return (
    <p
      style={{
        fontSize: 22,
        fontWeight: 500,
        color: COLORS.slate,
        margin: 0,
        letterSpacing: '-0.01em',
        opacity: subtextOpacity,
        transform: `translateY(${subtextY}px)`,
      }}
    >
      <span
        style={{
          color: COLORS.emerald,
          fontWeight: 700,
        }}
      >
        {NOTIFICATION_DATA.amount}
      </span>
      {' '}distributed to{' '}
      <span style={{ fontWeight: 600, color: COLORS.midnight }}>
        {NOTIFICATION_DATA.staffCount} staff
      </span>
    </p>
  );
};

export default ShiftNotification;
