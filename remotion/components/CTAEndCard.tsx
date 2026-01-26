import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from 'remotion';

// ============================================
// CTA END CARD
// Premium end card with bouncy logo entrance
// ============================================

interface CTAEndCardProps {
  frame: number;
}

// Design tokens
const COLORS = {
  white: '#FFFFFF',
  midnight: '#0F172A',
  slate: '#64748B',
  emerald: '#10B981',
};

const FONTS = {
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
};

// Timeline
const LOGO_SETTLE_FRAME = 15; // Logo settles by frame 15 (~0.5s)
const TAGLINE_START = 18; // Tagline starts after logo settles
const URL_START = 35; // URL fades in later

export const CTAEndCard: React.FC<CTAEndCardProps> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Scene fade in
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: FONTS.system,
        opacity: sceneOpacity,
      }}
    >
      {/* Centered content - Logo + Tagline */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Logo + Wordmark with spring bounce */}
        <LogoSection frame={frame} fps={fps} />

        {/* Tagline - fades in after logo settles */}
        <Tagline frame={frame} />
      </div>

      {/* Bottom URL */}
      <BottomURL frame={frame} />
    </AbsoluteFill>
  );
};

// Logo + "Tippd" text with premium spring bounce
const LogoSection: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Premium bounce spring
  const logoSpring = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
      mass: 0.8,
    },
  });

  const scale = interpolate(logoSpring, [0, 1], [0, 1]);
  const opacity = interpolate(logoSpring, [0, 0.5, 1], [0, 1, 1]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `scale(${scale})`,
        opacity,
        marginBottom: 32,
      }}
    >
      {/* Logo Icon */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 28,
          backgroundColor: COLORS.emerald,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 12px 32px ${COLORS.emerald}40`,
          marginBottom: 20,
        }}
      >
        <span
          style={{
            color: COLORS.white,
            fontSize: 68,
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          T
        </span>
      </div>

      {/* Wordmark */}
      <span
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: COLORS.midnight,
          letterSpacing: '-0.02em',
        }}
      >
        Tippd
      </span>
    </div>
  );
};

// Tagline - fades in after logo settles
const Tagline: React.FC<{ frame: number }> = ({ frame }) => {
  const taglineFrame = frame - TAGLINE_START;

  const opacity = interpolate(taglineFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(taglineFrame, [0, 20], [15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        fontSize: 48,
        fontWeight: 600,
        color: COLORS.slate,
        margin: 0,
        letterSpacing: '-0.01em',
      }}
    >
      Tip transparency, <span style={{ color: COLORS.emerald }}>finally.</span>
    </div>
  );
};

// Bottom URL section
const BottomURL: React.FC<{ frame: number }> = ({ frame }) => {
  const urlFrame = frame - URL_START;

  const opacity = interpolate(urlFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(urlFrame, [0, 20], [15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <p
        style={{
          fontSize: 24,
          fontWeight: 500,
          color: COLORS.slate,
          margin: 0,
          marginBottom: 8,
        }}
      >
        Check out
      </p>
      <p
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: COLORS.emerald,
          margin: 0,
          letterSpacing: '-0.01em',
        }}
      >
        tippd-v0.vercel.app
      </p>
    </div>
  );
};

export default CTAEndCard;
