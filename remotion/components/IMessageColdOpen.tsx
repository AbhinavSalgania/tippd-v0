import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import { IPhoneMockup, IPHONE_DIMENSIONS } from './IPhoneMockup';

// ============================================
// iMessage Cold Open Scene
// Fills the frame with a massive phone, ends mid-typing for hook
// ============================================

interface IMessageColdOpenProps {
  frame: number;
}

// ============================================
// DESIGN TOKENS (matching project style)
// ============================================
const COLORS = {
  // iOS Dark Mode iMessage
  background: '#000000',
  bubbleOutgoing: '#0B84FE',
  bubbleIncoming: '#3A3A3C',
  textWhite: '#FFFFFF',
  textSecondary: '#8E8E93',
  inputBar: '#1C1C1E',
  inputField: '#2C2C2E',
  navBar: '#1C1C1E',
  // Scene
  sceneBackground: '#000000',
};

const FONTS = {
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif',
};

// ============================================
// TIMELINE (30fps)
// ============================================
// 0s – 1.5s (0-45): Type "did you see the tips?"
// 1.5s (45): Message 1 sends
// 1.5s – 3s (45-90): Pause - let msg1 breathe
// 3s (90): Gray reply appears
// 3.5s – 4.3s (105-130): Type "I KNOW RIGHT!"
// 4.4s (132): Message 3 sends
// 4.4s – 5.5s (132-165): Hold - let conversation sink in
// 5.5s (165): END - cut
// ============================================

const MESSAGE_1 = 'did you see the tips?';
const MESSAGE_2 = 'yeahhh not quite what i was expecting';
const MESSAGE_3 = 'I KNOW RIGHT!';

// Timeline frames at 30fps
const TYPING_1_END = 45; // 1.5s - finish typing msg1
const SEND_1_FRAME = 45; // Message 1 sends
const PAUSE_END = 90; // 3s - longer pause after sending
const MSG2_APPEAR = 90; // Reply appears after pause
const TYPING_3_START = 105; // 3.5s - start typing msg3
const TYPING_3_END = 130; // Finish typing at ~4.3s
const SEND_3_FRAME = 132; // Send message 3
const PULLBACK_START = 150; // Start dramatic zoom-out
const SCENE_END = 170; // Shorter - transition to spreadsheet during pullback

// Typing speed calculations
const MSG1_CHAR_FRAMES = TYPING_1_END / MESSAGE_1.length; // ~2.14 frames per char
const MSG3_DURATION = TYPING_3_END - TYPING_3_START; // 25 frames for typing

export const IMESSAGE_SCENE_DURATION = SCENE_END;

// ============================================
// HELPER COMPONENTS
// ============================================

// Blinking cursor
const Cursor: React.FC<{ frame: number; visible: boolean }> = ({ frame, visible }) => {
  if (!visible) return null;

  const blinkCycle = 12;
  const opacity = interpolate(
    frame % blinkCycle,
    [0, blinkCycle / 2, blinkCycle],
    [1, 0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <span
      style={{
        opacity,
        color: COLORS.textWhite,
        fontWeight: 400,
        marginLeft: 2,
      }}
    >
      |
    </span>
  );
};

// Typing indicator (three bouncing dots)
const TypingIndicator: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const dots = [0, 1, 2].map((i) => {
    const delay = i * 4;
    const y = interpolate(
      (frame + delay) % 16,
      [0, 8, 16],
      [0, -4, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    return (
      <span
        key={i}
        style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: '#9E9E9E',
          marginRight: i < 2 ? 5 : 0,
          transform: `translateY(${y}px)`,
        }}
      />
    );
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 18px',
        backgroundColor: COLORS.bubbleIncoming,
        borderRadius: 22,
        borderBottomLeftRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 10,
        opacity: entrance,
        transform: `scale(${interpolate(entrance, [0, 1], [0.85, 1])})`,
      }}
    >
      {dots}
    </div>
  );
};

