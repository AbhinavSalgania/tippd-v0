import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { wipe } from '@remotion/transitions/wipe';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';

// Import component files
import { SpreadsheetChaos } from './components/SpreadsheetChaos';
import { DashboardZen } from './components/DashboardZen';
import { DashboardScreenshot } from './components/DashboardScreenshot';
import { ShiftNotification } from './components/ShiftNotification';
import { TipBreakdown } from './components/TipBreakdown';
import { IPhoneMockup } from './components/IPhoneMockup';
import { TrustStats } from './components/TrustStats';
import { CTAEndCard } from './components/CTAEndCard';

// Toggle to use real screenshot vs synthetic dashboard
const USE_REAL_SCREENSHOT = true;
// Toggle to use tip breakdown vs simple notification
const USE_TIP_BREAKDOWN = true;

// ============================================
// DESIGN TOKENS
// ============================================
const COLORS = {
  emerald: '#10B981',
  midnight: '#0F172A',
  slate: '#64748B',
  slateLight: '#94A3B8',
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  red: '#EF4444',
};

const FONTS = {
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
};

// ============================================
// TIMELINE (30fps, 1080x1920 vertical) - WITH TRUST STATS
// ============================================
// Scene 1 - Hook:        75 frames (2.5s) - let "broken" breathe
// Transition: Wipe       20 frames (eased)
// Scene 2 - Problem:     105 frames (3.5s) - compressed chaos
// Transition: Fade       40 frames (softer emotional bridge)
// Scene 3 - Solution:    120 frames (4s) - tighter, no dead air
// Transition: Slide      25 frames (with scale)
// Scene 4 - Mobile:      90 frames (3s) - tighter post-checkmark
// Transition: Fade       20 frames
// Scene 5 - Trust:       75 frames (2.5s) - credibility stats
// Transition: Fade       20 frames
// Scene 6 - CTA:         90 frames (3s) - pulse cycles

// ============================================
// MAIN COMPOSITION WITH TRANSITION SERIES
// ============================================
export const TippdVideo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.offWhite,
        fontFamily: FONTS.system,
        overflow: 'hidden',
      }}
    >
      <TransitionSeries>
        {/* Scene 1: Hook - 75 frames (let "broken" breathe) */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <HookSceneWrapper />
        </TransitionSeries.Sequence>

        {/* Transition 1: Wipe Right - eased entry into chaos */}
        <TransitionSeries.Transition
          presentation={wipe({ direction: 'from-right' })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 2: Problem - SpreadsheetChaos - 105 frames (compressed chaos) */}
        <TransitionSeries.Sequence durationInFrames={105}>
          <SpreadsheetChaosWrapper />
        </TransitionSeries.Sequence>

        {/* Transition 2: Fade - softer emotional bridge to calm */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 40 })}
        />

        {/* Scene 3: Solution - DashboardZen - 120 frames (tighter, no dead air) */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <DashboardZenWrapper />
        </TransitionSeries.Sequence>

        {/* Transition 3: Slide Up with deliberate motion */}
        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-bottom' })}
          timing={linearTiming({ durationInFrames: 25 })}
        />

        {/* Scene 4: Mobile Trust - 90 frames (tighter post-checkmark) */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <MobileSceneWrapper />
        </TransitionSeries.Sequence>

        {/* Transition 4: Fade to trust stats */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 5: Trust Stats - 75 frames (credibility beat) */}
        <TransitionSeries.Sequence durationInFrames={75}>
          <TrustStatsWrapper />
        </TransitionSeries.Sequence>

        {/* Transition 5: Fade to CTA */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 6: CTA - CTAEndCard - 90 frames */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <CTAWrapper />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

// ============================================
// WRAPPER COMPONENTS
// ============================================

const HookSceneWrapper: React.FC = () => {
  const frame = useCurrentFrame();
  return <HookScene frame={frame} />;
};

const SpreadsheetChaosWrapper: React.FC = () => {
  const frame = useCurrentFrame();
  return <SpreadsheetChaos frame={frame} />;
};

const DashboardZenWrapper: React.FC = () => {
  const frame = useCurrentFrame();
  // Toggle between real screenshot and synthetic dashboard
  if (USE_REAL_SCREENSHOT) {
    return <DashboardScreenshot frame={frame} />;
  }
  // Fallback to synthetic dashboard with count-up
  return <DashboardZen frame={frame} startCountAtFrame={15} />;
};

const MobileSceneWrapper: React.FC = () => {
  const frame = useCurrentFrame();

  // Toggle between tip breakdown and simple notification
  if (USE_TIP_BREAKDOWN) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.offWhite,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <IPhoneMockup scale={1.8}>
          <TipBreakdown frame={frame} />
        </IPhoneMockup>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.offWhite,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <IPhoneMockup scale={1.8}>
        <ShiftNotification frame={frame} />
      </IPhoneMockup>
    </AbsoluteFill>
  );
};

const TrustStatsWrapper: React.FC = () => {
  const frame = useCurrentFrame();
  return <TrustStats frame={frame} />;
};

const CTAWrapper: React.FC = () => {
  const frame = useCurrentFrame();
  return <CTAEndCard frame={frame} />;
};

// ============================================
// SCENE 1: HOOK (inline - no separate component)
// ============================================
const HookScene: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Back easing for slight overshoot - adds premium feel
  const line1Y = interpolate(frame, [0, 22], [60, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.2)),
  });

  const line2Y = interpolate(frame, [8, 30], [60, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.2)),
  });

  const line2Opacity = interpolate(frame, [8, 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 60px',
        opacity,
        backgroundColor: COLORS.white,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: COLORS.midnight,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: 0,
            transform: `translateY(${line1Y}px)`,
            fontFamily: FONTS.system,
          }}
        >
          Tip math is
        </h1>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: COLORS.red,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: 0,
            marginTop: 8,
            transform: `translateY(${line2Y}px)`,
            opacity: line2Opacity,
            fontFamily: FONTS.system,
          }}
        >
          broken.
        </h1>
      </div>
    </AbsoluteFill>
  );
};
