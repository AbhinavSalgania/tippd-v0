import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';

// ============================================
// LIGHT WIPE TRANSITION
// A bright wipe that sweeps from top to bottom,
// replacing darkness with light - "breath of fresh air"
// ============================================

type LightWipeProps = {
  direction?: 'top-to-bottom' | 'bottom-to-top';
};

const LightWipeComponent: React.FC<
  TransitionPresentationComponentProps<LightWipeProps>
> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const { direction = 'top-to-bottom' } = passedProps;
  const isEntering = presentationDirection === 'entering';

  // Video dimensions
  const videoHeight = 1920;
  const wipeHeight = 250; // Height of the bright wipe bar

  // Calculate wipe position based on progress
  // Wipe travels from -wipeHeight (above screen) to videoHeight (below screen)
  const wipeY = interpolate(
    presentationProgress,
    [0, 1],
    direction === 'top-to-bottom'
      ? [-wipeHeight, videoHeight]
      : [videoHeight, -wipeHeight]
  );

  // For entering scene: clip from top of screen to wipe position
  // For exiting scene: clip from wipe position to bottom of screen
  const clipTop = isEntering ? 0 : wipeY + wipeHeight;
  const clipBottom = isEntering ? wipeY + wipeHeight : videoHeight;

  // Entering scene opacity ramps up, exiting scene fades
  const opacity = isEntering
    ? interpolate(presentationProgress, [0, 0.3], [0.8, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : interpolate(presentationProgress, [0.7, 1], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  return (
    <AbsoluteFill>
      {/* Content with clip mask */}
      <AbsoluteFill
        style={{
          clipPath: `inset(${Math.max(0, clipTop)}px 0 ${Math.max(0, videoHeight - clipBottom)}px 0)`,
          opacity,
        }}
      >
        {children}
      </AbsoluteFill>

      {/* Bright wipe bar - only render once (on entering layer) */}
      {isEntering && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: wipeY,
            height: wipeHeight,
            background: `linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.4) 20%,
              rgba(255, 255, 255, 0.95) 45%,
              rgba(255, 255, 255, 0.95) 55%,
              rgba(255, 255, 255, 0.4) 80%,
              rgba(255, 255, 255, 0) 100%
            )`,
            boxShadow: '0 0 80px 40px rgba(255, 255, 255, 0.6)',
            pointerEvents: 'none',
            zIndex: 100,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const lightWipe = (
  props: LightWipeProps = {}
): TransitionPresentation<LightWipeProps> => {
  return {
    component: LightWipeComponent,
    props,
  };
};

export default lightWipe;
