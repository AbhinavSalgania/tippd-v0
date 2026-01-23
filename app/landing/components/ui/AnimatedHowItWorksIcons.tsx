"use client";

interface AnimatedIconProps {
  isHovered: boolean;
  className?: string;
}

export function PlugIcon({ isHovered, className = "" }: AnimatedIconProps) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 1px 2px rgba(11, 31, 24, 0.1))' }}
    >
      {/* Plug prongs */}
      <g
        style={{
          animation: isHovered ? 'plugConnect 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      >
        <rect x="14" y="8" width="3" height="8" rx="1.5" fill="#26D07C" />
        <rect x="23" y="8" width="3" height="8" rx="1.5" fill="#26D07C" />
        {/* Plug body */}
        <rect x="12" y="16" width="16" height="10" rx="2" fill="#26D07C" />
        <circle cx="17" cy="21" r="1.5" fill="white" opacity="0.6" />
        <circle cx="23" cy="21" r="1.5" fill="white" opacity="0.6" />
      </g>

      {/* Socket */}
      <rect x="10" y="28" width="20" height="8" rx="2" fill="#0B1F18" opacity="0.2" />
      <circle cx="16" cy="32" r="1.2" fill="#0B1F18" opacity="0.3" />
      <circle cx="24" cy="32" r="1.2" fill="#0B1F18" opacity="0.3" />

      <style>{`
        @keyframes plugConnect {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
          60% { transform: translateY(2px); }
        }
        @media (prefers-reduced-motion: reduce) {
          g { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

export function GearIcon({ isHovered, className = "" }: AnimatedIconProps) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 1px 2px rgba(11, 31, 24, 0.1))' }}
    >
      <g
        style={{
          transformOrigin: '20px 20px',
          animation: isHovered ? 'gearRotate 2s ease-in-out' : 'none',
        }}
      >
        {/* Gear teeth */}
        <path
          d="M20 6 L22 10 L26 10 L24 14 L28 16 L26 20 L28 24 L24 26 L26 30 L22 30 L20 34 L18 30 L14 30 L16 26 L12 24 L14 20 L12 16 L16 14 L14 10 L18 10 Z"
          fill="#26D07C"
        />
        {/* Center circle */}
        <circle cx="20" cy="20" r="6" fill="#0B1F18" opacity="0.2" />
        <circle cx="20" cy="20" r="4" fill="white" />
      </g>
      <style>{`
        @keyframes gearRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(120deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          g { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

export function BoltIcon({ isHovered, className = "" }: AnimatedIconProps) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 1px 2px rgba(11, 31, 24, 0.1))' }}
    >
      <path
        d="M22 4 L14 18 L20 18 L18 36 L26 18 L22 18 Z"
        fill="#26D07C"
        style={{
          animation: isHovered ? 'boltZap 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
      {/* Energy particles */}
      <circle
        cx="12"
        cy="16"
        r="2"
        fill="#26D07C"
        opacity="0.6"
        style={{
          animation: isHovered ? 'particle1 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
      <circle
        cx="28"
        cy="22"
        r="1.5"
        fill="#26D07C"
        opacity="0.6"
        style={{
          animation: isHovered ? 'particle2 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s' : 'none',
        }}
      />
      <style>{`
        @keyframes boltZap {
          0%, 100% { opacity: 1; filter: brightness(1); }
          25%, 75% { opacity: 0.7; filter: brightness(1.5); }
          50% { opacity: 1; filter: brightness(2); }
        }
        @keyframes particle1 {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { transform: translate(-6px, -6px) scale(1); opacity: 0.6; }
          100% { transform: translate(-12px, -12px) scale(0); opacity: 0; }
        }
        @keyframes particle2 {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { transform: translate(6px, 6px) scale(1); opacity: 0.6; }
          100% { transform: translate(12px, 12px) scale(0); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          path, circle { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}
