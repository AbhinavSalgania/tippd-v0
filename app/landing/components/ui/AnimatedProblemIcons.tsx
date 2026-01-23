"use client";

interface AnimatedIconProps {
  isHovered: boolean;
  className?: string;
}

export function BarChartIcon({ isHovered, className = "" }: AnimatedIconProps) {
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
      <rect
        x="6"
        y="20"
        width="6"
        height="14"
        rx="1.5"
        fill="#26D07C"
        style={{
          animation: isHovered ? 'barBounce1 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
      <rect
        x="17"
        y="12"
        width="6"
        height="22"
        rx="1.5"
        fill="#26D07C"
        style={{
          animation: isHovered ? 'barBounce2 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s' : 'none',
        }}
      />
      <rect
        x="28"
        y="16"
        width="6"
        height="18"
        rx="1.5"
        fill="#26D07C"
        style={{
          animation: isHovered ? 'barBounce3 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s' : 'none',
        }}
      />
      <style>{`
        @keyframes barBounce1 {
          0%, 100% { transform: translateY(0) scaleY(1); }
          20% { transform: translateY(-3px) scaleY(0.95); }
          40% { transform: translateY(2px) scaleY(1.05); }
          60% { transform: translateY(-1px) scaleY(0.98); }
        }
        @keyframes barBounce2 {
          0%, 100% { transform: translateY(0) scaleY(1); }
          20% { transform: translateY(-4px) scaleY(0.92); }
          40% { transform: translateY(3px) scaleY(1.08); }
          60% { transform: translateY(-1px) scaleY(0.97); }
        }
        @keyframes barBounce3 {
          0%, 100% { transform: translateY(0) scaleY(1); }
          20% { transform: translateY(-2px) scaleY(0.96); }
          40% { transform: translateY(2px) scaleY(1.04); }
          60% { transform: translateY(-1px) scaleY(0.99); }
        }
        @media (prefers-reduced-motion: reduce) {
          rect { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

export function ScaleIcon({ isHovered, className = "" }: AnimatedIconProps) {
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
      {/* Center pivot */}
      <circle cx="20" cy="20" r="2.5" fill="#0B1F18" />

      {/* Balance beam */}
      <rect x="8" y="18.5" width="24" height="3" rx="1.5" fill="#26D07C" />

      {/* Left pan group */}
      <g
        style={{
          animation: isHovered ? 'panLeft 1.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      >
        <line x1="10" y1="18" x2="10" y2="12" stroke="#26D07C" strokeWidth="1.5" />
        <path
          d="M10 12 L6 8 L14 8 Z"
          fill="#26D07C"
          opacity="0.8"
        />
      </g>

      {/* Right pan group */}
      <g
        style={{
          animation: isHovered ? 'panRight 1.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      >
        <line x1="30" y1="18" x2="30" y2="12" stroke="#26D07C" strokeWidth="1.5" />
        <path
          d="M30 12 L26 8 L34 8 Z"
          fill="#26D07C"
          opacity="0.8"
        />
      </g>

      {/* Support stand */}
      <rect x="18.5" y="20" width="3" height="10" rx="1.5" fill="#0B1F18" opacity="0.6" />
      <rect x="14" y="29" width="12" height="2" rx="1" fill="#0B1F18" opacity="0.6" />

      <style>{`
        @keyframes panLeft {
          0%, 100% { transform: translateY(0); }
          15% { transform: translateY(-4px); }
          35% { transform: translateY(3px); }
          55% { transform: translateY(-2px); }
          70% { transform: translateY(1px); }
          85% { transform: translateY(-0.5px); }
        }
        @keyframes panRight {
          0%, 100% { transform: translateY(0); }
          15% { transform: translateY(3px); }
          35% { transform: translateY(-4px); }
          55% { transform: translateY(2px); }
          70% { transform: translateY(-1px); }
          85% { transform: translateY(0.5px); }
        }
        @media (prefers-reduced-motion: reduce) {
          g { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

export function ClockIcon({ isHovered, className = "" }: AnimatedIconProps) {
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
      {/* Clock face */}
      <circle cx="20" cy="20" r="14" stroke="#26D07C" strokeWidth="2.5" fill="white" />

      {/* Hour markers */}
      <circle cx="20" cy="8" r="1.2" fill="#0B1F18" opacity="0.3" />
      <circle cx="32" cy="20" r="1.2" fill="#0B1F18" opacity="0.3" />
      <circle cx="20" cy="32" r="1.2" fill="#0B1F18" opacity="0.3" />
      <circle cx="8" cy="20" r="1.2" fill="#0B1F18" opacity="0.3" />

      {/* Hour hand */}
      <rect
        x="18.5"
        y="14"
        width="3"
        height="7"
        rx="1.5"
        fill="#0B1F18"
        style={{
          transformOrigin: '20px 20px',
          animation: isHovered ? 'clockHourHand 4s linear infinite' : 'none',
        }}
      />

      {/* Minute hand */}
      <rect
        x="19"
        y="10"
        width="2"
        height="11"
        rx="1"
        fill="#26D07C"
        style={{
          transformOrigin: '20px 20px',
          animation: isHovered ? 'clockMinuteHand 2s linear infinite' : 'none',
        }}
      />

      {/* Center dot */}
      <circle cx="20" cy="20" r="2" fill="#0B1F18" />

      <style>{`
        @keyframes clockMinuteHand {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes clockHourHand {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          rect { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

export function DoorIcon({ isHovered, className = "" }: AnimatedIconProps) {
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
      {/* Door frame */}
      <rect x="10" y="6" width="20" height="28" rx="2" fill="#0B1F18" opacity="0.1" />

      {/* Door */}
      <g
        style={{
          transformOrigin: '12px 20px',
          animation: isHovered ? 'doorSwing 1.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      >
        <rect
          x="12"
          y="8"
          width="16"
          height="24"
          rx="1.5"
          fill="#26D07C"
        />

        {/* Door knob */}
        <circle cx="24" cy="20" r="1.5" fill="#0B1F18" opacity="0.4" />
      </g>

      <style>{`
        @keyframes doorSwing {
          0%, 100% { transform: perspective(200px) rotateY(0deg); }
          30% { transform: perspective(200px) rotateY(-55deg); }
          60% { transform: perspective(200px) rotateY(-10deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          g { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

export function MoneyWingsIcon({ isHovered, className = "" }: AnimatedIconProps) {
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
      {/* Bill */}
      <rect
        x="14"
        y="16"
        width="12"
        height="8"
        rx="1"
        fill="#26D07C"
        style={{
          animation: isHovered ? 'moneyFloat 1s cubic-bezier(0.4, 0, 0.2, 1) infinite' : 'none',
        }}
      />

      {/* Dollar sign */}
      <text
        x="20"
        y="22"
        fontSize="7"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        style={{
          animation: isHovered ? 'moneyFloat 1s cubic-bezier(0.4, 0, 0.2, 1) infinite' : 'none',
        }}
      >
        $
      </text>

      {/* Left wing */}
      <path
        d="M14 18 Q8 16 6 14 Q8 16 10 18 Q12 20 14 20 Z"
        fill="#26D07C"
        opacity="0.7"
        style={{
          transformOrigin: '14px 20px',
          animation: isHovered ? 'wingFlapLeft 0.6s ease-in-out infinite' : 'none',
        }}
      />

      {/* Right wing */}
      <path
        d="M26 18 Q32 16 34 14 Q32 16 30 18 Q28 20 26 20 Z"
        fill="#26D07C"
        opacity="0.7"
        style={{
          transformOrigin: '26px 20px',
          animation: isHovered ? 'wingFlapRight 0.6s ease-in-out infinite' : 'none',
        }}
      />

      <style>{`
        @keyframes moneyFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes wingFlapLeft {
          0%, 100% { transform: rotateZ(0deg); }
          25% { transform: rotateZ(-35deg); }
          50% { transform: rotateZ(5deg); }
          75% { transform: rotateZ(-25deg); }
        }
        @keyframes wingFlapRight {
          0%, 100% { transform: rotateZ(0deg); }
          25% { transform: rotateZ(35deg); }
          50% { transform: rotateZ(-5deg); }
          75% { transform: rotateZ(25deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          rect, text, path { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}
