import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useVideoConfig,
  random,
  Easing,
} from 'remotion';
import { employees } from '../data/mockData';

// ============================================
// SPREADSHEET CHAOS SCENE - "THE BLACK BOX"
// Green cells → Red errors → Blackout → Overlay
// Creates feeling of chaos leading to total opacity loss
// ============================================

interface SpreadsheetChaosProps {
  frame: number;
}

// Design tokens
const COLORS = {
  // Green (trust) phase
  gridBorder: '#10B981',
  gridBorderLight: 'rgba(16, 185, 129, 0.3)',
  headerBg: '#F0FDF4',
  cellBg: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  // Red (error) phase
  error: '#EF4444',
  errorBg: '#FEE2E2',
  // Black box phase
  black: '#000000',
  overlayBg: 'rgba(0, 0, 0, 0.92)',
  white: '#FFFFFF',
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
  errorFrame?: number;
}

// Error messages
const ERROR_MESSAGES = ['#REF!', '#DIV/0!', 'ERROR', '#VALUE!', '#N/A'];

// Extra employee names for more rows - enough to fill full screen
const EXTRA_STAFF = [
  { name: 'Alex P.', sales: 589.25, tips: 112.50, net: 94.75 },
  { name: 'Jordan K.', sales: 723.00, tips: 138.20, net: 118.40 },
  { name: 'Taylor S.', sales: 445.50, tips: 89.10, net: 72.30 },
  { name: 'Morgan R.', sales: 812.75, tips: 162.55, net: 139.80 },
  { name: 'Casey M.', sales: 534.00, tips: 106.80, net: 89.45 },
  { name: 'Riley B.', sales: 667.25, tips: 133.45, net: 112.90 },
  { name: 'Quinn D.', sales: 398.50, tips: 79.70, net: 65.25 },
  { name: 'Avery L.', sales: 756.00, tips: 151.20, net: 128.50 },
  { name: 'Drew H.', sales: 623.75, tips: 124.75, net: 105.60 },
  { name: 'Sam W.', sales: 489.00, tips: 97.80, net: 81.35 },
  { name: 'Jamie F.', sales: 712.50, tips: 142.50, net: 121.25 },
  { name: 'Blake N.', sales: 567.00, tips: 113.40, net: 95.80 },
  { name: 'Reese T.', sales: 834.25, tips: 166.85, net: 142.30 },
  { name: 'Parker J.', sales: 445.75, tips: 89.15, net: 74.60 },
  { name: 'Skyler M.', sales: 678.50, tips: 135.70, net: 115.40 },
  { name: 'Dakota R.', sales: 523.00, tips: 104.60, net: 88.25 },
  { name: 'Finley C.', sales: 789.25, tips: 157.85, net: 134.50 },
  { name: 'Rowan B.', sales: 456.50, tips: 91.30, net: 76.80 },
  { name: 'Kendall S.', sales: 612.75, tips: 122.55, net: 103.90 },
  { name: 'Sage L.', sales: 534.25, tips: 106.85, net: 90.45 },
  { name: 'Phoenix K.', sales: 745.00, tips: 149.00, net: 126.80 },
  { name: 'River A.', sales: 489.50, tips: 97.90, net: 82.40 },
  { name: 'Emery D.', sales: 667.75, tips: 133.55, net: 113.20 },
  { name: 'Lennox P.', sales: 578.25, tips: 115.65, net: 97.90 },
  { name: 'Marlowe H.', sales: 823.50, tips: 164.70, net: 140.10 },
];

