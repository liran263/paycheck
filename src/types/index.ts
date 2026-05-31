export interface User {
  id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  defaultHourlyWage: number;
  defaultOvertimePercentage: number;
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
  autoBreakMinutes: number;
  paymentCycleStartDate: number; // Day of the month (1-31)
  remindersEnabled: boolean;
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
