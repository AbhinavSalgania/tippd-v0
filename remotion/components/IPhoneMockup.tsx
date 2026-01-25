import React from 'react';

// ============================================
// iPhone 16 Pro Mockup Component
// Realistic device frame with Dynamic Island
// ============================================

interface IPhoneMockupProps {
  children: React.ReactNode;
  scale?: number;
  showReflection?: boolean;
}

// iPhone 16 Pro dimensions (scaled for video)
const DEVICE = {
  width: 393,
  height: 852,
  borderRadius: 55,
  bezelWidth: 12,
  dynamicIsland: {
    width: 126,
    height: 37,
    borderRadius: 19,
    topOffset: 11,
  },
  screenBorderRadius: 47,
};

// Colors
const COLORS = {
  titanium: '#78716C',
  titaniumLight: '#A8A29E',
  titaniumDark: '#57534E',
  screenBg: '#FFFFFF',
  dynamicIsland: '#000000',
  bezel: '#1C1917',
};

export const IPhoneMockup: React.FC<IPhoneMockupProps> = ({
  children,
  scale = 1,
  showReflection = true,
}) => {
  const scaledWidth = DEVICE.width * scale;
  const scaledHeight = DEVICE.height * scale;

  return (
    <div
      style={{
        position: 'relative',
        width: scaledWidth,
        height: scaledHeight,
        transform: `scale(${scale > 1 ? 1 : scale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Outer frame - Titanium border */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: DEVICE.borderRadius,
          background: `linear-gradient(
            145deg,
            ${COLORS.titaniumLight} 0%,
            ${COLORS.titanium} 50%,
            ${COLORS.titaniumDark} 100%
          )`,
          boxShadow: `
            0 50px 100px -20px rgba(0, 0, 0, 0.5),
            0 30px 60px -30px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2)
          `,
        }}
      />

      {/* Inner bezel - Black frame */}
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: 3,
          right: 3,
          bottom: 3,
          borderRadius: DEVICE.borderRadius - 3,
          backgroundColor: COLORS.bezel,
        }}
      />

      {/* Screen area */}
      <div
        style={{
          position: 'absolute',
          top: DEVICE.bezelWidth,
          left: DEVICE.bezelWidth,
          right: DEVICE.bezelWidth,
          bottom: DEVICE.bezelWidth,
          borderRadius: DEVICE.screenBorderRadius,
          backgroundColor: COLORS.screenBg,
          overflow: 'hidden',
        }}
      >
        {/* Screen content */}
        {children}

        {/* Dynamic Island */}
        <div
          style={{
            position: 'absolute',
            top: DEVICE.dynamicIsland.topOffset,
            left: '50%',
            transform: 'translateX(-50%)',
            width: DEVICE.dynamicIsland.width,
            height: DEVICE.dynamicIsland.height,
            borderRadius: DEVICE.dynamicIsland.borderRadius,
            backgroundColor: COLORS.dynamicIsland,
            zIndex: 100,
          }}
        />

        {/* Screen reflection overlay */}
        {showReflection && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(
                165deg,
                rgba(255, 255, 255, 0.1) 0%,
                rgba(255, 255, 255, 0.05) 20%,
                transparent 40%
              )`,
              pointerEvents: 'none',
              zIndex: 99,
            }}
          />
        )}
      </div>

      {/* Side buttons - Volume */}
      <div
        style={{
          position: 'absolute',
          left: -2,
          top: 180,
          width: 3,
          height: 35,
          backgroundColor: COLORS.titanium,
          borderRadius: '2px 0 0 2px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -2,
          top: 230,
          width: 3,
          height: 65,
          backgroundColor: COLORS.titanium,
          borderRadius: '2px 0 0 2px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -2,
          top: 305,
          width: 3,
          height: 65,
          backgroundColor: COLORS.titanium,
          borderRadius: '2px 0 0 2px',
        }}
      />

      {/* Side button - Power */}
      <div
        style={{
          position: 'absolute',
          right: -2,
          top: 250,
          width: 3,
          height: 90,
          backgroundColor: COLORS.titanium,
          borderRadius: '0 2px 2px 0',
        }}
      />
    </div>
  );
};

// Export device dimensions for use in other components
export const IPHONE_DIMENSIONS = {
  width: DEVICE.width,
  height: DEVICE.height,
  screenWidth: DEVICE.width - DEVICE.bezelWidth * 2,
  screenHeight: DEVICE.height - DEVICE.bezelWidth * 2,
  safeAreaTop: DEVICE.dynamicIsland.topOffset + DEVICE.dynamicIsland.height + 8,
  safeAreaBottom: 34,
};

export default IPhoneMockup;