// Build spreadsheet data from mock data
const buildSpreadsheetData = (): CellData[][] => {
  const data: CellData[][] = [];

  // Header row
  data.push([
    { value: 'Server', isHeader: true, isFormula: false },
    { value: 'Sales', isHeader: true, isFormula: false },
    { value: 'Tips', isHeader: true, isFormula: false },
    { value: 'Kitchen', isHeader: true, isFormula: false },
    { value: 'Bar', isHeader: true, isFormula: false },
    { value: 'Net', isHeader: true, isFormula: false },
  ]);

  // Data rows from employees - errors cascade across cells
  employees.forEach((emp, idx) => {
    const baseErrorFrame = 18 + idx * 2;
    data.push([
      { value: emp.name, isHeader: false, isFormula: false },
      { value: `$${emp.sales.toFixed(2)}`, isHeader: false, isFormula: false },
      { value: `$${emp.tipsCollected.toFixed(2)}`, isHeader: false, isFormula: false },
      { value: `$${(emp.tipsCollected * 0.1).toFixed(2)}`, isHeader: false, isFormula: true, errorFrame: baseErrorFrame },
      { value: `$${(emp.tipsCollected * 0.025).toFixed(2)}`, isHeader: false, isFormula: true, errorFrame: baseErrorFrame + 3 },
      { value: `$${emp.netPayout.toFixed(2)}`, isHeader: false, isFormula: true, errorFrame: baseErrorFrame + 6 },
    ]);
  });

  // Add extra staff rows to fill the screen
  EXTRA_STAFF.forEach((staff, idx) => {
    const baseErrorFrame = 28 + idx * 1; // Faster cascade for extra rows
    data.push([
      { value: staff.name, isHeader: false, isFormula: false },
      { value: `$${staff.sales.toFixed(2)}`, isHeader: false, isFormula: false },
      { value: `$${staff.tips.toFixed(2)}`, isHeader: false, isFormula: false },
      { value: `$${(staff.tips * 0.1).toFixed(2)}`, isHeader: false, isFormula: true, errorFrame: baseErrorFrame },
      { value: `$${(staff.tips * 0.025).toFixed(2)}`, isHeader: false, isFormula: true, errorFrame: baseErrorFrame + 2 },
      { value: `$${staff.net.toFixed(2)}`, isHeader: false, isFormula: true, errorFrame: baseErrorFrame + 4 },
    ]);
  });

  // Totals row - errors hit totals last
  data.push([
    { value: 'TOTAL', isHeader: false, isFormula: false },
    { value: '$8,742.50', isHeader: false, isFormula: true, errorFrame: 38 },
    { value: '$1,748.50', isHeader: false, isFormula: true, errorFrame: 39 },
    { value: '$174.85', isHeader: false, isFormula: true, errorFrame: 40 },
    { value: '$43.71', isHeader: false, isFormula: true, errorFrame: 41 },
    { value: '$1,530.44', isHeader: false, isFormula: true, errorFrame: 42 },
  ]);

  return data;
};

const SPREADSHEET_DATA = buildSpreadsheetData();

// Timeline constants (30fps, 125 frames total - text holds 1.5s)
const BLACKOUT_START = 72; // Delayed - let red errors breathe
const BLACKOUT_END = 82; // Fully black (faster uniform blackout)
const OVERLAY_APPEAR = 80; // When text overlay slides in
// Scene ends at frame 125 - text visible for 45 frames (1.5s)

