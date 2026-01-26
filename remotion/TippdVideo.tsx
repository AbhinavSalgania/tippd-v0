import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';

// Custom transitions
import { lightWipe } from './components/LightWipeTransition';

// Import component files
import { SpreadsheetChaos } from './components/SpreadsheetChaos';
import { DashboardZen } from './components/DashboardZen';
import { DashboardScreenshot } from './components/DashboardScreenshot';
import { ShiftNotification } from './components/ShiftNotification';
import { TipBreakdown } from './components/TipBreakdown';
import { IPhoneMockup } from './components/IPhoneMockup';
import { TrustStats } from './components/TrustStats';
import { CTAEndCard } from './components/CTAEndCard';
import { IMessageColdOpen, IMESSAGE_SCENE_DURATION } from './components/IMessageColdOpen';

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
// TIMELINE (30fps, 1080x1920 vertical) - WITH IMESSAGE COLD OPEN
// ============================================
// Scene 1 - iMessage:    170 frames - cold open hook + dramatic pullback
// Transition: Fade       15 frames (smooth bridge after pullback)
// Scene 2 - Problem:     125 frames - spreadsheet chaos + uniform blackout + text holds 1.5s
// Transition: LightWipe  25 frames (bright wipe - darkness to light)
// Scene 3 - Solution:    180 frames (6s) - dashboard reveal, scroll, click, breakdown, final text
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
        {/* Scene 1: iMessage Cold Open - ~195 frames (realistic typing) */}
        <TransitionSeries.Sequence durationInFrames={IMESSAGE_SCENE_DURATION}>
          <IMessageColdOpenWrapper />
        </TransitionSeries.Sequence>

        {/* Transition 1: Fade - smooth bridge after pullback */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 2: Problem - THE BLACK BOX - 125 frames, uniform blackout, text holds 1.5s */}
        <TransitionSeries.Sequence durationInFrames={125}>
          <SpreadsheetChaosWrapper />
        </TransitionSeries.Sequence>

        {/* Transition 2: Light Wipe - bright sweep from darkness to light */}
        <TransitionSeries.Transition
          presentation={lightWipe()}
          timing={linearTiming({ durationInFrames: 25 })}
        />

        {/* Scene 3: Solution - Dashboard Reveal - 180 frames (6s) with full animation sequence */}
        <TransitionSeries.Sequence durationInFrames={180}>
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

const IMessageColdOpenWrapper: React.FC = () => {
  const frame = useCurrentFrame();
  return <IMessageColdOpen frame={frame} />;
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

