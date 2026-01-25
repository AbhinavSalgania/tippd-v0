// ============================================
// MOCK DATA FOR TIPPD VIDEO
// Realistic restaurant tip distribution data
// ============================================

export interface ShiftSummary {
  netTips: number;
  tipRate: number;
  totalSales: number;
  shiftType: 'lunch' | 'dinner';
  date: string;
  staffCount: number;
}

export interface Employee {
  id: string;
  name: string;
  role: 'Server' | 'Bartender' | 'Busser' | 'Host';
  sales: number;
  tipsCollected: number;
  tipOuts: number;
  netPayout: number;
  hoursWorked: number;
}

export interface PainPoint {
  id: number;
  text: string;
  icon: 'spreadsheet' | 'clock' | 'argument' | 'error' | 'trust';
}

// Primary shift summary for the video
export const shiftSummary: ShiftSummary = {
  netTips: 256.43,
  tipRate: 18.5,
  totalSales: 1450.0,
  shiftType: 'dinner',
  date: 'Fri, Jan 24',
  staffCount: 5,
};

// Employee data - realistic busy restaurant dinner shift
export const employees: Employee[] = [
  {
    id: 'emp-001',
    name: 'Sarah M.',
    role: 'Server',
    sales: 892.5,
    tipsCollected: 178.5,
    tipOuts: 22.31,
    netPayout: 156.19,
    hoursWorked: 6.5,
  },
  {
    id: 'emp-002',
    name: 'Mike T.',
    role: 'Server',
    sales: 756.0,
    tipsCollected: 151.2,
    tipOuts: 18.9,
    netPayout: 132.3,
    hoursWorked: 6.0,
  },
  {
    id: 'emp-003',
    name: 'Jake R.',
    role: 'Bartender',
    sales: 1204.0,
    tipsCollected: 241.0,
    tipOuts: 0,
    netPayout: 89.47,
    hoursWorked: 7.0,
  },
  {
    id: 'emp-004',
    name: 'Emma L.',
    role: 'Server',
    sales: 634.25,
    tipsCollected: 127.85,
    tipOuts: 15.86,
    netPayout: 111.99,
    hoursWorked: 5.5,
  },
  {
    id: 'emp-005',
    name: 'Chris D.',
    role: 'Busser',
    sales: 0,
    tipsCollected: 0,
    tipOuts: 0,
    netPayout: 45.62,
    hoursWorked: 6.0,
  },
];

// Pain points for the "Problem" scene
export const painPoints: PainPoint[] = [
  {
    id: 1,
    text: 'Spreadsheets break every shift',
    icon: 'spreadsheet',
  },
  {
    id: 2,
    text: '45+ minutes calculating tips',
    icon: 'clock',
  },
  {
    id: 3,
    text: 'Staff disputes over payouts',
    icon: 'argument',
  },
  {
    id: 4,
    text: 'Formula errors go unnoticed',
    icon: 'error',
  },
  {
    id: 5,
    text: 'No audit trail for compliance',
    icon: 'trust',
  },
];

// Stats for the solution scene
export const solutionStats = [
  { value: '90%', label: 'Time Saved' },
  { value: '2 min', label: 'Per Shift' },
  { value: '100%', label: 'Accurate' },
];

// Recent shifts for dashboard display
export const recentShifts = [
  { date: 'Fri, Jan 24', type: 'Dinner', amount: 156.19, tipRate: 21.5 },
  { date: 'Thu, Jan 23', type: 'Dinner', amount: 142.75, tipRate: 19.8 },
  { date: 'Wed, Jan 22', type: 'Lunch', amount: 89.32, tipRate: 18.2 },
  { date: 'Tue, Jan 21', type: 'Dinner', amount: 167.5, tipRate: 22.1 },
];

// Tip breakdown for detailed view
export const tipBreakdown = {
  beforeTipOuts: {
    salesTotal: 892.5,
    tipsCollected: 178.5,
    tipRate: 20.0,
  },
  tipOuts: {
    kitchen: 17.85,
    bartender: 4.46,
  },
  afterTipOuts: {
    netTips: 156.19,
    netTipRate: 17.5,
  },
};

// Integration partners
export const integrations = ['Toast', 'Square', 'Clover', 'Lightspeed'];

// Formatting utilities
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const formatPercent = (rate: number): string => {
  return `${rate.toFixed(1)}%`;
};
