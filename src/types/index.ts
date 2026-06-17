export interface User {
  id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  defaultHourlyWage: number;
  defaultOvertimePercentage: number;
  role?: string; // Audited user role
  createdAt?: string; // Audited creation timestamp
}

export interface Job {
  id: string;
  userId: string;
  jobName: string;
  employerName: string;
  hourlyWage: number;
  overtimeStartsAfterHours: number;
  overtimePercentage: number;
  travelExpenses: number;
  travelMode: 'per_shift' | 'per_month' | 'disabled'; // How travel is calculated
  autoBreakMinutes: number;
  paymentCycleStartDate: number; // Day of the month (1-31)
  remindersEnabled: boolean;
  createdAt?: string; // Audited creation timestamp
}

export type ShiftStatus = 'planned' | 'completed' | 'paid';

export interface Shift {
  id: string;
  jobId: string;
  status: ShiftStatus;
  startDateTime: string; // ISO String
  endDateTime: string; // ISO String
  breakMinutes: number;
  bonuses: number;
  notes?: string;
  createdAt?: string; // Audited creation timestamp
}

export interface MonthlySummary {
  jobId: string;
  month: string; // YYYY-MM
  totalHours: number;
  overtimeHours: number;
  totalBonuses: number;
  totalPay: number;
  shiftCount: number;
}
