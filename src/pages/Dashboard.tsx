<<<<<<< Updated upstream
import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMonthlySummaryForJob } from '../data/mock-data';
=======
// @ts-nocheck
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUser, mockJobs, mockMonthlySummary } from '../data/mock-data';
>>>>>>> Stashed changes
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { BottomNav } from '../components/ui/BottomNav';
import { Modal } from '../components/ui/Modal';
import { useTranslations } from '../i18n/translations';
import { useAppSettings } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const Dashboard: FC = () => {
  const navigate = useNavigate();
<<<<<<< Updated upstream
  const t = useTranslations();
  const { language } = useAppSettings();
  const d = t.dashboard;
  const nav = t.nav;
  
  const { jobs, shifts, updateJob } = useData();
=======
  const currentJob = mockJobs[0]; // Currently mocking the default selected job
  const currentSummary = mockMonthlySummary.find(s => s.jobId === currentJob.id);
>>>>>>> Stashed changes

  // State for current selection (synchronized via localStorage)
  const [selectedJobId, setSelectedJobIdState] = useState<string>(() => {
    return localStorage.getItem('paycheck_active_job_id') || '';
  });

  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  });

  // Keep selectedJobId synchronized and default to first job if none selected
  useEffect(() => {
    const active = localStorage.getItem('paycheck_active_job_id');
    if (active && jobs.some(j => j.id === active)) {
      setSelectedJobIdState(active);
    } else if (jobs.length > 0) {
      setSelectedJobIdState(jobs[0].id);
      localStorage.setItem('paycheck_active_job_id', jobs[0].id);
    }
  }, [jobs]);

  // Dynamically set current month based on the latest shift when selected job changes
  useEffect(() => {
    if (!selectedJobId) return;
    const jobShifts = shifts.filter(s => s.jobId === selectedJobId && s.status === 'completed');
    if (jobShifts.length > 0) {
      const sorted = jobShifts.map(s => s.startDateTime.substring(0, 7)).sort();
      setCurrentMonth(sorted[sorted.length - 1]);
    }
  }, [selectedJobId, shifts]);

  const setSelectedJobId = (id: string) => {
    setSelectedJobIdState(id);
    localStorage.setItem('paycheck_active_job_id', id);
    const jobShifts = shifts.filter(s => s.jobId === id && s.status === 'completed');
    if (jobShifts.length > 0) {
      const sorted = jobShifts.map(s => s.startDateTime.substring(0, 7)).sort();
      setCurrentMonth(sorted[sorted.length - 1]);
    }
  };

  // Active Job selection
  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const summary = getMonthlySummaryForJob(activeJob?.id || '', currentMonth, jobs, shifts);

  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${yyyy}-${mm}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const d = new Date(year, month, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${yyyy}-${mm}`);
  };

  const getMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthIdx = parseInt(month, 10) - 1;
    const monthsNames = t.months;
    return `${monthsNames[monthIdx]} ${year}`;
  };

  // UI state for dropdown and modals
  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState(false);
  const [isWageModalOpen, setIsWageModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isBreaksModalOpen, setIsBreaksModalOpen] = useState(false);
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);

  // Keypad inputs
  const [wageInput, setWageInput] = useState('');
  const [breaksInput, setBreaksInput] = useState('');
  const [travelInput, setTravelInput] = useState('');
  const [travelMode, setTravelMode] = useState<'per_shift' | 'per_month' | 'disabled'>('per_shift');
  const [cycleInput, setCycleInput] = useState('');

  // Overtime states
  const [otEnabled, setOtEnabled] = useState(true);
  const [otHours, setOtHours] = useState(8.0);
  const [otPercentage, setOtPercentage] = useState(125);

  const openWageModal = () => {
    if (!activeJob) return;
    setWageInput(activeJob.hourlyWage.toString());
    setIsWageModalOpen(true);
  };

  const saveWage = () => {
    const newWage = parseFloat(wageInput);
    if (!isNaN(newWage) && newWage > 0 && activeJob) {
      updateJob({ ...activeJob, hourlyWage: newWage });
    }
    setIsWageModalOpen(false);
  };

  const openOvertimeModal = () => {
    if (!activeJob) return;
    const currentOT = activeJob.overtimeStartsAfterHours;
    setOtEnabled(currentOT > 0);
    setOtHours(currentOT || 8.0);
    setOtPercentage(activeJob.overtimePercentage || 125);
    setIsOvertimeModalOpen(true);
  };

  const saveOvertime = () => {
    if (!activeJob) return;
    updateJob({
      ...activeJob,
      overtimeStartsAfterHours: otEnabled ? otHours : 0,
      overtimePercentage: otPercentage,
    });
    setIsOvertimeModalOpen(false);
  };

  const openBreaksModal = () => {
    if (!activeJob) return;
    setBreaksInput(activeJob.autoBreakMinutes.toString());
    setIsBreaksModalOpen(true);
  };

  const saveBreaks = () => {
    const newBreaks = parseFloat(breaksInput);
    if (!isNaN(newBreaks) && newBreaks >= 0 && activeJob) {
      updateJob({ ...activeJob, autoBreakMinutes: newBreaks });
    }
    setIsBreaksModalOpen(false);
  };

  const openTravelModal = () => {
    if (!activeJob) return;
    setTravelInput(activeJob.travelExpenses.toString());
    setTravelMode(activeJob.travelMode ?? 'per_shift');
    setIsTravelModalOpen(true);
  };

  const saveTravel = () => {
    const newTravel = parseFloat(travelInput);
    if (activeJob) {
      updateJob({
        ...activeJob,
        travelExpenses: isNaN(newTravel) ? 0 : newTravel,
        travelMode,
      });
    }
    setIsTravelModalOpen(false);
  };

  const openCycleModal = () => {
    if (!activeJob) return;
    setCycleInput(activeJob.paymentCycleStartDate.toString());
    setIsCycleModalOpen(true);
  };

  const saveCycle = () => {
    const newCycle = parseInt(cycleInput);
    if (!isNaN(newCycle) && newCycle >= 1 && newCycle <= 31 && activeJob) {
      updateJob({ ...activeJob, paymentCycleStartDate: newCycle });
    }
    setIsCycleModalOpen(false);
  };

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-[#f9f9ff] page-bg font-display overflow-x-hidden pb-24"
      dir={language === 'he' ? 'rtl' : 'ltr'}
    >  
      {/* Custom flex header to prevent overlap and support Add Job / Profile edit side-by-side */}
      <header className="flex items-center justify-between p-4 pb-2 bg-background-light dark:bg-background-dark sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
        {/* Right side (start side): Job Selector dropdown / Create Job */}
        <div className="relative flex items-center gap-2">
          {jobs.length === 0 ? null : (
            <>
              <button 
                onClick={() => setIsJobDropdownOpen(!isJobDropdownOpen)}
                className="flex items-center gap-1 text-primary cursor-pointer focus:outline-none"
              >
                <span className="text-xl font-bold leading-normal tracking-[0.015em]">{activeJob?.jobName || d.selectJob}</span>
                <Icon name="expand_more" />
              </button>
              <Badge variant="success">
                {language === 'he' ? 'פעיל' : 'Active'}
              </Badge>
              {isJobDropdownOpen && (
                <div className="absolute start-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-zinc-800 card-component border border-gray-200 dark:border-gray-700 z-30">
                  <div className="py-1" role="menu">
                    {jobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => {
                          setSelectedJobId(job.id);
                          setIsJobDropdownOpen(false);
                        }}
                        className="block w-full text-start px-4 py-2.5 text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                        role="menuitem"
                      >
                        {job.jobName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

<<<<<<< Updated upstream
        {/* Left side (end side): Three dots menu button */}
        {jobs.length > 0 && (
          <button 
            onClick={() => navigate('/manage-job')}
            className="text-primary flex size-10 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/40 rounded-full transition-colors"
            aria-label="Manage Job"
            title="ניהול עבודה"
          >
            <Icon name="more_vert" size="2xl" />
          </button>
        )}
      </header>

      <main className="flex-grow p-4 pb-24">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white dark:bg-zinc-800 rounded-3xl border border-dashed border-primary/40 shadow-sm gap-6 max-w-md mx-auto mt-8">
            <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-20 flex items-center justify-center">
              <Icon name="work_history" size="4xl" className="text-primary animate-pulse" />
=======
      <main className="flex-grow p-4 pb-24 /* Padding for bottom nav */">
        <div className="grid grid-cols-2 gap-4">
          
          {/* Add Shift Tile */}
          <div 
            onClick={() => navigate('/add-shift')}
            className="bg-primary text-white p-4 rounded-2xl aspect-square flex flex-col justify-between cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
          >
            <div>
              <div className="bg-white/20 rounded-full size-12 flex items-center justify-center">
                <Icon name="add" size="3xl" />
              </div>
>>>>>>> Stashed changes
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
                {language === 'he' ? 'אין עבודות פעילות' : 'No Active Jobs'}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-[280px]">
                {language === 'he' 
                  ? 'נראה שעדיין לא הגדרת אף עבודה. צור את העבודה הראשונה שלך כדי להתחיל לעקוב אחר המשמרות והשכר.'
                  : 'It looks like you haven\'t set up any jobs yet. Create your first job to start tracking shifts and wages.'}
              </p>
            </div>
            <Button
              onClick={() => navigate('/add-job')}
              variant="primary"
              className="px-8 shadow-md flex items-center gap-2"
            >
              <Icon name="add" />
              <span>{language === 'he' ? 'צור עבודה חדשה' : 'Create New Job'}</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            
            {/* Add Shift Tile */}
            <div
              onClick={() => navigate('/add-shift')}
              className="bg-primary text-white p-4 rounded-2xl aspect-square flex flex-col justify-between cursor-pointer hover:bg-primary/90 transition-colors shadow-sm active:scale-95"
            >
              <div>
                <div className="bg-white/20 rounded-full size-12 flex items-center justify-center">
                  <Icon name="add" size="3xl" />
                </div>
              </div>
              <p className="text-lg font-bold">{d.addShift}</p>
            </div>

            {/* Hourly Wage Tile */}
            <Card 
              onClick={openWageModal}
              padding="md" 
              className="rounded-2xl aspect-square flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all"
            >
              <div>
                <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-12 flex items-center justify-center">
                  <Icon name="payments" size="3xl" className="text-primary" />
                </div>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-normal">{d.hourlyWage}</p>
                <p className="text-lg font-bold text-text-light dark:text-text-dark">
                  ₪{activeJob ? activeJob.hourlyWage.toFixed(2) : '0.00'}
                </p>
              </div>
            </Card>

            {/* Overtime Tile */}
            <Card 
              onClick={openOvertimeModal}
              padding="md" 
              className="rounded-2xl aspect-square flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all"
            >
              <div>
                <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-12 flex items-center justify-center">
                  <Icon name="schedule" size="3xl" className="text-primary" />
                </div>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-normal">{d.overtime}</p>
                <p className="text-lg font-bold text-text-light dark:text-text-dark">
                  {activeJob && activeJob.overtimeStartsAfterHours > 0 
                    ? `${d.from}${activeJob.overtimeStartsAfterHours} ${d.hours}` 
                    : d.inactive}
                </p>
              </div>
            </Card>

            {/* Breaks Tile */}
            <Card 
              onClick={openBreaksModal}
              padding="md" 
              className="rounded-2xl aspect-square flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all"
            >
              <div>
                <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-12 flex items-center justify-center">
                  <Icon name="coffee" size="3xl" className="text-primary" />
                </div>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-normal">{d.autoBreak}</p>
                <p className="text-lg font-bold text-text-light dark:text-text-dark">{activeJob?.autoBreakMinutes || 0} {d.minutes}</p>
              </div>
            </Card>

            {/* Travel Expenses Tile */}
            <Card 
              onClick={openTravelModal}
              padding="md" 
              className="rounded-2xl aspect-square flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all"
            >
              <div>
                <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-12 flex items-center justify-center">
                  <Icon name="directions_car" size="3xl" className="text-primary" />
                </div>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-normal">{language === 'he' ? 'נסיעות' : 'Travel'}</p>
                <p className="text-lg font-bold text-text-light dark:text-text-dark">
                  {activeJob?.travelMode === 'disabled'
                    ? (language === 'he' ? 'לא פעיל' : 'Off')
                    : `₪${activeJob?.travelExpenses ?? 0} ${
                        activeJob?.travelMode === 'per_month'
                          ? (language === 'he' ? '/חודש' : '/mo')
                          : (language === 'he' ? '/משמרת' : '/shift')
                      }`}
                </p>
              </div>
            </Card>

            {/* Payment Cycle Tile */}
            <Card 
              onClick={openCycleModal}
              padding="md" 
              className="rounded-2xl aspect-square flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all"
            >
              <div>
                <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-12 flex items-center justify-center">
                  <Icon name="event_repeat" size="3xl" className="text-primary" />
                </div>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-normal">{language === 'he' ? 'תחילת חישוב' : 'Cycle Start'}</p>
                <p className="text-lg font-bold text-text-light dark:text-text-dark">{language === 'he' ? `יום ${activeJob?.paymentCycleStartDate ?? 1}` : `Day ${activeJob?.paymentCycleStartDate ?? 1}`}</p>
              </div>
            </Card>

            {/* Monthly Summary Wide Tile */}
            <Card 
              padding="md" 
              className="col-span-2 rounded-2xl flex flex-col justify-between cursor-pointer"
              onClick={() => navigate('/reports')}
            >
              <div className="flex items-center justify-between w-full border-b border-gray-100 dark:border-gray-800 pb-3" onClick={(e) => e.stopPropagation()}>
                {/* Right Arrow (Previous Month) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevMonth();
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-primary active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                  aria-label="Previous Month"
                >
                  <Icon name={language === 'he' ? 'chevron_right' : 'chevron_left'} size="2xl" />
                </button>

                {/* Center Month & Pay */}
                <div className="text-center flex flex-col items-center">
                  <span className="text-sm font-extrabold text-zinc-500 dark:text-zinc-400">
                    {getMonthLabel(currentMonth)}
                  </span>
                  <span className="text-2xl font-black text-primary tracking-tight mt-0.5">
                    ₪ {summary.totalPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Left Arrow (Next Month) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextMonth();
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-primary active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                  aria-label="Next Month"
                >
                  <Icon name={language === 'he' ? 'chevron_left' : 'chevron_right'} size="2xl" />
                </button>
              </div>

              <div className="flex justify-around text-center mt-4 text-text-light dark:text-text-dark">
                <div>
                  <p className="font-bold text-lg">{summary.shiftCount}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{d.shifts}</p>
                </div>
                <div>
                  <p className="font-bold text-lg">{summary.totalHours} {d.hoursShort}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{d.netHours}</p>
                </div>
                <div>
                  <p className="font-bold text-lg">₪{summary.totalBonuses}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{d.bonuses}</p>
                </div>
              </div>
            </Card>

          </div>
        )}
      </main>

      {/* Overtime Edit Modal — kept as dialog */}
      <Modal isOpen={isOvertimeModalOpen} onClose={() => setIsOvertimeModalOpen(false)} title={d.editOvertime}>
        <div className="flex flex-col gap-6 py-2" dir={language === 'he' ? 'rtl' : 'ltr'}>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center">{d.overtimeDesc}</p>
          
          <div className="flex items-center justify-between p-4 bg-[#f1f3fe] dark:bg-[#1A2545] rounded-xl">
            <div className="flex flex-col">
              <span className="font-bold text-text-light dark:text-text-dark">{d.enableOvertime}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{d.autoCalc}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={otEnabled} 
                onChange={(e) => setOtEnabled(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          {otEnabled && (
            <>
              <div className="flex flex-col gap-4 p-4 bg-[#f1f3fe] dark:bg-[#1A2545] rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-text-light dark:text-text-dark">{d.dailyThreshold}</span>
                  <span className="text-xl font-extrabold text-primary">{otHours.toFixed(1)} {d.hours}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={otHours}
                  onChange={(e) => setOtHours(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>4 {d.hoursShort}</span>
                  <span>8 {d.hoursShort}</span>
                  <span>12 {d.hoursShort}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 p-4 bg-[#f1f3fe] dark:bg-[#1A2545] rounded-xl">
                <span className="font-bold text-text-light dark:text-text-dark text-sm">{d.overtimePercent}</span>
                <div className="grid grid-cols-4 gap-2">
                  {[125, 150, 175, 200].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setOtPercentage(pct)}
                      className={`py-2 rounded-lg font-bold text-sm border active:scale-95 transition-all cursor-pointer ${
                        otPercentage === pct
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white text-text-light border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <Button
            onClick={saveOvertime}
            variant="primary"
            fullWidth
          >
            {d.saveChanges}
          </Button>
        </div>
      </Modal>

      {/* Wage — Modal (redesigned) */}
      <Modal isOpen={isWageModalOpen} onClose={() => setIsWageModalOpen(false)} title="">
        <div className="flex flex-col items-center gap-5 py-1" dir={language === 'he' ? 'rtl' : 'ltr'}>
          {/* Icon + label */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-14 flex items-center justify-center">
              <Icon name="payments" size="3xl" className="text-primary" />
            </div>
            <p className="text-base font-bold text-text-light dark:text-text-dark">{language === 'he' ? 'שכר שעתי' : 'Hourly Wage'}</p>
          </div>
          {/* Big value display */}
          <div className="flex items-baseline gap-1 border-b-2 border-primary pb-1 px-4">
            <span className="text-2xl font-extrabold text-primary">₪</span>
            <span className="text-5xl font-extrabold text-primary tracking-tight">{wageInput || '0'}</span>
            <span className="text-sm text-zinc-400 dark:text-zinc-500 mb-1">{language === 'he' ? '/שעה' : '/hr'}</span>
          </div>
          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {['1','2','3','4','5','6','7','8','9','.','0'].map(num => (
              <button
                key={num}
                onClick={() => {
                  if (num === '.') { if (!wageInput.includes('.')) setWageInput(p => p + '.'); return; }
                  setWageInput(p => { if (p === '0') return num; if (p.includes('.') && (p.split('.')[1]||'').length >= 2) return p; return p + num; });
                }}
                className="h-11 rounded-xl bg-[#f1f3fe] dark:bg-[#1A2545] hover:bg-primary/10 dark:hover:bg-primary/20 text-lg font-bold text-text-light dark:text-text-dark active:scale-95 transition-all cursor-pointer"
              >{num}</button>
            ))}
            <button
              onClick={() => setWageInput(p => p.length <= 1 ? '0' : p.slice(0,-1))}
              className="h-11 rounded-xl bg-[#f1f3fe] dark:bg-[#1A2545] hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-zinc-500 active:scale-95 transition-all cursor-pointer"
            >
              <Icon name="backspace" size="xl" />
            </button>
          </div>
          {/* Save */}
          <Button onClick={saveWage} variant="primary" fullWidth>
            {d.saveChanges}
          </Button>
        </div>
      </Modal>

      {/* Breaks — Modal (redesigned) */}
      <Modal isOpen={isBreaksModalOpen} onClose={() => setIsBreaksModalOpen(false)} title="">
        <div className="flex flex-col items-center gap-5 py-1" dir={language === 'he' ? 'rtl' : 'ltr'}>
          {/* Icon + label */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-14 flex items-center justify-center">
              <Icon name="coffee" size="3xl" className="text-primary" />
            </div>
            <p className="text-base font-bold text-text-light dark:text-text-dark">{language === 'he' ? 'הפסקה' : 'Break'}</p>
          </div>
          {/* Quick presets */}
          <div className="flex gap-2 w-full justify-center">
            {[15, 30, 45, 60].map(val => (
              <button
                key={val}
                onClick={() => setBreaksInput(val.toString())}
                className={`flex-1 py-1.5 rounded-full border text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
                  breaksInput === val.toString()
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 dark:border-zinc-600 text-text-light dark:text-text-dark hover:bg-primary/5'
                }`}
              >
                {val}{language === 'he' ? 'ד׳' : 'm'}
              </button>
            ))}
          </div>
          {/* Big value display */}
          <div className="flex items-baseline gap-2 border-b-2 border-primary pb-1 px-4">
            <span className="text-5xl font-extrabold text-primary tracking-tight">{breaksInput || '0'}</span>
            <span className="text-xl font-bold text-zinc-400 dark:text-zinc-500">{language === 'he' ? 'דקות' : 'min'}</span>
          </div>
          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {['1','2','3','4','5','6','7','8','9','.','0'].map(num => (
              <button
                key={num}
                onClick={() => {
                  if (num === '.') { if (!breaksInput.includes('.')) setBreaksInput(p => p + '.'); return; }
                  setBreaksInput(p => { if (p === '0') return num; if (p.includes('.') && (p.split('.')[1]||'').length >= 2) return p; return p + num; });
                }}
                className="h-11 rounded-xl bg-[#f1f3fe] dark:bg-[#1A2545] hover:bg-primary/10 dark:hover:bg-primary/20 text-lg font-bold text-text-light dark:text-text-dark active:scale-95 transition-all cursor-pointer"
              >{num}</button>
            ))}
            <button
              onClick={() => setBreaksInput(p => p.length <= 1 ? '0' : p.slice(0,-1))}
              className="h-11 rounded-xl bg-[#f1f3fe] dark:bg-[#1A2545] hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-zinc-500 active:scale-95 transition-all cursor-pointer"
            >
              <Icon name="backspace" size="xl" />
            </button>
          </div>
          {/* Save */}
          <Button onClick={saveBreaks} variant="primary" fullWidth>
            {d.saveChanges}
          </Button>
        </div>
      </Modal>

      {/* Travel — Modal with mode selector */}
      <Modal isOpen={isTravelModalOpen} onClose={() => setIsTravelModalOpen(false)} title="">
        <div className="flex flex-col items-center gap-5 py-1" dir={language === 'he' ? 'rtl' : 'ltr'}>
          {/* Icon + label */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-14 flex items-center justify-center">
              <Icon name="directions_car" size="3xl" className="text-primary" />
            </div>
            <p className="text-base font-bold text-text-light dark:text-text-dark">{language === 'he' ? 'נסיעות' : 'Travel Expenses'}</p>
          </div>

          {/* 3-mode selector */}
          <div className="flex w-full rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-600 bg-[#f1f3fe] dark:bg-[#1A2545] p-1 gap-1">
            {([
              ['disabled', language === 'he' ? 'לא לחשב' : "Don't calc"],
              ['per_shift', language === 'he' ? 'למשמרת' : 'Per Shift'],
              ['per_month', language === 'he' ? 'לחודש' : 'Per Month'],
            ] as [typeof travelMode, string][]).map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setTravelMode(mode)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                  travelMode === mode
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-text-light dark:hover:text-text-dark'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Value + keypad — hidden when disabled */}
          {travelMode !== 'disabled' && (
            <>
              <div className="flex items-baseline gap-1 border-b-2 border-primary pb-1 px-4">
                <span className="text-2xl font-extrabold text-primary">₪</span>
                <span className="text-5xl font-extrabold text-primary tracking-tight">{travelInput || '0'}</span>
                <span className="text-sm text-zinc-400 dark:text-zinc-500 mb-1">
                  {travelMode === 'per_month'
                    ? (language === 'he' ? '/חודש' : '/month')
                    : (language === 'he' ? '/משמרת' : '/shift')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 w-full">
                {['1','2','3','4','5','6','7','8','9','.','0'].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      if (num === '.') { if (!travelInput.includes('.')) setTravelInput(p => p + '.'); return; }
                      setTravelInput(p => { if (p === '0') return num; if (p.includes('.') && (p.split('.')[1]||'').length >= 2) return p; return p + num; });
                    }}
                    className="h-11 rounded-xl bg-[#f1f3fe] dark:bg-[#1A2545] hover:bg-primary/10 dark:hover:bg-primary/20 text-lg font-bold text-text-light dark:text-text-dark active:scale-95 transition-all cursor-pointer"
                  >{num}</button>
                ))}
                <button
                  onClick={() => setTravelInput(p => p.length <= 1 ? '0' : p.slice(0,-1))}
                  className="h-11 rounded-xl bg-[#f1f3fe] dark:bg-[#1A2545] hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-zinc-500 active:scale-95 transition-all cursor-pointer"
                >
                  <Icon name="backspace" size="xl" />
                </button>
              </div>
            </>
          )}

          {travelMode === 'disabled' && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Icon name="block" size="3xl" className="text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center">
                {language === 'he' ? 'הוצאות נסיעה לא יחושבו' : 'Travel expenses will not be calculated'}
              </p>
            </div>
          )}

          <Button onClick={saveTravel} variant="primary" fullWidth>
            {d.saveChanges}
          </Button>
        </div>
      </Modal>

      {/* Cycle — Modal with drum-roll */}
      <Modal isOpen={isCycleModalOpen} onClose={() => setIsCycleModalOpen(false)} title="">
        <div className="flex flex-col items-center gap-5 py-1" dir={language === 'he' ? 'rtl' : 'ltr'}>
          {/* Icon + label */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-14 flex items-center justify-center">
              <Icon name="event_repeat" size="3xl" className="text-primary" />
            </div>
            <p className="text-base font-bold text-text-light dark:text-text-dark">{language === 'he' ? 'תחילת חישוב שכר' : 'Payment Cycle Start'}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{language === 'he' ? `יום ${cycleInput || '1'} בחודש` : `Day ${cycleInput || '1'} of month`}</p>
          </div>
          {/* Drum-roll picker */}
          <div className="w-full relative h-44 overflow-hidden rounded-2xl bg-[#f1f3fe] dark:bg-[#1A2545]">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-primary/10 dark:bg-primary/20 border-y border-primary/30 pointer-events-none z-10" />
            <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#f1f3fe] dark:from-[#1A2545] to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#f1f3fe] dark:from-[#1A2545] to-transparent pointer-events-none z-10" />
            <div
              className="overflow-y-scroll h-full snap-y snap-mandatory"
              style={{ scrollbarWidth: 'none' }}
              onScroll={(e) => {
                const el = e.currentTarget;
                const idx = Math.round(el.scrollTop / 48);
                const day = Math.min(31, Math.max(1, idx + 1));
                setCycleInput(day.toString());
              }}
              ref={(el) => {
                if (el && cycleInput) {
                  const day = parseInt(cycleInput) || 1;
                  el.scrollTop = (day - 1) * 48;
                }
              }}
            >
              <div className="h-[calc(50%-24px)]" />
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <div
                  key={day}
                  onClick={() => setCycleInput(day.toString())}
                  className={`h-12 flex items-center justify-center snap-center text-xl font-bold cursor-pointer select-none transition-all ${
                    parseInt(cycleInput) === day
                      ? 'text-primary scale-110'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {String(day).padStart(2, '0')}
                </div>
              ))}
              <div className="h-[calc(50%-24px)]" />
            </div>
          </div>
          {/* Save */}
          <Button onClick={saveCycle} variant="primary" fullWidth>
            {d.saveChanges}
          </Button>
        </div>
      </Modal>

      {/* Wrapping the existing BottomNav with a wrapper to fix it perfectly to bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav 
          items={[
            { id: '2', icon: 'list_alt', label: nav.shifts, onClick: () => navigate('/shifts') },
            { id: '3', icon: 'track_changes', label: nav.live, onClick: () => navigate('/now') },
            { id: '1', icon: 'work', label: nav.home, active: true, onClick: () => navigate('/') },
            { id: '4', icon: 'settings', label: nav.settings, onClick: () => navigate('/settings') },
          ]}
        />
      </div>
    </div>
  );
};
