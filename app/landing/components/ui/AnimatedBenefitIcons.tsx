"use client";

interface AnimatedIconProps {
  isHovered: boolean;
  className?: string;
}

export function EyeBenefitIcon({ isHovered, className = "" }: AnimatedIconProps) {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 1px 2px rgba(11, 31, 24, 0.1))' }}
    >
      {/* Eye outline */}
      <path
        d="M6 22 Q6 16 22 16 Q38 16 38 22 Q38 28 22 28 Q6 28 6 22 Z"
        stroke="#26D07C"
        strokeWidth="2.5"
        fill="#E3F5EC"
      />
      {/* Iris */}
      <circle
        cx="22"
        cy="22"
        r="5"
        fill="#26D07C"
        opacity="0.6"
      />
      {/* Pupil */}
      <circle
        cx="22"
        cy="22"
        r="3"
        fill="#0B1F18"
        style={{
          animation: isHovered ? 'pupilScan 1.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
      {/* Highlight */}
      <circle cx="24" cy="20" r="1.5" fill="white" opacity="0.8" />

      <style>{`
        @keyframes pupilScan {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          circle { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

export function CheckmarkIcon({ isHovered, className = "" }: AnimatedIconProps) {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 1px 2px rgba(11, 31, 24, 0.1))' }}
    >
      {/* Circle background */}
      <circle
        cx="22"
        cy="22"
        r="16"
        fill="#26D07C"
        opacity="0.15"
        style={{
          animation: isHovered ? 'checkPulse 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
      <circle
        cx="22"
        cy="22"
        r="12"
        fill="#26D07C"
        style={{
          animation: isHovered ? 'checkScale 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
      {/* Checkmark */}
      <path
        d="M15 22 L20 27 L29 16"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{
          strokeDasharray: '20',
          strokeDashoffset: isHovered ? '0' : '20',
          animation: isHovered ? 'checkDraw 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards' : 'none',
        }}
      />
      <style>{`
        @keyframes checkPulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.15); opacity: 0.25; }
        }
        @keyframes checkScale {
          0% { transform: scale(1); }
          40% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          circle, path { animation: none !important; stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}

export function ChartUpIcon({ isHovered, className = "" }: AnimatedIconProps) {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 1px 2px rgba(11, 31, 24, 0.1))' }}
    >
      {/* Bars */}
      <rect
        x="10"
        y="26"
        width="6"
        height="10"
        rx="1.5"
        fill="#26D07C"
        opacity="0.5"
        style={{
          transformOrigin: '13px 36px',
          animation: isHovered ? 'barGrow1 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
      <rect
        x="19"
        y="20"
        width="6"
        height="16"
        rx="1.5"
        fill="#26D07C"
        opacity="0.7"
        style={{
          transformOrigin: '22px 36px',
          animation: isHovered ? 'barGrow2 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s' : 'none',
        }}
      />
      <rect
        x="28"
        y="12"
        width="6"
        height="24"
        rx="1.5"
        fill="#26D07C"
        style={{
          transformOrigin: '31px 36px',
          animation: isHovered ? 'barGrow3 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s' : 'none',
        }}
      />
      {/* Trend arrow */}
      <path
        d="M8 28 L16 20 L24 16 L32 8"
        stroke="#26D07C"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        style={{
          strokeDasharray: '40',
          strokeDashoffset: isHovered ? '0' : '40',
          animation: isHovered ? 'arrowDraw 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards' : 'none',
        }}
      />
      <path
        d="M32 8 L28 10 L30 14"
        fill="#26D07C"
        style={{
          opacity: isHovered ? '1' : '0',
          animation: isHovered ? 'arrowheadAppear 0.3s ease-out 1.1s forwards' : 'none',
        }}
      />
      <style>{`
        @keyframes barGrow1 {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes barGrow2 {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes barGrow3 {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes arrowDraw {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes arrowheadAppear {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          rect, path { animation: none !important; stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
    </svg>
  );
}
