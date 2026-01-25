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
// Clean, calm close with subtle pulse on CTA
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
  emeraldDark: '#059669',
};

const FONTS = {
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
};

export const CTAEndCard: React.FC<CTAEndCardProps> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Scene fade in
  const sceneOpacity = interpolate(frame, [0, 20], [0, 1], {
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
      {/* Logo + Wordmark */}
      <LogoSection frame={frame} fps={fps} />

      {/* CTA Button */}
      <CTAButton frame={frame} fps={fps} />

      {/* Tagline */}
      <Tagline frame={frame} />
    </AbsoluteFill>
  );
};

// Logo section with Tippd branding
const LogoSection: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const logoDelay = 10;
  const logoFrame = frame - logoDelay;

  const opacity = interpolate(logoFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(logoFrame, [0, 20], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 60,
      }}
    >
      {/* Logo Mark */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 24,
          backgroundColor: COLORS.emerald,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 8px 24px ${COLORS.emerald}40`,
          marginBottom: 24,
        }}
      >
        <span
          style={{
            color: COLORS.white,
            fontSize: 56,
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
          fontSize: 64,
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

// CTA button with subtle pulse animation
const CTAButton: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const buttonDelay = 30;
  const buttonFrame = frame - buttonDelay;

  const opacity = interpolate(buttonFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(buttonFrame, [0, 20], [15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // More visible pulse effect (3% scale) with sine easing for smoother motion
  // Cycle every 45 frames to fit two pulses in the scene
  const pulseActive = buttonFrame > 25;
  const pulsePhase = pulseActive ? (buttonFrame - 25) % 45 : 0;

  // Sine easing for organic breathing feel
  const pulseProgress = pulsePhase / 45;
  const sineWave = Math.sin(pulseProgress * Math.PI * 2);
  const pulseScale = pulseActive ? 1 + (sineWave * 0.015) : 1; // 3% total range (1.5% each direction)

  // Subtle shadow pulse synced with scale
  const shadowIntensity = pulseActive
    ? 0.35 + (sineWave * 0.15) // 0.2 to 0.5 range
    : 0.35;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${pulseScale})`,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.emerald,
          color: COLORS.white,
          fontSize: 28,
          fontWeight: 700,
          padding: '24px 64px',
          borderRadius: 16,
          boxShadow: `0 8px 32px rgba(16, 185, 129, ${shadowIntensity})`,
          letterSpacing: '-0.01em',
        }}
      >
        Start Free Trial
      </div>
    </div>
  );
};

// Tagline below CTA - more visible on mobile
const Tagline: React.FC<{ frame: number }> = ({ frame }) => {
  const taglineDelay = 40; // Slightly faster for tighter scene
  const taglineFrame = frame - taglineDelay;

  const opacity = interpolate(taglineFrame, [0, 20], [0, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <p
      style={{
        opacity,
        fontSize: 24,
        fontWeight: 500,
        color: COLORS.midnight, // Darker for better mobile visibility
        marginTop: 32,
        letterSpacing: '-0.01em',
      }}
    >
      Tip management, simplified
    </p>
  );
};

export default CTAEndCard;
