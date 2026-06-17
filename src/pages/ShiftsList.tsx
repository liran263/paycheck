import { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateShift } from '../data/mock-data';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { BottomNav } from '../components/ui/BottomNav';
import { useTranslations } from '../i18n/translations';
import { useAppSettings } from '../context/AppContext';
import { useData } from '../context/DataContext';
import type { Shift, Job } from '../types';

export const ShiftsList: FC = () => {
  const navigate = useNavigate();
  const t = useTranslations();
  const sl = t.shiftsList;
  const nav = t.nav;
  const { language } = useAppSettings();
  
  const { jobs, shifts: allShifts, deleteShift } = useData();
  
  // Helper to find job info for a shift
  const getJobForShift = (shift: Shift): Job | undefined => {
    return jobs.find(j => j.id === shift.jobId);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);

  const confirmDeleteShift = () => {
    if (!shiftToDelete) return;
    deleteShift(shiftToDelete);
    setShiftToDelete(null);
  };

  // Filter state (synchronized with active job selection in localStorage)
  const [selectedJobId] = useState<string>(() => {
    const active = localStorage.getItem('paycheck_active_job_id');
    return active || 'all';
  });

  const activeJob = jobs.find(j => j.id === selectedJobId);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const ms = Array.from(new Set(allShifts.map(s => s.startDateTime.substring(0, 7)))).sort();
    if (ms.length > 0) {
      return ms[ms.length - 1];
    }
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  });

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${yyyy}-${mm}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${yyyy}-${mm}`);
  };

  const getMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthIdx = parseInt(month, 10) - 1;
    const monthsHebrew = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    const monthsEnglish = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthsNames = language === 'he' ? monthsHebrew : monthsEnglish;
    return `${monthsNames[monthIdx]} ${year}`;
  };

  // Filter and sort shifts (newest first)
  const filteredShifts = allShifts
    .filter(s => (selectedJobId === 'all' || s.jobId === selectedJobId) && s.startDateTime.startsWith(selectedMonth))
    .sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());

  // Compute monthly summary totals for the active selection
  const completedShifts = filteredShifts.filter(s => s.status === 'completed');
  
  let totalHours = 0;
  let overtimeHours = 0;
  let totalBonuses = 0;
  let totalPay = 0;

  const summaryRows = completedShifts.map(shift => {
    const job = getJobForShift(shift);
    const calc = job ? calculateShift(shift, job) : { netHours: 0, overtimeHours: 0, totalPay: 0 };
    totalHours += calc.netHours;
    overtimeHours += calc.overtimeHours;
    totalBonuses += (shift.bonuses || 0);
    totalPay += calc.totalPay;
    return { shift, calc, job };
  });

  const totalHoursWhole = Math.floor(totalHours);
  const totalMinutesRem = Math.round((totalHours - totalHoursWhole) * 60);
  const totalHoursFormatted = `${totalHoursWhole}:${totalMinutesRem.toString().padStart(2, '0')}`;

  // Date formatting helpers
  const getFormattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (language === 'he') {
      const daysOfWeek = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
      const monthsHebrew = [
        'ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני',
        'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'
      ];
      return `${daysOfWeek[date.getDay()]}, ${date.getDate()} ${monthsHebrew[date.getMonth()]}`;
    } else {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthsEnglish = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return `${daysOfWeek[date.getDay()]}, ${monthsEnglish[date.getMonth()]} ${date.getDate()}`;
    }
  };

  const getFormattedTimeRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}`;
  };

  const getShiftTotalHours = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    let diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) diffMs += 24 * 60 * 60 * 1000;
    return (diffMs / (1000 * 60 * 60)).toFixed(1);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f9f9ff] page-bg font-display overflow-x-hidden pb-36" dir={language === 'he' ? 'rtl' : 'ltr'}>
      
      {/* Custom Header forcing LTR so Edit is always Left and Plus is always Right */}
      <header dir="ltr" className="flex items-center justify-between p-4 pb-2 bg-background-light dark:bg-background-dark sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800 w-full">
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center justify-center cursor-pointer px-3 py-1.5 rounded-lg text-sm font-bold transition-all active:scale-95 ${
            isEditing
              ? 'text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30'
              : 'text-primary bg-primary/10 hover:bg-primary/15'
          }`}
          aria-label="Edit shifts"
        >
          {isEditing
            ? (language === 'he' ? 'סיום' : 'Done')
            : (language === 'he' ? 'עריכה' : 'Edit')}
        </button>

        {/* Center: Title */}
        <h1 className="text-text-light dark:text-text-dark text-xl font-bold leading-tight tracking-[-0.015em] text-center flex-1">
          {language === 'he' ? 'משמרות' : 'Shifts'}
        </h1>

        {/* Right: Plus button */}
        <button
          type="button"
          onClick={() => navigate('/add-shift')}
          className="text-primary flex size-12 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Add shift"
        >
          <Icon name="add" size="3xl" />
        </button>
      </header>

      <main className="flex-grow p-4">
        
        {/* Month selector with modern card design */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="bg-white dark:bg-[#131D35] card-component rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            {/* Right Arrow (Previous Month) */}
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-[#f1f3fe] dark:bg-[#1A2545] hover:bg-primary/10 dark:hover:bg-primary/20 text-primary active:scale-95 transition-all cursor-pointer flex items-center justify-center bg-transparent border-0"
              aria-label="Previous Month"
            >
              <Icon name={language === 'he' ? 'chevron_right' : 'chevron_left'} size="xl" />
            </button>

            {/* Month Label */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mb-0.5">
                {activeJob ? activeJob.jobName : (language === 'he' ? 'חודש' : 'Month')}
              </span>
              <span className="text-base font-extrabold text-text-light dark:text-text-dark select-none">
                {getMonthLabel(selectedMonth)}
              </span>
            </div>

            {/* Left Arrow (Next Month) */}
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-[#f1f3fe] dark:bg-[#1A2545] hover:bg-primary/10 dark:hover:bg-primary/20 text-primary active:scale-95 transition-all cursor-pointer flex items-center justify-center bg-transparent border-0"
              aria-label="Next Month"
            >
              <Icon name={language === 'he' ? 'chevron_left' : 'chevron_right'} size="xl" />
            </button>
          </div>
        </div>

        {/* Shift Cards */}
        {filteredShifts.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Icon name="event_busy" size="4xl" className="mb-2 text-zinc-400" />
            <p className="text-lg font-bold">{sl.noShifts}</p>
            <p className="text-sm">{sl.noShiftsDesc}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredShifts.map((shift) => {
              const job = getJobForShift(shift);
              if (!job) return null;

              const { netHours, totalPay } = calculateShift(shift, job);
              const totalHoursRaw = parseFloat(getShiftTotalHours(shift.startDateTime, shift.endDateTime));
              
              // Format net hours as H:MM (e.g. 7:30)
              const netHoursWhole = Math.floor(netHours);
              const netMinutesRem = Math.round((netHours - netHoursWhole) * 60);
              const netHoursFormatted = `${netHoursWhole}:${netMinutesRem.toString().padStart(2, '0')}`;

              const isLongShift = shift.notes ? shift.notes.trim() === 'משמרת ארוכה' : false;
              const noteText = shift.notes
                ? (isLongShift && language === 'en' ? 'Long shift' : shift.notes)
                : '';

              return (
                <div key={shift.id} className="relative w-full rounded-2xl overflow-hidden">
                  {/* Delete Button (rendered behind the card) */}
                  <button
                    type="button"
                    onClick={() => setShiftToDelete(shift.id)}
                    className={`absolute right-0 top-0 bottom-0 w-16 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition-all duration-300 ${
                      isEditing ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
                    }`}
                    style={{ borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem' }}
                  >
                    <Icon name="delete" size="2xl" />
                  </button>

                  {/* Shift Card */}
                  <div
                    className="relative z-10 transition-transform duration-300 ease-out w-full"
                    style={{
                      transform: isEditing ? 'translateX(-64px)' : 'translateX(0)',
                    }}
                  >
                    <Card 
                      padding="lg"
                      className="flex flex-col items-center justify-center text-center gap-4 hover:scale-[1.01] transition-all"
                    >
                      {/* Job and Date Header */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full text-primary font-bold text-xs">
                          {job.jobName}{job.employerName && job.employerName !== 'עצמאי' ? ` (${job.employerName})` : ''}
                        </span>
                        <h3 className="font-extrabold text-xl text-text-light dark:text-text-dark mt-1">
                          {getFormattedDate(shift.startDateTime)}
                        </h3>
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-sm">
                          <Icon name="schedule" size="sm" className="text-zinc-400" />
                          <span>{getFormattedTimeRange(shift.startDateTime, shift.endDateTime)}</span>
                        </div>
                      </div>

                      {/* Main Centered Gross Pay */}
                      <div className="flex flex-col items-center border-y border-gray-100 dark:border-gray-800 w-full py-4 my-1">
                        <span className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">
                          {sl.grossPay}
                        </span>
                        <span className="font-black text-4xl text-primary tracking-tight">
                          ₪{totalPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mt-1.5">
                          {totalHoursRaw.toFixed(1)} {sl.hours}{shift.breakMinutes > 0 ? ` (${netHoursFormatted} ${sl.net})` : ''}
                        </span>
                      </div>

                      {/* Secondary Details */}
                      <div className="flex gap-6 justify-center text-sm">
                        <div className="text-center">
                          <p className="text-zinc-400 text-xs mb-0.5">{sl.entryTime}</p>
                          <p className="font-bold text-text-light dark:text-text-dark">{getFormattedTimeRange(shift.startDateTime, shift.endDateTime).split(' - ')[0]}</p>
                        </div>
                        {shift.breakMinutes > 0 && (
                          <div className="text-center">
                            <p className="text-zinc-400 text-xs mb-0.5">{sl.breakTime}</p>
                            <p className="font-bold text-text-light dark:text-text-dark">{shift.breakMinutes} {sl.min}</p>
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-zinc-400 text-xs mb-0.5">{sl.exitTime}</p>
                          <p className="font-bold text-text-light dark:text-text-dark">{getFormattedTimeRange(shift.startDateTime, shift.endDateTime).split(' - ')[1]}</p>
                        </div>
                      </div>

                      {shift.notes && (
                        <div className={`
                          w-full mt-1.5 p-2.5 rounded-lg text-xs font-semibold border-r-2
                          ${isLongShift
                            ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300 border-amber-500'
                            : 'bg-gray-50 dark:bg-gray-800/40 text-zinc-600 dark:text-zinc-400 border-primary'}
                        `}>
                          {noteText}
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Cyan Bar & Expandable Bottom Drawer */}
      <div 
        className="fixed bg-white dark:bg-[#131D35] border border-gray-200 dark:border-gray-800 transition-all duration-300 ease-out z-40"
        style={{
          bottom: '64px',
          height: isDrawerOpen ? 'calc(100vh - 140px)' : '56px',
          left: 'max(2rem, calc((100vw - 1280px) / 2 + 2rem))',
          right: 'max(2rem, calc((100vw - 1280px) / 2 + 2rem))',
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Blue Header Bar */}
        <div 
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="bg-primary hover:bg-primary/95 text-white px-6 py-3.5 flex items-center justify-center cursor-pointer select-none"
          style={{
            borderTopLeftRadius: '1.5rem',
            borderTopRightRadius: '1.5rem',
          }}
          dir="ltr"
        >
          <div className="flex items-center justify-between w-full max-w-md">
            {/* Pay (Left) */}
            <span className="font-extrabold text-base" dir="ltr">
              ₪ {totalPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>

            {/* Chevron (Center) */}
            <Icon name={isDrawerOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up'} className="text-white font-bold" size="2xl" />

            {/* Hours (Right) */}
            <span className="font-extrabold text-base">
              {totalHoursFormatted} שעות
            </span>
          </div>
        </div>

        {/* Scrollable Drawer Content */}
        {isDrawerOpen && (
          <div className="overflow-y-auto h-[calc(100%-56px)] p-4 pb-16 space-y-5">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              {/* Total Hours */}
              <div className="bg-[#f1f3fe] dark:bg-[#1A2545] rounded-xl p-4 flex flex-col justify-between h-24 border border-gray-100 dark:border-[#1E2D50]">
                <div className="flex items-center gap-1.5 text-primary">
                  <Icon name="schedule" size="sm" />
                  <span className="text-xs font-bold">{language === 'he' ? 'סה"כ שעות' : 'Total Hours'}</span>
                </div>
                <div className="text-2xl font-black text-text-light dark:text-text-dark">
                  {totalHours.toFixed(1)}
                </div>
              </div>

              {/* Overtime */}
              <div className="bg-[#f1f3fe] dark:bg-[#1A2545] rounded-xl p-4 flex flex-col justify-between h-24 border border-gray-100 dark:border-[#1E2D50]">
                <div className="flex items-center gap-1.5 text-primary">
                  <Icon name="history" size="sm" />
                  <span className="text-xs font-bold">{language === 'he' ? 'שעות נוספות' : 'Overtime'}</span>
                </div>
                <div className="text-2xl font-black text-text-light dark:text-text-dark">
                  {overtimeHours.toFixed(1)}
                </div>
              </div>

              {/* Bonuses */}
              <div className="bg-[#f1f3fe] dark:bg-[#1A2545] rounded-xl p-4 flex flex-col justify-between h-24 border border-gray-100 dark:border-[#1E2D50]">
                <div className="flex items-center gap-1.5 text-primary">
                  <Icon name="card_giftcard" size="sm" />
                  <span className="text-xs font-bold">{language === 'he' ? 'בונוסים' : 'Bonuses'}</span>
                </div>
                <div className="text-2xl font-black text-text-light dark:text-text-dark">
                  ₪{totalBonuses.toLocaleString()}
                </div>
              </div>

              {/* Total Pay */}
              <div className="bg-[#f1f3fe] dark:bg-[#1A2545] rounded-xl p-4 flex flex-col justify-between h-24 border border-gray-100 dark:border-[#1E2D50]">
                <div className="flex items-center gap-1.5 text-primary">
                  <Icon name="payments" size="sm" />
                  <span className="text-xs font-bold">{language === 'he' ? 'שכר ברוטו' : 'Gross Pay'}</span>
                </div>
                <div className="text-2xl font-black text-text-light dark:text-text-dark">
                  ₪{totalPay.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            {/* Detailed Shifts Table */}
            {summaryRows.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 bg-[#f9f9ff] dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-gray-800">
                <Icon name="event_busy" size="3xl" className="mb-1 block text-zinc-400" />
                <p className="font-semibold text-sm">{language === 'he' ? 'אין משמרות בתקופה זו' : 'No shifts in this period'}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#131D35] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f1f3fe] dark:bg-[#1A2545] text-primary border-b border-gray-100 dark:border-[#1E2D50]">
                      <th className="p-2.5 font-bold">{language === 'he' ? 'תאריך' : 'Date'}</th>
                      <th className="p-2.5 font-bold">{language === 'he' ? 'התחלה' : 'Start'}</th>
                      <th className="p-2.5 font-bold">{language === 'he' ? 'סיום' : 'End'}</th>
                      <th className="p-2.5 font-bold text-center">{language === 'he' ? 'נטו' : 'Net'}</th>
                      <th className="p-2.5 font-bold text-center">{language === 'he' ? 'שכר' : 'Pay'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/40">
                    {summaryRows.map(({ shift, calc }) => {
                      const pad = (n: number) => n.toString().padStart(2, '0');
                      const formatTime = (dateStr: string) => {
                        const d = new Date(dateStr);
                        return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
                      };
                      const formatShortDate = (dateStr: string) => {
                        const d = new Date(dateStr);
                        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear().toString().substring(2)}`;
                      };
                      const getShiftHoursFormatted = (nh: number) => {
                        const h = Math.floor(nh);
                        const m = Math.round((nh - h) * 60);
                        return `${h}:${pad(m)}`;
                      };

                      return (
                        <tr key={shift.id} className="hover:bg-[#f9f9ff] dark:hover:bg-[#1A2545]/20 transition-colors">
                          <td className="p-2.5 font-semibold text-text-light dark:text-text-dark">
                            {formatShortDate(shift.startDateTime)}
                          </td>
                          <td className="p-2.5 text-zinc-500 dark:text-zinc-400">
                            {formatTime(shift.startDateTime)}
                          </td>
                          <td className="p-2.5 text-zinc-500 dark:text-zinc-400">
                            {formatTime(shift.endDateTime)}
                          </td>
                          <td className="p-2.5 font-bold text-center text-primary">
                            {getShiftHoursFormatted(calc.netHours)}
                          </td>
                          <td className="p-2.5 font-bold text-center text-primary">
                            ₪{calc.totalPay.toFixed(0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wrapping the BottomNav with a wrapper to fix it perfectly to bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav 
          items={[
            { id: '2', icon: 'list_alt', label: nav.shifts, active: true, onClick: () => navigate('/shifts') },
            { id: '3', icon: 'track_changes', label: nav.live, onClick: () => navigate('/now') },
            { id: '1', icon: 'work', label: nav.home, active: false, onClick: () => navigate('/') },
            { id: '4', icon: 'settings', label: nav.settings, onClick: () => navigate('/settings') },
          ]}
        />
      </div>

      {/* Confirmation Modal */}
      {shiftToDelete && (
        <div className="fixed inset-0 bg-black/55 z-55 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131D35] w-full max-w-sm rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-[#1E2D50] flex flex-col gap-4 text-center">
            <Icon name="warning" className="text-amber-500 mx-auto" size="4xl" />
            <h4 className="text-lg font-bold text-text-light dark:text-text-dark">
              {language === 'he' ? 'מחיקת משמרת' : 'Delete Shift'}
            </h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {language === 'he' 
                ? 'האם אתה בטוח שברצונך למחוק את המשמרת הזו? פעולה זו אינה הפיכה!' 
                : 'Are you sure you want to delete this shift? This action is irreversible!'}
            </p>
            
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShiftToDelete(null)}
                className="flex-1 py-3 bg-gray-100 dark:bg-[#1A2545] text-text-light dark:text-text-dark font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all cursor-pointer border-0"
              >
                {language === 'he' ? 'ביטול' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmDeleteShift}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all cursor-pointer shadow-md border-0"
              >
                {language === 'he' ? 'כן, מחק' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
