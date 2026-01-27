import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  Audio,
  Sequence,
  staticFile,
  interpolate,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
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
import { IMessageResolution, IMESSAGE_RESOLUTION_DURATION } from './components/IMessageResolution';

// Toggle to use real screenshot vs synthetic dashboard
const USE_REAL_SCREENSHOT = true;
// Toggle to use tip breakdown vs simple notification
const USE_TIP_BREAKDOWN = true;
// Toggle to enable/disable iMessage sent/receive sounds (set to false for cleaner mix)
const USE_MESSAGE_SOUNDS = false;
// Toggle to enable/disable logo reveal sound at CTA (set to false if it feels jarring)
const USE_LOGO_SOUND = true;

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
// SOUND ASSETS
// ============================================
const SOUNDS = {
  backgroundMusic: staticFile('sounds/tech-background-music-for-product-videos-amp-commercials-383623.mp3'),
  typing: staticFile('sounds/iphone-keyboard-typing-sound-effect-336778.mp3'),
  iphoneSent: staticFile('sounds/iphonesent.mp3'),
  iphoneReceive: staticFile('sounds/iphonereceive.mp3'),
  buttonClick: staticFile('sounds/popbuttonclick.mp3'),
  logoReveal: staticFile('sounds/logo reveal.mp3'),
};

// ============================================
// FRAME CALCULATIONS FOR SOUND PLACEMENT
// TransitionSeries timing (transitions overlap):
// Scene 1 (IMessage): 0-170
// Scene 2 (Problem): ~155-310 (starts at 170-15, duration 155)
// Scene 3 (Dashboard): ~285-470 (starts at 310-25)
// Scene 4 (Resolution): ~470-620
// Scene 5 (CTA): ~600-720 (starts at 620-20)
// ============================================
const SCENE_STARTS = {
  scene1: 0,
  scene2: 155,
  scene3: 285,
  scene4: 470,
  scene5: 600,
};

