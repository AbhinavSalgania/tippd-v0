"use client";

interface AnimatedIconProps {
  isHovered: boolean;
  className?: string;
}

export function LightningIcon({ isHovered, className = "" }: AnimatedIconProps) {
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
        d="M20 4 L12 20 L20 20 L18 36 L28 16 L20 16 L20 4 Z"
        fill="#26D07C"
        style={{
          animation: isHovered ? 'lightningFlash 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
      <style>{`
        @keyframes lightningFlash {
          0%, 100% { opacity: 1; transform: scale(1); }
          25% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.08); }
          75% { opacity: 0.7; transform: scale(0.98); }
        }
        @media (prefers-reduced-motion: reduce) {
          path { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

export function TargetIcon({ isHovered, className = "" }: AnimatedIconProps) {
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
      {/* Outer ring */}
      <circle
        cx="20"
        cy="20"
        r="14"
        stroke="#26D07C"
        strokeWidth="2"
        fill="none"
        style={{
          animation: isHovered ? 'targetPulse1 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
      {/* Middle ring */}
      <circle
        cx="20"
        cy="20"
        r="9"
        stroke="#26D07C"
        strokeWidth="2"
        fill="none"
        opacity="0.7"
        style={{
          animation: isHovered ? 'targetPulse2 1s cubic-bezier(0.4, 0, 0.2, 1) 0.1s' : 'none',
        }}
      />
      {/* Center dot */}
      <circle
        cx="20"
        cy="20"
        r="4"
        fill="#26D07C"
        style={{
          animation: isHovered ? 'targetHit 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s' : 'none',
        }}
      />
      <style>{`
        @keyframes targetPulse1 {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.6; }
        }
        @keyframes targetPulse2 {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 0.4; }
        }
        @keyframes targetHit {
          0%, 100% { transform: scale(1); }
          30% { transform: scale(1.4); }
          60% { transform: scale(0.9); }
        }
        @media (prefers-reduced-motion: reduce) {
          circle { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

export function EyeIcon({ isHovered, className = "" }: AnimatedIconProps) {
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
      {/* Eye outline */}
      <path
        d="M4 20 Q4 14 20 14 Q36 14 36 20 Q36 26 20 26 Q4 26 4 20 Z"
        stroke="#26D07C"
        strokeWidth="2"
        fill="white"
      />
      {/* Iris */}
      <circle
        cx="20"
        cy="20"
        r="5"
        fill="#26D07C"
        opacity="0.6"
      />
      {/* Pupil */}
      <circle
        cx="20"
        cy="20"
        r="3"
        fill="#0B1F18"
        style={{
          animation: isHovered ? 'eyeBlink 1.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
      {/* Eyelid */}
      <path
        d="M4 20 Q4 14 20 14 Q36 14 36 20"
        stroke="#26D07C"
        strokeWidth="2.5"
        fill="white"
        style={{
          transformOrigin: '20px 14px',
          animation: isHovered ? 'eyelidBlink 1.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
      <style>{`
        @keyframes eyeBlink {
          0%, 100% { transform: scaleY(1); }
          45%, 55% { transform: scaleY(0.1); }
        }
        @keyframes eyelidBlink {
          0%, 100% { transform: translateY(0); }
          45%, 55% { transform: translateY(6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          circle, path { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

export function LockIcon({ isHovered, className = "" }: AnimatedIconProps) {
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
      {/* Lock body */}
      <rect
        x="12"
        y="18"
        width="16"
        height="14"
        rx="2"
        fill="#26D07C"
        style={{
          animation: isHovered ? 'lockShake 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
      {/* Keyhole */}
      <circle cx="20" cy="24" r="2" fill="white" opacity="0.9" />
      <rect x="19" y="24" width="2" height="4" rx="1" fill="white" opacity="0.9" />

      {/* Shackle */}
      <path
        d="M14 18 L14 13 Q14 8 20 8 Q26 8 26 13 L26 18"
        stroke="#26D07C"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        style={{
          transformOrigin: '20px 18px',
          animation: isHovered ? 'shackleOpen 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
      <style>{`
        @keyframes lockShake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes shackleOpen {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-15deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          rect, path { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}
