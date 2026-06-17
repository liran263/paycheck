import type { Job, MonthlySummary, Shift, User } from '../types';

export const mockUser: User = {
  id: 'u1',
  name: 'ישראל ישראלי',
  email: 'israel@israeli.co.il',
  defaultHourlyWage: 45,
  defaultOvertimePercentage: 125,
};

export const initialJobs: Job[] = [
  {
    id: 'j1',
    userId: 'u1',
    jobName: 'ברמן קבוע',
    employerName: 'קפה נואר',
    hourlyWage: 55,
    overtimeStartsAfterHours: 8,
    overtimePercentage: 125,
    travelExpenses: 20,
    travelMode: 'per_shift',
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
    travelMode: 'disabled',
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
    travelMode: 'per_shift',
    autoBreakMinutes: 30,
    paymentCycleStartDate: 1,
    remindersEnabled: true,
  }
];

export const initialShifts: Shift[] = [
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

// LocalStorage Keys
const JOBS_KEY = 'paycheck_jobs';
const SHIFTS_KEY = 'paycheck_shifts';
const USER_KEY = 'paycheck_user';

// Helper to check if localStorage is available
const isBrowser = typeof window !== 'undefined';

export function getStoredUser(): User {
  if (!isBrowser) return mockUser;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) {
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    return mockUser;
  }
  try {
    const user = JSON.parse(stored) as User;
    if (user.profilePictureUrl === 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80') {
      user.profilePictureUrl = undefined;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    return user;
  } catch {
    return mockUser;
  }
}

export function saveStoredUser(user: User): void {
  if (!isBrowser) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredJobs(): Job[] {
  if (!isBrowser) return initialJobs;
  const stored = localStorage.getItem(JOBS_KEY);
  if (!stored) {
    localStorage.setItem(JOBS_KEY, JSON.stringify(initialJobs));
    return initialJobs;
  }
  try {
    const jobs = JSON.parse(stored);
    if (!Array.isArray(jobs)) return initialJobs;
    // Backward compat: ensure travelMode exists on old jobs
    return jobs.map(j => ({ ...j, travelMode: j.travelMode ?? ('per_shift' as const) }));
  } catch {
    return initialJobs;
  }
}

export function saveStoredJobs(jobs: Job[]): void {
  if (!isBrowser) return;
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

export function getStoredShifts(): Shift[] {
  if (!isBrowser) return initialShifts;
  const stored = localStorage.getItem(SHIFTS_KEY);
  if (!stored) {
    localStorage.setItem(SHIFTS_KEY, JSON.stringify(initialShifts));
    return initialShifts;
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : initialShifts;
  } catch {
    return initialShifts;
  }
}

export function saveStoredShifts(shifts: Shift[]): void {
  if (!isBrowser) return;
  localStorage.setItem(SHIFTS_KEY, JSON.stringify(shifts));
}

// Calculate shift net hours, overtime, and pay
export function calculateShift(
  shift: Shift,
  job: Job
): { netHours: number; overtimeHours: number; totalPay: number } {
  const start = new Date(shift.startDateTime);
  const end = new Date(shift.endDateTime);

  let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  if (totalMinutes <= 0) {
    totalMinutes += 24 * 60; // overnight shift
  }

  const netMinutes = totalMinutes - (shift.breakMinutes || 0);
  if (netMinutes <= 0) {
    return { netHours: 0, overtimeHours: 0, totalPay: 0 };
  }

  const netHours = netMinutes / 60;
  const overtimeHours = Math.max(0, netHours - job.overtimeStartsAfterHours);
  const regularHours = netHours - overtimeHours;

  const regularPay = regularHours * job.hourlyWage;
  const overtimePay = overtimeHours * job.hourlyWage * (job.overtimePercentage / 100);
  const totalPay = regularPay + overtimePay + (shift.bonuses || 0);

  return { netHours, overtimeHours, totalPay };
}

// Dynamically compute the monthly summary for a job and shifts list
export function getMonthlySummaryForJob(
  jobId: string,
  monthStr: string = '2023-11', // Defaulting to the mock data month for compatibility
  allJobs: Job[] = getStoredJobs(),
  allShifts: Shift[] = getStoredShifts()
): MonthlySummary {
  const job = allJobs.find(j => j.id === jobId) || allJobs[0] || initialJobs[0];
  const shifts = allShifts.filter(s => s.jobId === jobId && s.status === 'completed');

  // Filter shifts belonging to the specified month
  const monthShifts = shifts.filter(s => {
    // startDateTime format: '2023-11-01T09:00:00.000Z'
    return s.startDateTime && s.startDateTime.startsWith(monthStr);
  });

  let totalHours = 0;
  let overtimeHours = 0;
  let totalBonuses = 0;
  let totalPay = 0;

  monthShifts.forEach(shift => {
    const calc = calculateShift(shift, job);
    totalHours += calc.netHours;
    overtimeHours += calc.overtimeHours;
    totalBonuses += (shift.bonuses || 0);
    totalPay += calc.totalPay;
  });

  return {
    jobId,
    month: monthStr,
    totalHours: Number(totalHours.toFixed(1)),
    overtimeHours: Number(overtimeHours.toFixed(1)),
    totalBonuses,
    totalPay: Number(totalPay.toFixed(2)),
    shiftCount: monthShifts.length,
  };
}


// Deprecated mock exports for backwards compatibility
export const mockJobs = getStoredJobs();
export const mockShifts = getStoredShifts();
export const mockMonthlySummary: MonthlySummary[] = mockJobs.map(j => getMonthlySummaryForJob(j.id));
