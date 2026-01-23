import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Html5Audio,
  staticFile,
} from 'remotion';

// Timeline (30fps, vertical 1080x1920):
// Scene 1 - Hook: 0-60 frames (2s)
// Scene 2 - Problem: 60-150 frames (3s)
// Scene 3 - Payoff: 150-330 frames (6s)
// Scene 4 - End: 330-420 frames (3s)
// Total: 420 frames (14s)

export const TippdVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#fafafa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      }}
    >
      {/* Background Music - Place your audio file at public/music.mp3 */}
      <Html5Audio
        src={staticFile('music.mp3')}
        volume={0.3}
      />

      {/* Scene 1: Hook (0-2s) */}
      {frame < 60 && <HookScene frame={frame} fps={fps} />}

      {/* Scene 2: Problem (2-5s) */}
      {frame >= 60 && frame < 150 && (
        <ProblemScene frame={frame - 60} fps={fps} />
      )}

      {/* Scene 3: Payoff (5-11s) */}
      {frame >= 150 && frame < 330 && (
        <PayoffScene frame={frame - 150} fps={fps} />
      )}

      {/* Scene 4: End Card (11-14s) */}
      {frame >= 330 && <EndScene frame={frame - 330} fps={fps} />}
    </AbsoluteFill>
  );
};

// Scene 1: Hook - Bold text with gentle upward motion
const HookScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 20, 50, 60], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(frame, [0, 30], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1), // Ease-out-expo
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 60px',
        opacity,
      }}
    >
      <h1
        style={{
          fontSize: 68,
          fontWeight: 700,
          color: '#0a0a0a',
          textAlign: 'center',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          transform: `translateY(${translateY}px)`,
        }}
      >
        Where did all
        <br />
        your tips go?
      </h1>
    </AbsoluteFill>
  );
};

// Scene 2: Problem - Layered confusion with staggered animations
const ProblemScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const items = [
    { text: '$127.50', type: 'number', delay: 0 },
    { text: 'Where?', type: 'question', delay: 8 },
    { text: '$89', type: 'number', delay: 15 },
    { text: '???', type: 'question', delay: 20 },
    { text: '$215.30', type: 'number', delay: 12 },
    { text: 'Lost tips', type: 'question', delay: 25 },
    { text: '$53', type: 'number', delay: 18 },
    { text: 'Confused', type: 'question', delay: 10 },
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        position: 'relative',
      }}
    >
      {items.map((item, index) => {
        const itemFrame = frame - item.delay;

        const opacity = interpolate(
          itemFrame,
          [0, 10, 40, 50],
          [0, 1, 1, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );

        const scale = interpolate(
          itemFrame,
          [0, 15],
          [0.8, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }
        );

        const rotation = interpolate(
          itemFrame,
          [0, 50],
          [index % 2 === 0 ? -3 : 3, index % 2 === 0 ? 2 : -2],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );

        // Distribute items across the screen
        const positions = [
          { top: '15%', left: '20%' },
          { top: '25%', left: '65%' },
          { top: '35%', left: '30%' },
          { top: '45%', left: '70%' },
          { top: '55%', left: '15%' },
          { top: '65%', left: '60%' },
          { top: '75%', left: '35%' },
          { top: '20%', left: '50%' },
        ];

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              ...positions[index],
              opacity,
              transform: `scale(${scale}) rotate(${rotation}deg)`,
            }}
          >
            <div
              style={{
                fontSize: item.type === 'number' ? 48 : 32,
                fontWeight: item.type === 'number' ? 700 : 600,
                color: item.type === 'number' ? '#71717a' : '#ef4444',
                padding: '12px 20px',
                backgroundColor: item.type === 'question' ? '#fef2f2' : 'transparent',
                borderRadius: 12,
              }}
            >
              {item.text}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Scene 3: Payoff - Clean dashboard with count-up
const PayoffScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const containerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#ffffff',
        opacity: containerOpacity,
      }}
    >
      {/* Clean top section */}
      <div
        style={{
          padding: '80px 40px 0',
          textAlign: 'center',
        }}
      >
        <TopLabel frame={frame} fps={fps} />
      </div>

      {/* Dashboard Card */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 40px',
        }}
      >
        <DashboardCard frame={frame} fps={fps} />
      </div>

      {/* Count-up total */}
      <div
        style={{
          padding: '0 40px 120px',
        }}
      >
        <CountUpTotal frame={frame} fps={fps} />
      </div>
    </AbsoluteFill>
  );
};

const TopLabel: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(frame, [10, 35], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#71717a',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 16,
        }}
      >
        Your Tips
      </div>
      <h2
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: '#0a0a0a',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}
      >
        All in one place
      </h2>
    </div>
  );
};

const DashboardCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const delay = 40;
  const cardFrame = frame - delay;

  const scale = spring({
    frame: cardFrame,
    fps,
    config: {
      damping: 100,
      mass: 0.5,
    },
  });

  const opacity = interpolate(cardFrame, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (cardFrame < 0) return null;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 900,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          backgroundColor: '#fafafa',
          borderRadius: 24,
          padding: 48,
          border: '1px solid #e4e4e7',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        }}
      >
        {/* Mini cards stack */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {[
            { date: 'Jan 22', amount: 342.5, delay: 0 },
            { date: 'Jan 21', amount: 298.75, delay: 8 },
            { date: 'Jan 20', amount: 401.25, delay: 16 },
          ].map((item, index) => (
            <MiniCard
              key={index}
              date={item.date}
              amount={item.amount}
              frame={cardFrame - item.delay}
              fps={fps}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const MiniCard: React.FC<{
  date: string;
  amount: number;
  frame: number;
  fps: number;
}> = ({ date, amount, frame, fps }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateX = interpolate(frame, [0, 25], [-30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  if (frame < 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 28px',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        border: '1px solid #f4f4f5',
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <span
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#52525b',
        }}
      >
        {date}
      </span>
      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#0a0a0a',
          letterSpacing: '-0.01em',
        }}
      >
        ${amount.toFixed(2)}
      </span>
    </div>
  );
};

const CountUpTotal: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const targetAmount = 1842.3;
  const startFrame = 80;
  const countFrame = frame - startFrame;

  const countProgress = spring({
    frame: countFrame,
    fps,
    config: {
      damping: 100,
      mass: 1,
    },
  });

  const currentAmount = interpolate(
    countProgress,
    [0, 1],
    [0, targetAmount],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const opacity = interpolate(frame, [startFrame - 10, startFrame + 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < startFrame - 10) return null;

  return (
    <div
      style={{
        textAlign: 'center',
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#71717a',
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        Total Tips
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: '#16a34a',
          letterSpacing: '-0.03em',
        }}
      >
        ${currentAmount.toFixed(2)}
      </div>
    </div>
  );
};

// Scene 4: End Card - Minimal brand + tagline
const EndScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(frame, [0, 30], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a0a',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 60px',
        opacity,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          transform: `translateY(${translateY}px)`,
        }}
      >
        <h1
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: 24,
            letterSpacing: '-0.04em',
          }}
        >
          Tippd
        </h1>
        <p
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: '#a1a1aa',
            letterSpacing: '-0.01em',
            lineHeight: 1.4,
          }}
        >
          Tip transparency, finally.
        </p>
      </div>
    </AbsoluteFill>
  );
};
