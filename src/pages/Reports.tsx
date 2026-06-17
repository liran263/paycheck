import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateShift } from '../data/mock-data';
import { Icon } from '../components/ui/Icon';
import { Header } from '../components/ui/Header';
import { BottomNav } from '../components/ui/BottomNav';
import { useTranslations } from '../i18n/translations';
import { useAppSettings } from '../context/AppContext';
import { useData } from '../context/DataContext';
import type { Job, Shift } from '../types';

// ── helpers ────────────────────────────────────────────────────────────────────

function getMonthLabel(monthStr: string, monthNames: string[]): string {
  const [year, month] = monthStr.split('-');
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

function getAvailableMonths(shifts: Shift[]): { value: string; label: string }[] {
  const set = new Set<string>();
  shifts.forEach(s => set.add(s.startDateTime.substring(0, 7)));
  return Array.from(set)
    .sort((a, b) => b.localeCompare(a))
    .map(m => ({ value: m, label: m }));
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function getShiftNetHoursFormatted(netHours: number, hoursShort: string): string {
  const h = Math.floor(netHours);
  const m = Math.round((netHours - h) * 60);
  if (m === 0) return `${h} ${hoursShort}`;
  return `${h}:${pad(m)} ${hoursShort}`;
}

// ── component ──────────────────────────────────────────────────────────────────

export const Reports: FC = () => {
  const navigate = useNavigate();
  const t = useTranslations();
  const r = t.reports;
  const nav = t.nav;
  const months = t.months;
  const { language } = useAppSettings();

  const { jobs, shifts: allShifts } = useData();

  const [selectedJobId, setSelectedJobIdState] = useState<string>(() => {
    return localStorage.getItem('paycheck_active_job_id') || '';
  });

  useEffect(() => {
    const active = localStorage.getItem('paycheck_active_job_id');
    if (active && jobs.some(j => j.id === active)) {
      setSelectedJobIdState(active);
    } else if (jobs.length > 0) {
      setSelectedJobIdState(jobs[0].id);
      localStorage.setItem('paycheck_active_job_id', jobs[0].id);
    }
  }, [jobs]);

  const setSelectedJobId = (id: string) => {
    setSelectedJobIdState(id);
    localStorage.setItem('paycheck_active_job_id', id);
  };

  const selectedJob: Job | undefined = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const jobShifts = allShifts.filter(s => s.jobId === selectedJobId);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  });

  useEffect(() => {
    if (!selectedJobId) return;
    const jobShifts = allShifts.filter(s => s.jobId === selectedJobId);
    const ms = getAvailableMonths(jobShifts);
    if (ms.length > 0) {
      setSelectedMonth(ms[0].value);
    }
  }, [selectedJobId, allShifts]);

  const handlePrevMonth = () => {
    if (!selectedMonth) return;
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${yyyy}-${mm}`);
  };

  const handleNextMonth = () => {
    if (!selectedMonth) return;
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${yyyy}-${mm}`);
  };

  const monthShifts = jobShifts.filter(
    s => s.startDateTime.startsWith(selectedMonth) && s.status === 'completed'
  );

  // Aggregate stats
  let totalHours = 0;
  let overtimeHours = 0;
  let totalBonuses = 0;
  let totalPay = 0;

  const shiftRows = monthShifts.map(shift => {
    const calc = selectedJob ? calculateShift(shift, selectedJob) : { netHours: 0, overtimeHours: 0, totalPay: 0 };
    totalHours += calc.netHours;
    overtimeHours += calc.overtimeHours;
    totalBonuses += (shift.bonuses || 0);
    totalPay += calc.totalPay;
    return { shift, calc };
  });

  // Handle job change – reset month to first available
  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    const ms = getAvailableMonths(allShifts.filter(s => s.jobId === jobId)).map(m => ({
      ...m,
      label: getMonthLabel(m.value, months),
    }));
    if (ms.length > 0) {
      setSelectedMonth(ms[0].value);
    } else {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      setSelectedMonth(`${yyyy}-${mm}`);
    }
  };

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-[#f9f9ff] page-bg font-display overflow-x-hidden pb-24"
      dir={language === 'he' ? 'rtl' : 'ltr'}
      style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}
    >
      {/* ── Header ── */}
      <Header title={r.title} />

      <main className="flex-grow p-4 space-y-5">

        {/* ── Filter Card ── */}
        <section className="bg-white dark:bg-[#131D35] card-component rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
          {/* Job Selector Grid Cell */}
          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <span className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pr-1">
              {r.selectJob}
            </span>
            <div className="relative">
              <select
                value={selectedJobId}
                onChange={e => handleJobChange(e.target.value)}
                className="w-full bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 appearance-none focus:ring-2 focus:ring-primary focus:border-primary text-sm font-bold text-text-light dark:text-text-dark cursor-pointer"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.jobName}{j.employerName && j.employerName !== 'עצמאי' ? ` – ${j.employerName}` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 rtl:left-3 ltr:right-3 flex items-center pointer-events-none">
                <Icon name="expand_more" className="text-zinc-400" />
              </div>
            </div>
          </div>

          {/* Month Navigation Grid Cell */}
          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <span className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pr-1">
              {r.selectMonth}
            </span>
            <div className="flex items-center justify-between bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-xl p-1 h-[46px] shadow-sm">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="h-9 w-9 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center bg-transparent border-0"
                aria-label="Previous Month"
              >
                <Icon name={language === 'he' ? 'chevron_right' : 'chevron_left'} size="lg" />
              </button>
              <span className="text-sm font-bold text-text-light dark:text-text-dark select-none">
                {selectedMonth ? getMonthLabel(selectedMonth, months) : ''}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="h-9 w-9 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center bg-transparent border-0"
                aria-label="Next Month"
              >
                <Icon name={language === 'he' ? 'chevron_left' : 'chevron_right'} size="lg" />
              </button>
            </div>
          </div>
        </section>

        {/* ── Stats Grid ── */}
        <section className="grid grid-cols-2 gap-3">
          {/* Total Hours */}
          <div className="bg-[#f1f3fe] surface-panel rounded-xl p-4 flex flex-col justify-between h-28 border border-gray-100">
            <div className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              <span className="text-sm font-semibold">{r.totalHours}</span>
            </div>
            <div className="text-3xl font-extrabold text-text-light">
              {totalHours.toFixed(1)}
            </div>
          </div>

          {/* Overtime */}
          <div className="bg-[#f1f3fe] surface-panel rounded-xl p-4 flex flex-col justify-between h-28 border border-gray-100">
            <div className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span className="text-sm font-semibold">{r.overtime}</span>
            </div>
            <div className="text-3xl font-extrabold text-text-light">
              {overtimeHours.toFixed(1)}
            </div>
          </div>

          {/* Total Pay – highlighted blue */}
          <div className="bg-primary rounded-xl p-4 flex flex-col justify-between h-28 shadow-lg shadow-primary/20 text-white">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span className="text-sm font-semibold">{r.totalPay}</span>
            </div>
            <div className="text-3xl font-extrabold">
              ₪{totalPay.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>

          {/* Bonuses */}
          <div className="bg-[#f1f3fe] surface-panel rounded-xl p-4 flex flex-col justify-between h-28 border border-gray-100">
            <div className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[18px]">card_giftcard</span>
              <span className="text-sm font-semibold">{r.bonuses}</span>
            </div>
            <div className="text-3xl font-extrabold text-text-light">
              ₪{totalBonuses.toLocaleString()}
            </div>
          </div>
        </section>

        {/* ── Shift Detail Table ── */}
        {shiftRows.length === 0 ? (
          <div className="text-center py-10 text-zinc-400 bg-white card-component rounded-xl shadow-sm border border-gray-100">
            <span className="material-symbols-outlined text-5xl mb-2 block">event_busy</span>
            <p className="font-semibold">{r.noData}</p>
          </div>
        ) : (
          <section className="bg-white card-component rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#f1f3fe] surface-panel text-primary text-sm border-b border-gray-100">
                  <th className="p-3.5 font-bold">{r.date}</th>
                  <th className="p-3.5 font-bold">{r.start}</th>
                  <th className="p-3.5 font-bold">{r.end}</th>
                  <th className="p-3.5 font-bold text-center">{r.netHours}</th>
                  <th className="p-3.5 font-bold text-center">{r.pay}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shiftRows.map(({ shift, calc }) => (
                  <tr key={shift.id} className="hover:bg-[#f9f9ff] transition-colors">
                    <td className="p-3.5 text-sm font-semibold text-text-light">
                      {formatShortDate(shift.startDateTime)}
                    </td>
                    <td className="p-3.5 text-sm text-zinc-400">
                      {formatTime(shift.startDateTime)}
                    </td>
                    <td className="p-3.5 text-sm text-zinc-400">
                      {formatTime(shift.endDateTime)}
                    </td>
                    <td className="p-3.5 text-sm font-extrabold text-center text-primary">
                      {getShiftNetHoursFormatted(calc.netHours, r.hoursShort)}
                    </td>
                    <td className="p-3.5 text-sm font-extrabold text-center text-primary">
                      ₪{calc.totalPay.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Footer row – totals */}
              <tfoot>
                <tr className="bg-[#f1f3fe] surface-panel border-t border-gray-200 font-extrabold text-sm text-text-light">
                  <td className="p-3.5 font-bold text-zinc-500" colSpan={3}>{r.monthTotal}</td>
                  <td className="p-3.5 text-center text-primary">
                    {getShiftNetHoursFormatted(totalHours, r.hoursShort)}
                  </td>
                  <td className="p-3.5 text-center text-primary">
                    ₪{totalPay.toFixed(0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>
        )}

      </main>

      {/* ── Bottom Navigation ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav
          items={[
            { id: '2', icon: 'list_alt', label: nav.shifts, onClick: () => navigate('/shifts') },
            { id: '3', icon: 'track_changes', label: nav.live, onClick: () => navigate('/now') },
            { id: '1', icon: 'work', label: nav.home, onClick: () => navigate('/') },
            { id: '4', icon: 'settings', label: nav.settings, onClick: () => navigate('/settings') },
          ]}
        />
      </div>
    </div>
  );
};