// Message bubble with large, legible text
const MessageBubble: React.FC<{
  text: string;
  isOutgoing: boolean;
  frame: number;
  appearFrame: number;
}> = ({ text, isOutgoing, frame, appearFrame }) => {
  const { fps } = useVideoConfig();

  if (frame < appearFrame) return null;

  const localFrame = frame - appearFrame;
  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const opacity = entrance;
  const translateY = interpolate(entrance, [0, 1], [20, 0]);

  return (
    <div
      style={{
        alignSelf: isOutgoing ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        marginBottom: 10,
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transformOrigin: isOutgoing ? 'right bottom' : 'left bottom',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          backgroundColor: isOutgoing ? COLORS.bubbleOutgoing : COLORS.bubbleIncoming,
          borderRadius: 24,
          borderBottomRightRadius: isOutgoing ? 6 : 24,
          borderBottomLeftRadius: isOutgoing ? 24 : 6,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        <span
          style={{
            color: COLORS.textWhite,
            fontSize: 42, // Large for legibility
            fontWeight: 500,
            fontFamily: FONTS.system,
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

// Input bar with large typing text
const InputBar: React.FC<{
  typedText: string;
  frame: number;
  showCursor: boolean;
}> = ({ typedText, frame, showCursor }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.inputBar,
        padding: '12px 14px',
        paddingBottom: 38, // Home indicator space
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Plus button */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: COLORS.inputField,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ color: COLORS.textSecondary, fontSize: 28, lineHeight: 1 }}>+</span>
      </div>

      {/* Text input field */}
      <div
        style={{
          flex: 1,
          backgroundColor: COLORS.inputField,
          borderRadius: 24,
          padding: '12px 18px',
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            color: typedText ? COLORS.textWhite : COLORS.textSecondary,
            fontSize: 36, // Large for legibility
            fontWeight: 400,
            fontFamily: FONTS.system,
          }}
        >
          {typedText || 'iMessage'}
          <Cursor frame={frame} visible={showCursor && typedText.length > 0} />
        </span>
      </div>

      {/* Send button */}
      {typedText && (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: COLORS.bubbleOutgoing,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 19V5M5 12l7-7 7 7"
              stroke={COLORS.textWhite}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

// iMessage screen content
const IMessageScreen: React.FC<{ frame: number }> = ({ frame }) => {
  // ========== MESSAGE 1 LOGIC ==========
  // Typing from frame 0 to 45
  const msg1TypedChars = Math.min(
    MESSAGE_1.length,
    Math.max(0, Math.floor(frame / MSG1_CHAR_FRAMES))
  );
  const msg1Typed = MESSAGE_1.slice(0, msg1TypedChars);
  const msg1Sent = frame >= SEND_1_FRAME;
  const isTypingMsg1 = frame < TYPING_1_END;

  // ========== MESSAGE 2 LOGIC ==========
  // Show typing indicator briefly before message appears
  const typingIndicatorStart = PAUSE_END - 15; // Start 0.5s before message
  const showTypingIndicator = frame >= typingIndicatorStart && frame < MSG2_APPEAR;
  const msg2Visible = frame >= MSG2_APPEAR;

  // ========== MESSAGE 3 LOGIC ==========
  // Typing from frame 75 to 100, send at 102
  const msg3FrameOffset = frame - TYPING_3_START;
  const msg3Progress = Math.max(0, Math.min(1, msg3FrameOffset / MSG3_DURATION));
  const msg3CharsToShow = Math.floor(msg3Progress * MESSAGE_3.length);
  const msg3Typed = frame >= TYPING_3_START && frame < SEND_3_FRAME ? MESSAGE_3.slice(0, msg3CharsToShow) : '';
  const isTypingMsg3 = frame >= TYPING_3_START && frame < SEND_3_FRAME;
  const msg3Sent = frame >= SEND_3_FRAME;

  // ========== INPUT BAR STATE ==========
  let inputText = '';
  let showCursor = false;

  if (isTypingMsg1 && !msg1Sent) {
    inputText = msg1Typed;
    showCursor = true;
  } else if (isTypingMsg3 && !msg3Sent) {
    inputText = msg3Typed;
    showCursor = true;
  }
  // After msg3 sends, input is empty

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: FONTS.system,
      }}
    >
      {/* Navigation bar */}
      <div
        style={{
          position: 'absolute',
          top: IPHONE_DIMENSIONS.safeAreaTop,
          left: 0,
          right: 0,
          height: 56,
          backgroundColor: COLORS.navBar,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Back button */}
        <div
          style={{
            position: 'absolute',
            left: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <svg width="14" height="22" viewBox="0 0 12 20" fill="none">
            <path
              d="M10 2L2 10l8 8"
              stroke={COLORS.bubbleOutgoing}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ color: COLORS.bubbleOutgoing, fontSize: 20, fontWeight: 400 }}>4</span>
        </div>

        {/* Contact avatar & name */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#5856D6',
              margin: '0 auto 3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: COLORS.textWhite, fontSize: 16, fontWeight: 600 }}>S</span>
          </div>
          <span style={{ color: COLORS.textWhite, fontSize: 13, fontWeight: 500 }}>
            Sarah
          </span>
        </div>

        {/* Video call button */}
        <div style={{ position: 'absolute', right: 14 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="1" y="5" width="15" height="14" rx="2" stroke={COLORS.bubbleOutgoing} strokeWidth="1.5" />
            <path d="M16 10l5-3v10l-5-3v-4z" stroke={COLORS.bubbleOutgoing} strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Messages area */}
      <div
        style={{
          position: 'absolute',
          top: IPHONE_DIMENSIONS.safeAreaTop + 70,
          left: 0,
          right: 0,
          bottom: 110,
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {/* Message 1 - outgoing (after send) */}
        {msg1Sent && (
          <MessageBubble
            text={MESSAGE_1}
            isOutgoing={true}
            frame={frame}
            appearFrame={SEND_1_FRAME}
          />
        )}

        {/* Typing indicator (before message 2) */}
        {showTypingIndicator && <TypingIndicator frame={frame - typingIndicatorStart} />}

        {/* Message 2 - incoming */}
        {msg2Visible && (
          <MessageBubble
            text={MESSAGE_2}
            isOutgoing={false}
            frame={frame}
            appearFrame={MSG2_APPEAR}
          />
        )}

        {/* Message 3 - outgoing (after send) */}
        {msg3Sent && (
          <MessageBubble
            text={MESSAGE_3}
            isOutgoing={true}
            frame={frame}
            appearFrame={SEND_3_FRAME}
          />
        )}
      </div>

      {/* Input bar with typing animation */}
      <InputBar typedText={inputText} frame={frame} showCursor={showCursor} />

      {/* Home indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 140,
          height: 5,
          backgroundColor: COLORS.textWhite,
          borderRadius: 3,
          opacity: 0.2,
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================
// MAIN COMPONENT - Massive phone filling frame
// With dramatic pullback at the end
// ============================================
export const IMessageColdOpen: React.FC<IMessageColdOpenProps> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Quick entrance - don't waste time on the hook
  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 180 },
  });

  // Dramatic pullback animation starting at PULLBACK_START
  const pullbackFrame = Math.max(0, frame - PULLBACK_START);
  const pullbackProgress = spring({
    frame: pullbackFrame,
    fps,
    config: { damping: 15, stiffness: 180, mass: 0.6 }, // Smooth, cinematic pullback
  });

  // Base scale from entrance
  const entranceScale = interpolate(entrance, [0, 1], [0.97, 1]);
  const entranceOpacity = interpolate(entrance, [0, 1], [0, 1]);

  // Pullback: phone shrinks dramatically and moves up-left
  const isPullingBack = frame >= PULLBACK_START;
  const pullbackScale = isPullingBack
    ? interpolate(pullbackProgress, [0, 1], [1, 0.25]) // Shrink to 25% of size
    : 1;
  const pullbackX = isPullingBack
    ? interpolate(pullbackProgress, [0, 1], [0, -280]) // Move left
    : 0;
  const pullbackY = isPullingBack
    ? interpolate(pullbackProgress, [0, 1], [0, -400]) // Move up
    : 0;

  // Combined transforms
  const finalScale = entranceScale * pullbackScale * 2.15; // 2.15 is the base phone scale
  const phoneOpacity = entranceOpacity;

  // Background transitions to a desktop-like gradient during pullback
  const bgTransition = isPullingBack ? pullbackProgress : 0;

  return (
    <AbsoluteFill
      style={{
        background: bgTransition > 0
          ? `linear-gradient(135deg,
              rgba(30, 41, 59, ${bgTransition}) 0%,
              rgba(15, 23, 42, ${bgTransition}) 50%,
              rgba(0, 0, 0, ${1 - bgTransition * 0.5}) 100%)`
          : COLORS.sceneBackground,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Phone - scales up initially, then pulls back dramatically */}
      <div
        style={{
          transform: `scale(${finalScale / 2.15}) translate(${pullbackX}px, ${pullbackY}px)`,
          opacity: phoneOpacity,
          transformOrigin: 'center center',
        }}
      >
        <IPhoneMockup scale={2.15} showReflection={false}>
          <IMessageScreen frame={frame} />
        </IPhoneMockup>
      </div>
    </AbsoluteFill>
  );
};

export default IMessageColdOpen;
