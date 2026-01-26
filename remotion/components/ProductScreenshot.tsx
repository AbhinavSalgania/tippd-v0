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
// PRODUCT SCREENSHOT COMPONENT
// Displays and animates real product screenshots
// ============================================

interface ProductScreenshotProps {
  frame: number;
  src: string;
  alt?: string;
  scale?: number;
  entranceDelay?: number;
  showShadow?: boolean;
  borderRadius?: number;
  maxWidth?: number;
}

// Design tokens
const COLORS = {
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowDeep: 'rgba(0, 0, 0, 0.12)',
};

export const ProductScreenshot: React.FC<ProductScreenshotProps> = ({
  frame,
  src,
  alt = 'Product screenshot',
  scale = 1,
  entranceDelay = 0,
  showShadow = true,
  borderRadius = 16,
  maxWidth = 900,
}) => {
  const { fps } = useVideoConfig();

  const adjustedFrame = frame - entranceDelay;

  // Spring entrance
  const springProgress = spring({
    frame: adjustedFrame,
    fps,
    config: {
      damping: 20,
      mass: 0.8,
      stiffness: 120,
    },
  });

  // Opacity fade in
  const opacity = interpolate(adjustedFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Y translation (slides up)
  const y = interpolate(springProgress, [0, 1], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scale entrance
  const scaleValue = interpolate(springProgress, [0, 1], [0.95, scale], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const shadowStyle = showShadow
    ? `0 8px 32px ${COLORS.shadow}, 0 16px 48px ${COLORS.shadowDeep}`
    : 'none';

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${scaleValue})`,
        maxWidth,
        width: '100%',
        borderRadius,
        overflow: 'hidden',
        boxShadow: shadowStyle,
      }}
    >
      <Img
        src={staticFile(src)}
        alt={alt}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
};

// ============================================
// ANIMATED SCREENSHOT SCENE
// Full scene wrapper with header for screenshots
// ============================================

interface ScreenshotSceneProps {
  frame: number;
  screenshotSrc: string;
  title?: string;
  subtitle?: string;
}

const FONTS = {
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
};

const SCENE_COLORS = {
  offWhite: '#FAFAFA',
  midnight: '#0F172A',
  slate: '#64748B',
  emerald: '#10B981',
  white: '#FFFFFF',
};

export const ScreenshotScene: React.FC<ScreenshotSceneProps> = ({
  frame,
  screenshotSrc,
  title,
  subtitle,
}) => {
  // Scene fade in
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Header animations
  const headerOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const headerY = interpolate(frame, [5, 20], [15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SCENE_COLORS.offWhite,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '60px 40px',
        fontFamily: FONTS.system,
        opacity: sceneOpacity,
      }}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div
          style={{
            textAlign: 'center',
            marginBottom: 40,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
          }}
        >
          {/* Logo */}
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
                backgroundColor: SCENE_COLORS.emerald,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${SCENE_COLORS.emerald}40`,
              }}
            >
              <span
                style={{
                  color: SCENE_COLORS.white,
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
                color: SCENE_COLORS.midnight,
                letterSpacing: '-0.02em',
              }}
            >
              Tippd
            </span>
          </div>

          {title && (
            <h1
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: SCENE_COLORS.midnight,
                margin: 0,
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>
          )}

          {subtitle && (
            <p
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: SCENE_COLORS.slate,
                margin: 0,
                marginTop: 12,
                letterSpacing: '-0.01em',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Screenshot */}
      <ProductScreenshot
        frame={frame}
        src={screenshotSrc}
        entranceDelay={25}
        maxWidth={920}
        borderRadius={20}
      />
    </AbsoluteFill>
  );
};

export default ProductScreenshot;
