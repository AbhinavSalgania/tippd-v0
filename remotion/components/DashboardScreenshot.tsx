import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useVideoConfig,
  staticFile,
} from 'remotion';

// ============================================
// DASHBOARD SCREENSHOT SCENE - "THE OPEN BOOK"
// Animated reveal using real screenshots
// Shows the solution: transparency over chaos
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
  // Exact match for the green card background in screenshot
  greenCardBg: '#ECFDF5',
  highlightYellow: 'rgba(253, 224, 71, 0.4)',
};

const FONTS = {
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
};

// Timeline constants (30fps, 180 frames total = 6 seconds)
const SCENE_ENTRANCE_END = 15;
const HEADLINE_START = 15;
const HEADLINE_END = 30;
const COUNTUP_START = 18;
const COUNTUP_END = 50;
const CURSOR_START = 85;
const BUTTON_PRESS = 100;
const SCREENSHOT_SWAP_START = 110;
const SCREENSHOT_SWAP_END = 125;
const HIGHLIGHT_START = 130;
const HIGHLIGHT_END = 155;
const FINAL_TEXT_START = 150;

export const DashboardScreenshot: React.FC<DashboardScreenshotProps> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Scene fade in
  const sceneOpacity = interpolate(frame, [0, SCENE_ENTRANCE_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.offWhite,
        justifyContent: 'flex-start',
        alignItems: 'center',
        fontFamily: FONTS.system,
        opacity: sceneOpacity,
        overflow: 'hidden',
      }}
    >
      {/* Main headline - "So, we made Tippd" */}
      <MainHeadline frame={frame} />

      {/* Screenshot with animations */}
      <ScreenshotContainer frame={frame} fps={fps} />

      {/* Cursor overlay */}
      <AnimatedCursor frame={frame} fps={fps} />

      {/* Final text overlay */}
      <FinalTextOverlay frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

// Main headline - "So, we made Tippd"
const MainHeadline: React.FC<{ frame: number }> = ({ frame }) => {
  const headlineProgress = interpolate(frame, [HEADLINE_START, HEADLINE_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = headlineProgress;
  const y = interpolate(headlineProgress, [0, 1], [20, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity,
        transform: `translateY(${y}px)`,
        zIndex: 20,
      }}
    >
      <h1
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: COLORS.midnight,
          margin: 0,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}
      >
        So, we made{' '}
        <span style={{ color: COLORS.emerald }}>Tippd</span>
      </h1>
    </div>
  );
};

