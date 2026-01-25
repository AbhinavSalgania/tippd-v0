import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useVideoConfig,
  random,
  Easing,
} from 'remotion';

// ============================================
// SPREADSHEET CHAOS SCENE
// Visualizes the fragility of manual tip calculation
// ============================================

interface SpreadsheetChaosProps {
  frame: number;
}

// Design tokens
const COLORS = {
  gridBorder: '#10B981',
  gridBorderLight: 'rgba(16, 185, 129, 0.3)',
  headerBg: '#F0FDF4',
  cellBg: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  errorOverlay: 'rgba(239, 68, 68, 0.08)',
};

const FONTS = {
  mono: '"SF Mono", "Fira Code", "Consolas", monospace',
  system: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
};

// Spreadsheet data structure
interface CellData {
  value: string;
  isHeader: boolean;
  isFormula: boolean;
  errorFrame?: number; // Frame when this cell breaks
}

// Initial spreadsheet data - looks trustworthy
const SPREADSHEET_DATA: CellData[][] = [
  // Header row
  [
    { value: 'Server', isHeader: true, isFormula: false },
    { value: 'Sales', isHeader: true, isFormula: false },
    { value: 'Tips', isHeader: true, isFormula: false },
    { value: 'Kitchen', isHeader: true, isFormula: false },
    { value: 'Bar', isHeader: true, isFormula: false },
    { value: 'Net', isHeader: true, isFormula: false },
  ],
  // Data rows
  [
    { value: 'Sarah M.', isHeader: false, isFormula: false },
    { value: '$892.50', isHeader: false, isFormula: false },
    { value: '$178.50', isHeader: false, isFormula: false },
    { value: '$17.85', isHeader: false, isFormula: true, errorFrame: 45 },
    { value: '$4.46', isHeader: false, isFormula: true, errorFrame: 55 },
    { value: '$156.19', isHeader: false, isFormula: true, errorFrame: 70 },
  ],
  [
    { value: 'Mike T.', isHeader: false, isFormula: false },
    { value: '$756.00', isHeader: false, isFormula: false },
    { value: '$151.20', isHeader: false, isFormula: false },
    { value: '$15.12', isHeader: false, isFormula: true, errorFrame: 50 },
    { value: '$3.78', isHeader: false, isFormula: true, errorFrame: 60 },
    { value: '$132.30', isHeader: false, isFormula: true, errorFrame: 75 },
  ],
  [
    { value: 'Jake R.', isHeader: false, isFormula: false },
    { value: '$1,204.00', isHeader: false, isFormula: false },
    { value: '$241.00', isHeader: false, isFormula: false },
    { value: '$24.08', isHeader: false, isFormula: true, errorFrame: 42 },
    { value: '$6.02', isHeader: false, isFormula: true, errorFrame: 52 },
    { value: '$210.90', isHeader: false, isFormula: true, errorFrame: 68 },
  ],
  [
    { value: 'Emma L.', isHeader: false, isFormula: false },
    { value: '$634.25', isHeader: false, isFormula: false },
    { value: '$127.85', isHeader: false, isFormula: false },
    { value: '$12.69', isHeader: false, isFormula: true, errorFrame: 48 },
    { value: '$3.17', isHeader: false, isFormula: true, errorFrame: 58 },
    { value: '$111.99', isHeader: false, isFormula: true, errorFrame: 72 },
  ],
  // Totals row
  [
    { value: 'TOTAL', isHeader: false, isFormula: false },
    { value: '$3,486.75', isHeader: false, isFormula: true, errorFrame: 65 },
    { value: '$698.55', isHeader: false, isFormula: true, errorFrame: 62 },
    { value: '$69.74', isHeader: false, isFormula: true, errorFrame: 40 },
    { value: '$17.43', isHeader: false, isFormula: true, errorFrame: 54 },
    { value: '$611.38', isHeader: false, isFormula: true, errorFrame: 78 },
  ],
];