// ============================================
// MAIN COMPOSITION WITH TRANSITION SERIES
// ============================================
export const TippdVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Dynamic background music volume - ducks during dialogue scenes
  // Scene 1 (0-170): Low for iMessage dialogue
  // Scene 2 (155-310): Builds tension during problem
  // Scene 3 (285-470): Moderate for dashboard reveal
  // Scene 4 (470-620): Low again for resolution dialogue
  // Scene 5 (600+): Fades out with logo reveal
  const bgMusicVolume = interpolate(
    frame,
    [
      0,    // Start
      30,   // Fade in complete
      140,  // Before Scene 1 ends - still low
      170,  // Scene 2 starts - build up
      230,  // Scene 2 peak tension (extended)
      285,  // Scene 3 starts - solution reveal
      380,  // Dashboard interaction
      460,  // Before Scene 4
      480,  // Scene 4 dialogue - duck
      590,  // Before CTA
      630,  // CTA - fade out
      720,  // End
    ],
    [
      0,     // Start silent
      0.08,  // Low during iMessage (dialogue focus)
      0.08,  // Stay low
      0.18,  // Build for problem scene
      0.22,  // Peak tension
      0.15,  // Solution reveal - moderate
      0.12,  // Slightly lower during interaction
      0.12,  // Hold
      0.06,  // Duck for dialogue
      0.06,  // Stay low
      0.1,   // Brief rise for CTA
      0,     // Fade out
    ],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.offWhite,
        fontFamily: FONTS.system,
        overflow: 'hidden',
      }}
    >
      {/* ============================================ */}
      {/* BACKGROUND MUSIC - plays throughout with dynamic ducking */}
      {/* ============================================ */}
      <Audio
        src={SOUNDS.backgroundMusic}
        volume={bgMusicVolume}
      />

      {/* ============================================ */}
      {/* SCENE 1 - iMessage Cold Open Sounds */}
      {/* ============================================ */}
      {/* Typing sound for message 1 (frames 0-45) */}
      <Sequence from={0} durationInFrames={45}>
        <Audio src={SOUNDS.typing} volume={0.5} />
      </Sequence>

      {/* Message 1 sent sound (frame 45) */}
      {USE_MESSAGE_SOUNDS && (
        <Sequence from={45} durationInFrames={30}>
          <Audio src={SOUNDS.iphoneSent} volume={0.8} />
        </Sequence>
      )}

      {/* Message 2 received sound (frame 90) */}
      {USE_MESSAGE_SOUNDS && (
        <Sequence from={90} durationInFrames={30}>
          <Audio src={SOUNDS.iphoneReceive} volume={0.8} />
        </Sequence>
      )}

      {/* Typing sound for message 3 (frames 105-130) */}
      <Sequence from={105} durationInFrames={27}>
        <Audio src={SOUNDS.typing} volume={0.5} />
      </Sequence>

      {/* Message 3 sent sound (frame 132) */}
      {USE_MESSAGE_SOUNDS && (
        <Sequence from={132} durationInFrames={30}>
          <Audio src={SOUNDS.iphoneSent} volume={0.8} />
        </Sequence>
      )}

      {/* ============================================ */}
      {/* SCENE 3 - Dashboard Sounds */}
      {/* ============================================ */}
      {/* Click sound when "View breakdown" button is pressed (internal frame 100) */}
      <Sequence from={SCENE_STARTS.scene3 + 100} durationInFrames={30}>
        <Audio src={SOUNDS.buttonClick} volume={0.7} />
      </Sequence>

      {/* Additional click when breakdown panel expands (internal frame 115) */}
      <Sequence from={SCENE_STARTS.scene3 + 120} durationInFrames={30}>
        <Audio src={SOUNDS.buttonClick} volume={0.4} />
      </Sequence>

      {/* ============================================ */}
      {/* SCENE 4 - iMessage Resolution Sounds */}
      {/* ============================================ */}
      {/* Typing sound (internal frames 10-50) */}
      <Sequence from={SCENE_STARTS.scene4 + 10} durationInFrames={40}>
        <Audio src={SOUNDS.typing} volume={0.5} />
      </Sequence>

      {/* New message 1 sent (internal frame 52) */}
      {USE_MESSAGE_SOUNDS && (
        <Sequence from={SCENE_STARTS.scene4 + 52} durationInFrames={30}>
          <Audio src={SOUNDS.iphoneSent} volume={0.8} />
        </Sequence>
      )}

      {/* New message 2 received (internal frame 70) */}
      {USE_MESSAGE_SOUNDS && (
        <Sequence from={SCENE_STARTS.scene4 + 70} durationInFrames={30}>
          <Audio src={SOUNDS.iphoneReceive} volume={0.8} />
        </Sequence>
      )}

      {/* New message 3 received (internal frame 95) */}
      {USE_MESSAGE_SOUNDS && (
        <Sequence from={SCENE_STARTS.scene4 + 95} durationInFrames={30}>
          <Audio src={SOUNDS.iphoneReceive} volume={0.8} />
        </Sequence>
      )}

      {/* ============================================ */}
      {/* SCENE 5 - CTA Logo Reveal */}
      {/* ============================================ */}
      {USE_LOGO_SOUND && (
        <Sequence from={SCENE_STARTS.scene5} durationInFrames={90}>
          <Audio src={SOUNDS.logoReveal} volume={0.04} />
        </Sequence>
      )}

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

        {/* Scene 2: Problem - THE BLACK BOX - 155 frames, uniform blackout, text holds 2.5s */}
        <TransitionSeries.Sequence durationInFrames={155}>
          <SpreadsheetChaosWrapper />
        </TransitionSeries.Sequence>

        {/* Transition 2: Light Wipe - bright sweep from darkness to light */}
        <TransitionSeries.Transition
          presentation={lightWipe()}
          timing={linearTiming({ durationInFrames: 25 })}
        />

        {/* Scene 3: Solution - Dashboard Reveal + TipBreakdown - 185 frames */}
        <TransitionSeries.Sequence durationInFrames={185}>
          <DashboardZenWrapper />
        </TransitionSeries.Sequence>

        {/* No transition - Scene 3 pullback and Scene 4 push-forward handle the visual handoff */}

        {/* Scene 4: iMessage Resolution - conversation continues */}
        <TransitionSeries.Sequence durationInFrames={IMESSAGE_RESOLUTION_DURATION}>
          <IMessageResolutionWrapper />
        </TransitionSeries.Sequence>

        {/* Transition: Fade to CTA */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Final Scene: CTA - CTAEndCard - 120 frames */}
        <TransitionSeries.Sequence durationInFrames={120}>
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

const IMessageResolutionWrapper: React.FC = () => {
  const frame = useCurrentFrame();
  return <IMessageResolution frame={frame} />;
};

const CTAWrapper: React.FC = () => {
  const frame = useCurrentFrame();
  return <CTAEndCard frame={frame} />;
};

