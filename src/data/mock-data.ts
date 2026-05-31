import { Job, MonthlySummary, Shift, User } from '../types';

export const mockUser: User = {
  id: 'u1',
  name: 'ישראל ישראלי',
  email: 'israel@israeli.co.il',
  profilePictureUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
  defaultHourlyWage: 45,
  defaultOvertimePercentage: 125,
};

export const mockJobs: Job[] = [
  {
    id: 'j1',
    userId: 'u1',
    jobName: 'ברמן קבוע',
    employerName: 'קפה נואר',
    hourlyWage: 55,
    overtimeStartsAfterHours: 8,
    overtimePercentage: 125,
    travelExpenses: 20,
    autoBreakMinutes: 30,
    paymentCycleStartDate: 1,
    remindersEnabled: true,
  },
  {
    id: 'j2',
    userId: 'u1',
    jobName: 'מפתח/ת Full Stack',
    employerName: 'Wix',
    hourlyWage: 80,
    overtimeStartsAfterHours: 9,
    overtimePercentage: 125,
    travelExpenses: 0,
    autoBreakMinutes: 60,
    paymentCycleStartDate: 1,
    remindersEnabled: false,
  },
  {
    id: 'j3',
    userId: 'u1',
    jobName: 'מוכר/ת',
    employerName: 'קסטרו',
    hourlyWage: 35,
    overtimeStartsAfterHours: 8,
    overtimePercentage: 125,
    travelExpenses: 15,
    autoBreakMinutes: 30,
    paymentCycleStartDate: 1,
    remindersEnabled: true,
  }
];

export const mockShifts: Shift[] = [
  {
    id: 's1',
    jobId: 'j1',
    status: 'completed',
    startDateTime: '2023-11-01T09:00:00.000Z',
    endDateTime: '2023-11-01T17:00:00.000Z',
    breakMinutes: 30,
    bonuses: 0,
  },
  {
    id: 's2',
    jobId: 'j1',
    status: 'completed',
    startDateTime: '2023-11-02T09:05:00.000Z',
    endDateTime: '2023-11-02T17:35:00.000Z',
    breakMinutes: 30,
    bonuses: 20,
  },
  {
    id: 's3',
    jobId: 'j1',
    status: 'completed',
    startDateTime: '2023-11-03T08:58:00.000Z',
    endDateTime: '2023-11-03T18:02:00.000Z', // > 8 hours, has overtime
    breakMinutes: 30,
    bonuses: 0,
    notes: 'משמרת ארוכה',
  },
  {
    id: 's4',
    jobId: 'j1',
    status: 'planned',
    startDateTime: '2023-11-06T09:00:00.000Z',
    endDateTime: '2023-11-06T17:00:00.000Z',
    breakMinutes: 30,
    bonuses: 0,
  }
];

export const mockMonthlySummary: MonthlySummary[] = [
  {
    jobId: 'j1',
    month: '2023-11',
    totalHours: 172,
    overtimeHours: 12,
    totalBonuses: 500,
    totalPay: 12345,
    shiftCount: 22,
  },
  {
    jobId: 'j2',
    month: '2023-11',
    totalHours: 160,
    overtimeHours: 0,
    totalBonuses: 0,
    totalPay: 12800,
    shiftCount: 20,
  }
];