// Screenshot container with scroll animation
const ScreenshotContainer: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const containerDelay = 8;
  const adjustedFrame = frame - containerDelay;

  // Spring entrance
  const springProgress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 22, mass: 0.8, stiffness: 100 },
  });

  // Entrance opacity
  const entranceOpacity = interpolate(adjustedFrame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Y translation for entrance
  const entranceY = interpolate(springProgress, [0, 1], [50, 0]);

  // Simple scroll animation after count-up
  const scrollSpring = spring({
    frame: Math.max(0, frame - COUNTUP_END),
    fps,
    config: { damping: 25, mass: 1.2, stiffness: 60 },
  });

  const scrollY = interpolate(scrollSpring, [0, 1], [0, -450]);

  // Screenshot swap - crossfade from scene 3-1 to scene 3-2
  const swapProgress = interpolate(frame, [SCREENSHOT_SWAP_START, SCREENSHOT_SWAP_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // TIP-OUTS highlight pulse
  const highlightProgress = interpolate(frame, [HIGHLIGHT_START, HIGHLIGHT_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const highlightOpacity = frame >= HIGHLIGHT_START
    ? interpolate(highlightProgress, [0, 0.3, 0.7, 1], [0, 0.8, 0.8, 0.5])
    : 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 200,
        left: '50%',
        transform: `translateX(-50%) translateY(${entranceY}px)`,
        opacity: entranceOpacity,
        width: 950,
        height: 1400,
        overflow: 'hidden',
        borderRadius: 20,
        boxShadow: `
          0 16px 64px rgba(0, 0, 0, 0.15),
          0 32px 80px rgba(0, 0, 0, 0.1)
        `,
        border: '1px solid rgba(0, 0, 0, 0.08)',
        backgroundColor: COLORS.white,
      }}
    >
      {/* Screenshot 1 - Dashboard overview */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          transform: `translateY(${scrollY}px)`,
          opacity: 1 - swapProgress,
        }}
      >
        <Img
          src={staticFile('video-assets/screenshots/scene-3-1.png')}
          alt="Tippd Dashboard"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />

        {/* Count-up overlay */}
        <TakeHomeEarningsOverlay frame={frame} fps={fps} />
      </div>

      {/* Screenshot 2 - Tip breakdown detail */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${scrollY}px)`,
          opacity: swapProgress,
        }}
      >
        <Img
          src={staticFile('video-assets/screenshots/scene-3-2.png')}
          alt="Tip Breakdown"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />

        {/* Highlight overlay for TIP-OUTS section */}
        <div
          style={{
            position: 'absolute',
            top: 330,
            left: 24,
            right: 24,
            height: 130,
            backgroundColor: COLORS.highlightYellow,
            borderRadius: 12,
            opacity: highlightOpacity,
            boxShadow: highlightOpacity > 0.3
              ? '0 0 40px rgba(253, 224, 71, 0.6)'
              : 'none',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

// Take-Home Earnings overlay with spring count-up animation
// This COMPLETELY replaces the underlying number - no overlap
// CRITICAL: Must render from frame 0 to cover the screenshot number before it's visible
const TakeHomeEarningsOverlay: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Spring-based count-up for smooth animation
  const countSpring = spring({
    frame: Math.max(0, frame - COUNTUP_START),
    fps,
    config: { damping: 30, mass: 1, stiffness: 80 }, // Smooth count-up
  });

  const targetValue = 256.43;
  const currentValue = countSpring * targetValue;

  // Fade out the overlay after count-up to reveal static screenshot
  // IMPORTANT: Overlay stays at opacity 1 until AFTER count-up completes
  const overlayOpacity = interpolate(frame, [COUNTUP_END + 5, COUNTUP_END + 15], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Stop rendering after overlay fully fades
  if (frame > COUNTUP_END + 20) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        // Position to EXACTLY cover the $256.43 area in the screenshot
        // Adjusted for precise alignment with the screenshot number
        top: 169,
        left: 28,
        width: 280,
        height: 55,
        // Match the green card background EXACTLY
        backgroundColor: COLORS.greenCardBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        opacity: overlayOpacity,
        paddingLeft: 0,
        // Ensure this is above the screenshot
        zIndex: 5,
      }}
    >
      <span
        style={{
          fontSize: 50,
          fontWeight: 700,
          color: COLORS.emerald,
          fontFamily: FONTS.system,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
        }}
      >
        ${currentValue.toFixed(2)}
      </span>
    </div>
  );
};

// Animated cursor - positioned relative to zoomed/panned camera view
const AnimatedCursor: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Cursor spring animation for smooth movement
  const cursorSpring = spring({
    frame: Math.max(0, frame - CURSOR_START),
    fps,
    config: { damping: 20, mass: 0.8, stiffness: 100 },
  });

  // Start position (off screen right)
  const startX = 1100;
  const startY = 600;

  // End position (over "View breakdown" button for Jan 16 shift)
  // Adjusted for the camera zoom (1.25x) and pan state during Phase 3
  // The button is in the "Recent Shifts" section, first row
  const endX = 780;
  const endY = 720;

  const cursorX = interpolate(cursorSpring, [0, 1], [startX, endX]);
  const cursorY = interpolate(cursorSpring, [0, 1], [startY, endY]);

  // Cursor fade in
  const cursorOpacity = interpolate(frame, [CURSOR_START, CURSOR_START + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Button press effect with spring
  const pressSpring = spring({
    frame: Math.max(0, frame - BUTTON_PRESS),
    fps,
    config: { damping: 15, stiffness: 300 },
  });

  const pressScale = frame >= BUTTON_PRESS && frame < SCREENSHOT_SWAP_START
    ? interpolate(pressSpring, [0, 0.5, 1], [1, 0.92, 1])
    : 1;

  // Hide cursor after screenshot swap
  if (frame < CURSOR_START || frame > SCREENSHOT_SWAP_START + 15) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: cursorX,
        top: cursorY,
        opacity: cursorOpacity,
        transform: `scale(${pressScale})`,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {/* macOS-style cursor */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))',
        }}
      >
        <path
          d="M5.5 3.5L5.5 20.5L10 15.5L14 22L17 20.5L13 14L19.5 14L5.5 3.5Z"
          fill="white"
          stroke="black"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// Final text overlay - "Tip transparency, finally."
const FinalTextOverlay: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const textSpring = spring({
    frame: Math.max(0, frame - FINAL_TEXT_START),
    fps,
    config: { damping: 15, stiffness: 100, mass: 0.8 },
  });

  const opacity = frame >= FINAL_TEXT_START ? textSpring : 0;
  const scale = interpolate(textSpring, [0, 1], [0.9, 1]);
  const y = interpolate(textSpring, [0, 1], [30, 0]);

  if (frame < FINAL_TEXT_START) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        zIndex: 30,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '28px 56px',
          borderRadius: 20,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
        }}
      >
        <p
          style={{
            fontSize: 44,
            fontWeight: 600,
            color: COLORS.midnight,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Tip transparency,{' '}
          <span style={{ color: COLORS.emerald }}>finally.</span>
        </p>
      </div>
    </div>
  );
};

export default DashboardScreenshot;