export const SpreadsheetChaos: React.FC<SpreadsheetChaosProps> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Scene entrance
  const sceneOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Blackout progress - spreadsheet fades to black
  const blackoutProgress = interpolate(frame, [BLACKOUT_START, BLACKOUT_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Blur increases as chaos grows, then heavy blur during blackout
  const chaosBlur = interpolate(frame, [28, BLACKOUT_START, BLACKOUT_END], [0, 1.5, 5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // "THE BLACK BOX" overlay animation
  const overlayFrame = Math.max(0, frame - OVERLAY_APPEAR);
  const overlaySpring = spring({
    frame: overlayFrame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 1 }, // Slower, smoother spring
  });

  const overlayOpacity = frame >= OVERLAY_APPEAR ? overlaySpring : 0;
  // Slide down from top (-300px) to center (0) - smoother motion
  const overlayY = interpolate(overlaySpring, [0, 1], [-300, 0]);

  // Full-screen uniform blackout overlay
  const fullBlackoutOpacity = interpolate(frame, [BLACKOUT_START, BLACKOUT_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.cellBg,
        opacity: sceneOpacity,
        overflow: 'hidden',
      }}
    >
      {/* Title at top - stays visible until blackout */}
      <SceneTitle frame={frame} blackoutProgress={fullBlackoutOpacity} />

      {/* Spreadsheet container - fills screen below title */}
      <div
        style={{
          position: 'absolute',
          top: 180,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            filter: `blur(${chaosBlur}px)`,
          }}
        >
          <SpreadsheetGrid frame={frame} fps={fps} blackoutProgress={blackoutProgress} />
        </div>
      </div>

      {/* FULL-SCREEN UNIFORM BLACKOUT - covers everything uniformly */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: COLORS.black,
          opacity: fullBlackoutOpacity,
          pointerEvents: 'none',
        }}
      />

      {/* Text overlay - slides down from top, appears on dark screen */}
      {frame >= OVERLAY_APPEAR && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: overlayOpacity,
            transform: `translateY(${overlayY}px)`,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.92)',
              padding: '55px 70px',
              borderRadius: 20,
              textAlign: 'center',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <p
              style={{
                fontSize: 44,
                fontWeight: 600,
                color: COLORS.white,
                fontFamily: FONTS.system,
                margin: 0,
                letterSpacing: '0.02em',
                lineHeight: 1.5,
              }}
            >
              Complex math. Zero context. No trust.
            </p>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// Scene title at top - fades out during blackout
const SceneTitle: React.FC<{ frame: number; blackoutProgress: number }> = ({ frame, blackoutProgress }) => {
  const entranceOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out as screen goes dark
  const fadeOut = interpolate(blackoutProgress, [0, 0.8], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(frame, [0, 12], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity: entranceOpacity * fadeOut,
        transform: `translateY(${y}px)`,
        zIndex: 10,
      }}
    >
      <p
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: COLORS.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          margin: 0,
          marginBottom: 12,
          fontFamily: FONTS.system,
        }}
      >
        Every night
      </p>
      <h2
        style={{
          fontSize: 58,
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

// Spreadsheet grid
const SpreadsheetGrid: React.FC<{ frame: number; fps: number; blackoutProgress: number }> = ({
  frame,
  fps,
  blackoutProgress,
}) => {
  const gridScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 20, mass: 0.8 },
  });

  const gridOpacity = interpolate(frame, [5, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        backgroundColor: COLORS.cellBg,
        borderRadius: 0,
        border: 'none',
        overflow: 'hidden',
        height: '100%',
        opacity: gridOpacity,
        transform: `scale(${Math.min(gridScale, 1)})`,
        transformOrigin: 'top center',
      }}
    >
      {SPREADSHEET_DATA.map((row, rowIndex) => (
        <SpreadsheetRow
          key={rowIndex}
          cells={row}
          rowIndex={rowIndex}
          frame={frame}
          blackoutProgress={blackoutProgress}
        />
      ))}
    </div>
  );
};