// Error messages that replace broken formulas
const ERROR_MESSAGES = ['#REF!', '#DIV/0!', 'ERROR', '#VALUE!', '#N/A'];

export const SpreadsheetChaos: React.FC<SpreadsheetChaosProps> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Scene-level opacity - fade in only, TransitionSeries handles exit
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Background tint toward red as chaos increases
  const bgTint = interpolate(frame, [30, 90], [0, 0.03], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(239, 68, 68, ${bgTint})`,
        opacity: sceneOpacity,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
      }}
    >
      {/* Title */}
      <SceneTitle frame={frame} />

      {/* Spreadsheet Grid */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 950,
          marginTop: 100,
        }}
      >
        <SpreadsheetGrid frame={frame} fps={fps} />

        {/* Error Badge Overlay */}
        {frame >= 60 && <ErrorBadge frame={frame - 60} fps={fps} />}
      </div>
    </AbsoluteFill>
  );
};

// Scene title component - subtitle style, not headline
const SceneTitle: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(frame, [0, 15], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <p
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: COLORS.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          margin: 0,
          marginBottom: 10,
          fontFamily: FONTS.system,
        }}
      >
        Every night
      </p>
      <h2
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: COLORS.text,
          margin: 0,
          letterSpacing: '-0.02em',
          fontFamily: FONTS.system,
        }}
      >
        The spreadsheet struggle
      </h2>
    </div>
  );
};

// Main spreadsheet grid
const SpreadsheetGrid: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // Grid entrance animation
  const gridScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 20, mass: 0.8 },
  });

  const gridOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        backgroundColor: COLORS.cellBg,
        borderRadius: 12,
        border: `2px solid ${COLORS.gridBorder}`,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.08)',
        opacity: gridOpacity,
        transform: `scale(${Math.min(gridScale, 1)})`,
      }}
    >
      {SPREADSHEET_DATA.map((row, rowIndex) => (
        <SpreadsheetRow
          key={rowIndex}
          cells={row}
          rowIndex={rowIndex}
          frame={frame}
          fps={fps}
        />
      ))}
    </div>
  );
};

// Spreadsheet row component
const SpreadsheetRow: React.FC<{
  cells: CellData[];
  rowIndex: number;
  frame: number;
  fps: number;
}> = ({ cells, rowIndex, frame, fps }) => {
  const isHeader = rowIndex === 0;
  const isTotals = rowIndex === SPREADSHEET_DATA.length - 1;

  // Row entrance stagger
  const rowDelay = rowIndex * 4;
  const rowFrame = frame - rowDelay;

  const rowOpacity = interpolate(rowFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rowX = interpolate(rowFrame, [0, 18], [-40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Chaos: Row drift after frame 30
  const chaosActive = frame > 30 && !isHeader;
  const driftSeed = `row-drift-${rowIndex}`;
  const driftAmount = chaosActive
    ? interpolate(frame, [30, 90], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const rowDriftX = chaosActive
    ? (random(driftSeed + '-x') - 0.5) * 12 * driftAmount
    : 0;
  const rowDriftY = chaosActive
    ? (random(driftSeed + '-y') - 0.5) * 6 * driftAmount
    : 0;
  const rowRotation = chaosActive
    ? (random(driftSeed + '-r') - 0.5) * 2 * driftAmount
    : 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr 0.9fr 0.8fr 1fr',
        borderBottom:
          rowIndex < SPREADSHEET_DATA.length - 1
            ? `1px solid ${COLORS.gridBorderLight}`
            : 'none',
        backgroundColor: isHeader
          ? COLORS.headerBg
          : isTotals
          ? '#F8FAFC'
          : COLORS.cellBg,
        opacity: rowOpacity,
        transform: `translateX(${rowX + rowDriftX}px) translateY(${rowDriftY}px) rotate(${rowRotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {cells.map((cell, cellIndex) => (
        <SpreadsheetCell
          key={cellIndex}
          cell={cell}
          rowIndex={rowIndex}
          cellIndex={cellIndex}
          frame={frame}
          fps={fps}
        />
      ))}
    </div>
  );
};

// Individual cell component
const SpreadsheetCell: React.FC<{
  cell: CellData;
  rowIndex: number;
  cellIndex: number;
  frame: number;
  fps: number;
}> = ({ cell, rowIndex, cellIndex, frame }) => {
  const { isHeader, isFormula, errorFrame, value } = cell;

  // Determine if this cell is broken
  const isBroken = isFormula && errorFrame !== undefined && frame >= errorFrame;

  // Cell-specific chaos drift
  const chaosActive = frame > 30 && !isHeader;
  const cellSeed = `cell-${rowIndex}-${cellIndex}`;
  const driftAmount = chaosActive
    ? interpolate(frame, [30, 90], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const cellDriftX = chaosActive
    ? (random(cellSeed + '-x') - 0.5) * 4 * driftAmount
    : 0;
  const cellRotation = chaosActive
    ? (random(cellSeed + '-r') - 0.5) * 3 * driftAmount
    : 0;

  // Error transition
  const errorProgress = isBroken
    ? interpolate(frame, [errorFrame!, errorFrame! + 8], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Get deterministic error message
  const errorIndex = Math.floor(random(cellSeed + '-error') * ERROR_MESSAGES.length);
  const displayValue = isBroken && errorProgress > 0.5
    ? ERROR_MESSAGES[errorIndex]
    : value;

  // Background color transition
  const bgColor = isBroken
    ? interpolate(
        errorProgress,
        [0, 1],
        [0, 1]
      )
    : 0;

  const isNumeric = !isHeader && cellIndex > 0;
  const isTotals = rowIndex === SPREADSHEET_DATA.length - 1;
  const isName = cellIndex === 0 && !isHeader;

  return (
    <div
      style={{
        padding: '14px 12px',
        fontSize: isHeader ? 13 : 16,
        fontWeight: isHeader || isTotals ? 700 : 500,
        fontFamily: isNumeric || isBroken ? FONTS.mono : FONTS.system,
        color: isBroken && errorProgress > 0.5 ? COLORS.error : isHeader ? COLORS.text : COLORS.textMuted,
        backgroundColor: `rgba(254, 226, 226, ${bgColor * 0.6})`,
        textAlign: isName ? 'left' : isNumeric ? 'right' : 'center',
        textTransform: isHeader ? 'uppercase' : 'none',
        letterSpacing: isHeader ? '0.08em' : 'normal',
        borderRight: cellIndex < 5 ? `1px solid ${COLORS.gridBorderLight}` : 'none',
        transform: `translateX(${cellDriftX}px) rotate(${cellRotation}deg)`,
        transition: 'background-color 0.15s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {displayValue}
    </div>
  );
};

// Error badge overlay
const ErrorBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Snappier spring for more punch - reduced damping, increased stiffness
  const badgeScale = spring({
    frame,
    fps,
    config: { damping: 8, mass: 0.6, stiffness: 300 },
  });

  // Slight rotation
  const rotation = interpolate(frame, [0, 8], [-4, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Badge shake for emphasis
  const shakeAmount = interpolate(frame, [8, 15, 20], [0, 3, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shakeX = Math.sin(frame * 0.8) * shakeAmount;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${badgeScale}) rotate(${rotation}deg) translateX(${shakeX}px)`,
        zIndex: 10,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.error,
          color: COLORS.cellBg,
          padding: '28px 56px',
          borderRadius: 16,
          fontSize: 36,
          fontWeight: 800,
          fontFamily: FONTS.mono,
          letterSpacing: '0.02em',
          boxShadow: `
            0 12px 40px rgba(239, 68, 68, 0.5),
            0 4px 12px rgba(239, 68, 68, 0.3)
          `,
          textAlign: 'center',
        }}
      >
        FORMULAS BROKEN
      </div>
    </div>
  );
};

export default SpreadsheetChaos;
