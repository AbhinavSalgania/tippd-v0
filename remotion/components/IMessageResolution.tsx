import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    spring,
    useVideoConfig,
} from 'remotion';
import { IPhoneMockup, IPHONE_DIMENSIONS } from './IPhoneMockup';

// ============================================
// iMessage Resolution Scene (Scene 4)
// Continues the conversation from Scene 1
// Shows the resolution after seeing the tip breakdown
// ============================================

interface IMessageResolutionProps {
    frame: number;
}

// ============================================
// DESIGN TOKENS (matching Scene 1)
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
// MESSAGES
// ============================================
// Previous messages from Scene 1 (already visible)
const PREV_MESSAGE_1 = 'did you see the tips?';
const PREV_MESSAGE_2 = 'yeahhh not quite what i was expecting';
const PREV_MESSAGE_3 = 'I KNOW RIGHT!';

// New messages in this scene
const NEW_MESSAGE_1 = 'check the breakdown!!';
const NEW_MESSAGE_2 = 'ahh I see';
const NEW_MESSAGE_3 = 'sweet. actually makes sense now!';

// ============================================
// TIMELINE (30fps)
// ============================================
// 0-10: Scene entrance, previous messages visible
// 10-50: Type "check the breakdown!!" (40 frames)
// 50: Send message
// 55-65: Typing indicator for reply
// 65: "ahh I see" appears
// 80-90: Typing indicator
// 90: "sweet. actually makes sense now!" appears
// 90-150: Hold for emotional beat
// ============================================
const ENTRANCE_DURATION = 10;
const TYPING_1_START = 10;
const TYPING_1_END = 50;
const SEND_1_FRAME = 52;
const TYPING_IND_1_START = 58;
const MSG_2_APPEAR = 70;
const TYPING_IND_2_START = 78;
const MSG_3_APPEAR = 95;
const SCENE_END = 150;

export const IMESSAGE_RESOLUTION_DURATION = SCENE_END;

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
    isStatic?: boolean; // For pre-existing messages
}> = ({ text, isOutgoing, frame, appearFrame, isStatic = false }) => {
    const { fps } = useVideoConfig();

    if (frame < appearFrame && !isStatic) return null;

    // Static messages appear instantly at full opacity
    if (isStatic) {
        return (
            <div
                style={{
                    alignSelf: isOutgoing ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    marginBottom: 10,
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
                            fontSize: 42,
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
    }

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
                        fontSize: 42,
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
                paddingBottom: 38,
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
                        fontSize: 36,
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
    // ========== NEW MESSAGE 1 LOGIC ==========
    const typingDuration = TYPING_1_END - TYPING_1_START;
    const msg1FrameOffset = frame - TYPING_1_START;
    const msg1Progress = Math.max(0, Math.min(1, msg1FrameOffset / typingDuration));
    const msg1CharsToShow = Math.floor(msg1Progress * NEW_MESSAGE_1.length);
    const msg1Typed = frame >= TYPING_1_START && frame < SEND_1_FRAME
        ? NEW_MESSAGE_1.slice(0, msg1CharsToShow)
        : '';
    const isTypingMsg1 = frame >= TYPING_1_START && frame < SEND_1_FRAME;
    const msg1Sent = frame >= SEND_1_FRAME;

    // ========== NEW MESSAGE 2 LOGIC ==========
    const showTypingInd1 = frame >= TYPING_IND_1_START && frame < MSG_2_APPEAR;
    const msg2Visible = frame >= MSG_2_APPEAR;

    // ========== NEW MESSAGE 3 LOGIC ==========
    const showTypingInd2 = frame >= TYPING_IND_2_START && frame < MSG_3_APPEAR;
    const msg3Visible = frame >= MSG_3_APPEAR;

    // ========== INPUT BAR STATE ==========
    let inputText = '';
    let showCursor = false;

    if (isTypingMsg1 && !msg1Sent) {
        inputText = msg1Typed;
        showCursor = true;
    }

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
                {/* Previous messages from Scene 1 (static, already visible) */}
                <MessageBubble
                    text={PREV_MESSAGE_1}
                    isOutgoing={true}
                    frame={frame}
                    appearFrame={0}
                    isStatic={true}
                />
                <MessageBubble
                    text={PREV_MESSAGE_2}
                    isOutgoing={false}
                    frame={frame}
                    appearFrame={0}
                    isStatic={true}
                />
                <MessageBubble
                    text={PREV_MESSAGE_3}
                    isOutgoing={true}
                    frame={frame}
                    appearFrame={0}
                    isStatic={true}
                />

                {/* New message 1 - outgoing (after send) */}
                {msg1Sent && (
                    <MessageBubble
                        text={NEW_MESSAGE_1}
                        isOutgoing={true}
                        frame={frame}
                        appearFrame={SEND_1_FRAME}
                    />
                )}

                {/* Typing indicator 1 (before message 2) */}
                {showTypingInd1 && <TypingIndicator frame={frame - TYPING_IND_1_START} />}

                {/* New message 2 - incoming */}
                {msg2Visible && (
                    <MessageBubble
                        text={NEW_MESSAGE_2}
                        isOutgoing={false}
                        frame={frame}
                        appearFrame={MSG_2_APPEAR}
                    />
                )}

                {/* Typing indicator 2 (before message 3) */}
                {showTypingInd2 && <TypingIndicator frame={frame - TYPING_IND_2_START} />}

                {/* New message 3 - incoming */}
                {msg3Visible && (
                    <MessageBubble
                        text={NEW_MESSAGE_3}
                        isOutgoing={false}
                        frame={frame}
                        appearFrame={MSG_3_APPEAR}
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
// MAIN COMPONENT
// ============================================
export const IMessageResolution: React.FC<IMessageResolutionProps> = ({ frame }) => {
    const { fps } = useVideoConfig();

    // Push-forward animation - iPhone comes from behind (small) to fill frame
    const pushForwardProgress = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 180, mass: 0.6 },
    });

    // Phone starts at same position Scene 3 pullback ends (0.4 scale, -200 Y)
    const pushScale = interpolate(pushForwardProgress, [0, 1], [0.4, 1]);
    const pushY = interpolate(pushForwardProgress, [0, 1], [-200, 0]); // Start up, move to center
    const phoneOpacity = 1; // Visible immediately so we see it coming forward

    // Base scale (2.15 is the phone mockup scale)
    const finalScale = pushScale * 2.15;

    return (
        <AbsoluteFill
            style={{
                background: COLORS.sceneBackground,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {/* Phone - pushes forward from behind to fill frame */}
            <div
                style={{
                    transform: `scale(${finalScale / 2.15}) translateY(${pushY}px)`,
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

export default IMessageResolution;