// Spreadsheet row
const SpreadsheetRow: React.FC<{
  cells: CellData[];
  rowIndex: number;
  frame: number;
  blackoutProgress: number;
}> = ({ cells, rowIndex, frame, blackoutProgress }) => {
  const isHeader = rowIndex === 0;
  const isTotals = rowIndex === SPREADSHEET_DATA.length - 1;

  const rowDelay = rowIndex * 1; // Faster stagger for more rows
  const rowFrame = frame - rowDelay;

  const rowOpacity = interpolate(rowFrame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rowX = interpolate(rowFrame, [0, 10], [-20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Row shake during chaos
  const chaosActive = frame > 25 && !isHeader && blackoutProgress < 0.5;
  const driftSeed = `row-drift-${rowIndex}`;
  const driftAmount = chaosActive
    ? interpolate(frame, [25, 45], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const rowDriftX = chaosActive ? (random(driftSeed + '-x') - 0.5) * 8 * driftAmount : 0;
  const rowDriftY = chaosActive ? (random(driftSeed + '-y') - 0.5) * 4 * driftAmount : 0;

  // Background darkens during blackout
  const bgDarken = interpolate(blackoutProgress, [0, 1], [0, 0.9], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr 0.9fr 0.8fr 1fr',
        borderBottom: rowIndex < SPREADSHEET_DATA.length - 1
          ? `1px solid ${COLORS.gridBorderLight}`
          : 'none',
        backgroundColor: isHeader
          ? `rgba(240, 253, 244, ${1 - bgDarken})`
          : isTotals
          ? `rgba(248, 250, 252, ${1 - bgDarken})`
          : `rgba(255, 255, 255, ${1 - bgDarken})`,
        opacity: rowOpacity,
        transform: `translateX(${rowX + rowDriftX}px) translateY(${rowDriftY}px)`,
      }}
    >
      {cells.map((cell, cellIndex) => (
        <SpreadsheetCell
          key={cellIndex}
          cell={cell}
          rowIndex={rowIndex}
          cellIndex={cellIndex}
          frame={frame}
          blackoutProgress={blackoutProgress}
        />
      ))}
    </div>
  );
};

// Individual cell
const SpreadsheetCell: React.FC<{
  cell: CellData;
  rowIndex: number;
  cellIndex: number;
  frame: number;
  blackoutProgress: number;
}> = ({ cell, rowIndex, cellIndex, frame, blackoutProgress }) => {
  const { isHeader, isFormula, errorFrame, value } = cell;

  // Cell breaks when frame >= errorFrame
  const isBroken = isFormula && errorFrame !== undefined && frame >= errorFrame;

  // Error transition animation
  const errorProgress = isBroken
    ? interpolate(frame, [errorFrame!, errorFrame! + 6], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Get error message
  const cellSeed = `cell-${rowIndex}-${cellIndex}`;
  const errorIndex = Math.floor(random(cellSeed + '-error') * ERROR_MESSAGES.length);
  const displayValue = isBroken && errorProgress > 0.5 ? ERROR_MESSAGES[errorIndex] : value;

  // Background: green → red → black
  const redBg = isBroken ? errorProgress * 0.6 : 0;
  const blackBg = blackoutProgress * 0.9;

  // Text color: normal → red → fades to dark
  const textOpacity = interpolate(blackoutProgress, [0.3, 0.8], [1, 0.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const isNumeric = !isHeader && cellIndex > 0;
  const isTotals = rowIndex === SPREADSHEET_DATA.length - 1;
  const isName = cellIndex === 0 && !isHeader;

  return (
    <div
      style={{
        padding: '10px 10px',
        fontSize: isHeader ? 12 : 14,
        fontWeight: isHeader || isTotals ? 700 : 500,
        fontFamily: isNumeric || isBroken ? FONTS.mono : FONTS.system,
        color: isBroken && errorProgress > 0.5
          ? COLORS.error
          : isHeader
          ? COLORS.text
          : COLORS.textMuted,
        opacity: textOpacity,
        backgroundColor: blackBg > redBg
          ? `rgba(0, 0, 0, ${blackBg})`
          : `rgba(254, 226, 226, ${redBg})`,
        textAlign: isName ? 'left' : isNumeric ? 'right' : 'center',
        textTransform: isHeader ? 'uppercase' : 'none',
        letterSpacing: isHeader ? '0.08em' : 'normal',
        borderRight: cellIndex < 5 ? `1px solid ${COLORS.gridBorderLight}` : 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        transition: 'background-color 0.15s ease',
      }}
    >
      {displayValue}
    </div>
  );
};

export default SpreadsheetChaos;
