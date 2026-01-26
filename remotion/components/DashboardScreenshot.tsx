import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
  staticFile,
} from 'remotion';

// ============================================
// DASHBOARD SCREENSHOT SCENE
// Uses real tippdhero.png screenshot for authenticity
// ============================================

interface DashboardScreenshotProps {
  frame: number;
}

// Design tokens
const COLORS = {
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  midnight: '#0F172A',
  slate: '#64748B',
  emerald: '#10B981',
};

const FONTS = {
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
};

export const DashboardScreenshot: React.FC<DashboardScreenshotProps> = ({ frame }) => {
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
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '50px 40px',
        fontFamily: FONTS.system,
        opacity: sceneOpacity,
      }}
    >
      {/* Header */}
      <DashboardHeader frame={frame} />

      {/* Screenshot */}
      <ScreenshotContainer frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

// Header with Tippd branding
const DashboardHeader: React.FC<{ frame: number }> = ({ frame }) => {
  const headerDelay = 8;
  const headerFrame = frame - headerDelay;

  const opacity = interpolate(headerFrame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(headerFrame, [0, 18], [15, 0], {
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
        marginBottom: 30,
      }}
    >
      {/* Logo Mark + Wordmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 11,
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
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            T
          </span>
        </div>
        <span
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: COLORS.midnight,
            letterSpacing: '-0.02em',
          }}
        >
          Tippd
        </span>
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: 44,
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
          fontSize: 18,
          fontWeight: 500,
          color: COLORS.slate,
          margin: 0,
          marginTop: 10,
          letterSpacing: '-0.01em',
        }}
      >
        Real dashboard. Real numbers.
      </p>
    </div>
  );
};

// Screenshot container with animation
const ScreenshotContainer: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const screenshotDelay = 20;
  const adjustedFrame = frame - screenshotDelay;

  // Spring entrance
  const springProgress = spring({
    frame: adjustedFrame,
    fps,
    config: {
      damping: 22,
      mass: 0.8,
      stiffness: 100,
    },
  });

  // Opacity fade in
  const opacity = interpolate(adjustedFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Y translation
  const y = interpolate(springProgress, [0, 1], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scale
  const scale = interpolate(springProgress, [0, 1], [0.96, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtle continuous zoom after entrance (Ken Burns effect)
  const kenBurnsZoom = interpolate(frame, [40, 120], [1, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const finalScale = scale * kenBurnsZoom;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${finalScale})`,
        maxWidth: 880,
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.08),
          0 16px 48px rgba(0, 0, 0, 0.06)
        `,
        border: '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      <Img
        src={staticFile('video-assets/screenshots/tippdhero.png')}
        alt="Tippd Dashboard"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
};

export default DashboardScreenshot;
