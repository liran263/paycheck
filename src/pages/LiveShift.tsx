import { useState, useEffect, useRef, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { BottomNav } from '../components/ui/BottomNav';
import { useTranslations } from '../i18n/translations';
import { useAppSettings } from '../context/AppContext';
import type { Shift } from '../types';

interface ActiveShiftState {
  startTime: string;
  jobId: string;
  currentRatePercent: number;
  entryTimeOverride?: string;
  bonuses: number;
  travelExpenses: number;
  notes?: string;
}

/* ─────────────────── Sub‑Modal types ─────────────────── */
type SubModal = 'none' | 'entryTime' | 'rate' | 'bonuses' | 'expenses' | 'endTime';

export const LiveShift: FC = () => {
  const navigate = useNavigate();
  const t = useTranslations();
  const ls = t.liveShift;
  const nav = t.nav;
  const { language } = useAppSettings();
  const isHebrew = language === 'he';

  const { jobs, addShift } = useData();
  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    const active = localStorage.getItem('paycheck_active_job_id');
    return active || '';
  });

  useEffect(() => {
    const active = localStorage.getItem('paycheck_active_job_id');
    if (active && jobs.some(j => j.id === active)) {
      setSelectedJobId(active);
    } else if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const [activeShift, setActiveShift] = useState<ActiveShiftState | null>(() => {
    const stored = localStorage.getItem('paycheck_active_shift');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ActiveShiftState;
        if (!parsed || !parsed.startTime || isNaN(new Date(parsed.startTime).getTime())) return null;
        return parsed;
      } catch { return null; }
    }
    return null;
  });

  /* ── Long press ── */
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const pressTimeoutRef = useRef<number | null>(null);
  const pressIntervalRef = useRef<number | null>(null);

  const startPress = (e: React.PointerEvent) => {
    e.preventDefault();
    if (activeShift || !activeJob) return;
    setIsPressing(true);
    setPressProgress(0);
    const startTime = Date.now();
    const duration = 1200;
    pressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setPressProgress(progress);
      if (progress >= 100) { triggerStartShift(); cancelPress(); }
    }, 30);
    pressTimeoutRef.current = window.setTimeout(() => { triggerStartShift(); cancelPress(); }, duration);
  };

  const cancelPress = () => {
    setIsPressing(false); setPressProgress(0);
    if (pressTimeoutRef.current) { clearTimeout(pressTimeoutRef.current); pressTimeoutRef.current = null; }
    if (pressIntervalRef.current) { clearInterval(pressIntervalRef.current); pressIntervalRef.current = null; }
  };

  const triggerStartShift = () => {
    if (!activeJob) return;
    const newActive: ActiveShiftState = {
      startTime: new Date().toISOString(),
      jobId: selectedJobId || activeJob.id,
      currentRatePercent: 100,
      bonuses: 0,
      travelExpenses: activeJob.travelMode === 'per_shift' ? activeJob.travelExpenses : 0,
    };
    setActiveShift(newActive);
    localStorage.setItem('paycheck_active_shift', JSON.stringify(newActive));
  };

  /* ── Timer ── */
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  interface FloatParticle { id: number; amount: string; x: number; }
  const [floatingParticles, setFloatingParticles] = useState<FloatParticle[]>([]);

  useEffect(() => {
    if (!activeShift) { setElapsedSeconds(0); setFloatingParticles([]); return; }
    const computeElapsed = () => {
      const start = new Date(activeShift.entryTimeOverride || activeShift.startTime);
      return Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
    };
    setElapsedSeconds(computeElapsed());
    const timer = setInterval(() => setElapsedSeconds(computeElapsed()), 1000);
    return () => clearInterval(timer);
  }, [activeShift]);

  const formatElapsed = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  /* ── Edit sheet / sub‑modals ── */
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [activeSubModal, setActiveSubModal] = useState<SubModal>('none');

  // custom picker values
  const [pickerTab, setPickerTab] = useState<'start' | 'end'>('end');
  const [pickerStartHours, setPickerStartHours] = useState(9);
  const [pickerStartMinutes, setPickerStartMinutes] = useState(0);
  const [pickerEndHours, setPickerEndHours] = useState(17);
  const [pickerEndMinutes, setPickerEndMinutes] = useState(0);

  const padZero = (n: number) => n.toString().padStart(2, '0');

  const getDurationHours = () => {
    let startMin = pickerStartHours * 60 + pickerStartMinutes;
    let endMin = pickerEndHours * 60 + pickerEndMinutes;
    let diffMin = endMin - startMin;
    if (diffMin <= 0) {
      diffMin += 24 * 60; // Overnight
    }
    return (diffMin / 60).toFixed(1);
  };

  const adjustActiveTime = (amountMinutes: number) => {
    if (pickerTab === 'start') {
      let totalMin = pickerStartHours * 60 + pickerStartMinutes + amountMinutes;
      totalMin = (totalMin + 24 * 60) % (24 * 60);
      setPickerStartHours(Math.floor(totalMin / 60));
      setPickerStartMinutes(totalMin % 60);
    } else {
      let totalMin = pickerEndHours * 60 + pickerEndMinutes + amountMinutes;
      totalMin = (totalMin + 24 * 60) % (24 * 60);
      setPickerEndHours(Math.floor(totalMin / 60));
      setPickerEndMinutes(totalMin % 60);
    }
  };

  const selectCommonHour = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    if (pickerTab === 'start') {
      setPickerStartHours(h);
      setPickerStartMinutes(m);
    } else {
      setPickerEndHours(h);
      setPickerEndMinutes(m);
    }
  };

  // field values
  const [editRate, setEditRate] = useState('100');
  const [editBonuses, setEditBonuses] = useState('0');

  const openEditSheet = () => {
    if (!activeShift) return;
    const startDate = new Date(activeShift.entryTimeOverride || activeShift.startTime);
    
    // Initialize picker values
    setPickerStartHours(startDate.getHours());
    setPickerStartMinutes(startDate.getMinutes());
    
    const now = new Date();
    setPickerEndHours(now.getHours());
    setPickerEndMinutes(now.getMinutes());
    setPickerTab('end');

    setEditRate(activeShift.currentRatePercent.toString());
    setEditBonuses(activeShift.bonuses.toString());
    setIsEditSheetOpen(true);
  };

  const closeAll = () => { setIsEditSheetOpen(false); setActiveSubModal('none'); };

  /* persist helper */
  const persistShift = (updated: ActiveShiftState) => {
    setActiveShift(updated);
    localStorage.setItem('paycheck_active_shift', JSON.stringify(updated));
  };

  /* ── Save entry time ── */
  const saveEntryTime = () => {
    if (!activeShift) return;
    const d = new Date(activeShift.entryTimeOverride || activeShift.startTime);
    d.setHours(pickerStartHours);
    d.setMinutes(pickerStartMinutes);
    d.setSeconds(0);
    persistShift({ ...activeShift, entryTimeOverride: d.toISOString() });
    setActiveSubModal('none');
  };

  /* ── Save rate ── */
  const saveRate = () => {
    if (!activeShift) return;
    persistShift({ ...activeShift, currentRatePercent: parseFloat(editRate) || 100 });
    setActiveSubModal('none');
  };

  /* ── Save bonuses ── */
  const saveBonuses = () => {
    if (!activeShift) return;
    persistShift({ ...activeShift, bonuses: parseFloat(editBonuses) || 0 });
    setActiveSubModal('none');
  };


  /* ── Delete shift ── */
  const handleDeleteShift = () => {
    if (window.confirm(ls.deleteConfirm)) {
      setActiveShift(null);
      localStorage.removeItem('paycheck_active_shift');
      closeAll();
    }
  };

  /* ── End shift at custom time ── */
  const endShiftAtCustomTime = () => {
    try {
      if (!activeShift || !activeJob) return;
      
      const start = new Date(activeShift.entryTimeOverride || activeShift.startTime);
      if (isNaN(start.getTime())) return;
      start.setHours(pickerStartHours);
      start.setMinutes(pickerStartMinutes);
      start.setSeconds(0);
      
      const end = new Date();
      end.setHours(pickerEndHours);
      end.setMinutes(pickerEndMinutes);
      end.setSeconds(0);
      
      // If start is after end, the shift went overnight
      if (start.getTime() >= end.getTime()) {
        end.setDate(end.getDate() + 1);
      }
      
      const newShift: Shift = {
        id: 's_' + Date.now(), jobId: activeShift.jobId, status: 'completed',
        startDateTime: start.toISOString(), endDateTime: end.toISOString(),
        breakMinutes: activeJob.autoBreakMinutes || 0,
        bonuses: activeShift.bonuses || 0,
      };
      if (activeShift.notes) {
        newShift.notes = activeShift.notes;
      }
      addShift(newShift);
      setActiveShift(null);
      localStorage.removeItem('paycheck_active_shift');
      closeAll();
      navigate('/shifts');
    } catch (err) {
      console.error(err);
      alert(isHebrew ? 'שגיאה בשמירה' : 'Error saving shift');
    }
  };

  /* ── Swipe slider ── */
  const [sliderX, setSliderX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const swipeContainerRef = useRef<HTMLDivElement | null>(null);
  const maxTravel = 220;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!activeShift) return;
    setIsSwiping(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSwiping || !activeShift) return;
    const container = swipeContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const offset = isHebrew ? rect.right - e.clientX - 24 : e.clientX - rect.left - 24;
    setSliderX(Math.max(0, Math.min(maxTravel, offset)));
  };
  const handlePointerUp = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    if (sliderX >= maxTravel - 15) completeShift();
    else setSliderX(0);
  };

  const completeShift = () => {
    try {
      if (!activeShift || !activeJob) return;
      let start = new Date(activeShift.entryTimeOverride || activeShift.startTime);
      if (isNaN(start.getTime())) start = new Date();
      const newShift: Shift = {
        id: 's_' + Date.now(), jobId: activeShift.jobId, status: 'completed',
        startDateTime: start.toISOString(), endDateTime: new Date().toISOString(),
        breakMinutes: activeJob.autoBreakMinutes || 0,
        bonuses: activeShift.bonuses || 0,
      };
      if (activeShift.notes) {
        newShift.notes = activeShift.notes;
      }
      addShift(newShift);
      setActiveShift(null);
      localStorage.removeItem('paycheck_active_shift');
      setSliderX(0);
      navigate('/shifts');
    } catch (err) {
      console.error(err);
      alert(isHebrew ? 'שגיאה בשמירה' : 'Error saving shift');
      setSliderX(0);
    }
  };

  /* ── Live earnings ── */
  const getFormattedEntryTime = () => {
    if (!activeShift) return '';
    const date = new Date(activeShift.entryTimeOverride || activeShift.startTime);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const getLiveEarnings = () => {
    if (!activeShift || !activeJob) return 0;
    const elapsedHours = elapsedSeconds / 3600;
    const otThreshold = activeJob.overtimeStartsAfterHours || 8;
    let wagePay = 0;
    if (elapsedHours <= otThreshold) {
      wagePay = elapsedHours * activeJob.hourlyWage * (activeShift.currentRatePercent / 100);
    } else {
      const regularPay = otThreshold * activeJob.hourlyWage * (activeShift.currentRatePercent / 100);
      const overtimePay = (elapsedHours - otThreshold) * activeJob.hourlyWage * (activeJob.overtimePercentage / 100);
      wagePay = regularPay + overtimePay;
    }
    return wagePay + (activeShift.bonuses || 0);
  };

  const getLiveRatePerSecond = () => {
    if (!activeShift || !activeJob) return 0;
    const elapsedHours = elapsedSeconds / 3600;
    const otThreshold = activeJob.overtimeStartsAfterHours || 8;
    const rate = elapsedHours > otThreshold
      ? activeJob.overtimePercentage / 100
      : activeShift.currentRatePercent / 100;
    return (activeJob.hourlyWage * rate) / 3600;
  };

  useEffect(() => {
    if (!activeShift || !activeJob) return;
    const ratePerSec = getLiveRatePerSecond();
    const newParticle = { id: Date.now(), amount: `+₪${ratePerSec.toFixed(3)}`, x: Math.floor(Math.random() * 40) - 20 };
    setFloatingParticles(prev => [...prev.slice(-6), newParticle]);
    const cleanup = setTimeout(() => setFloatingParticles(prev => prev.filter(p => p.id !== newParticle.id)), 1300);
    return () => clearTimeout(cleanup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedSeconds]);

  /* ─────────────── Sub‑Modal render helpers (plain functions, NOT FC components) ─────────────── */
  // IMPORTANT: These must be plain functions, not React components (FC).
  // Defining them as FC inside the render body would cause React to see a
  // new component type every render (each elapsedSeconds tick), unmounting
  // and remounting the modal — which creates the open/close flicker bug.
  const renderSubModal = ({
    title, icon, gradient, onSave, children,
  }: { title: string; icon: string; gradient: string; onSave: () => void; children: React.ReactNode }) => (
    <div className="fixed inset-0 z-[200] flex items-end justify-center" dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveSubModal('none')} />
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-background-light dark:bg-[#1a1a2e] shadow-2xl overflow-hidden animate-slide-up">
        <div className={`${gradient} p-6 flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Icon name={icon} size="xl" className="text-white" />
          </div>
          <h2 className="text-xl font-black text-white">{title}</h2>
        </div>
        <div className="p-6 flex flex-col gap-5">
          {children}
          <div className="flex gap-3 mt-1">
            <button
              onClick={() => setActiveSubModal('none')}
              className="flex-1 py-3.5 bg-zinc-100 dark:bg-zinc-800 text-text-light dark:text-text-dark font-bold rounded-2xl transition-all cursor-pointer border-0 text-sm"
            >
              {isHebrew ? 'ביטול' : 'Cancel'}
            </button>
            <button
              onClick={onSave}
              className={`flex-1 py-3.5 ${gradient} text-white font-black rounded-2xl shadow-lg transition-all cursor-pointer border-0 text-sm`}
            >
              {isHebrew ? 'שמור' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomTimePickerModal = (mode: 'entryTime' | 'endTime') => {
    const isStartTab = mode === 'entryTime' || pickerTab === 'start';
    const activeHours = isStartTab ? pickerStartHours : pickerEndHours;
    const activeMinutes = isStartTab ? pickerStartMinutes : pickerEndMinutes;

    const handleHourChange = (increment: boolean) => {
      if (isStartTab) {
        setPickerStartHours(prev => (prev + (increment ? 1 : -1) + 24) % 24);
      } else {
        setPickerEndHours(prev => (prev + (increment ? 1 : -1) + 24) % 24);
      }
    };

    const handleMinuteChange = (increment: boolean) => {
      if (isStartTab) {
        setPickerStartMinutes(prev => (prev + (increment ? 1 : -1) + 60) % 60);
      } else {
        setPickerEndMinutes(prev => (prev + (increment ? 1 : -1) + 60) % 60);
      }
    };

    const handleSave = () => {
      if (mode === 'entryTime') {
        saveEntryTime();
      } else {
        endShiftAtCustomTime();
      }
    };

    const commonHoursList = ['08:00', '09:00', '15:00', '16:00', '17:00', '18:00', '23:00', '00:00'];

    return (
      <div className="fixed inset-0 z-[200] flex items-end justify-center" dir={isHebrew ? 'rtl' : 'ltr'}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveSubModal('none')} />

        {/* Modal Sheet */}
        <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white dark:bg-[#12121e] border-t border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-slide-up pb-8">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-zinc-800/40">
            <h2 className="text-lg font-black text-text-light dark:text-text-dark">
              {mode === 'entryTime' 
                ? (isHebrew ? 'שינוי שעת כניסה' : 'Change Entry Time') 
                : (isHebrew ? 'בחירת שעות המשמרת' : 'Select Shift Hours')}
            </h2>
            <button
              onClick={() => setActiveSubModal('none')}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer border-0"
            >
              <Icon name="close" size="md" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
            {/* Top Display Card */}
            {mode === 'endTime' && (
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                    <Icon name="schedule" size="lg" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">משך המשמרת</span>
                    <span className="text-base font-black text-text-light dark:text-text-dark font-mono">{getDurationHours()} שעות</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-black text-sm tracking-tight font-mono" dir="ltr">
                  <span 
                    onClick={() => setPickerTab('start')}
                    className={`cursor-pointer pb-0.5 transition-colors ${pickerTab === 'start' ? 'text-primary border-b-2 border-primary' : 'hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                  >
                    {padZero(pickerStartHours)}:{padZero(pickerStartMinutes)}
                  </span>
                  <span>➔</span>
                  <span 
                    onClick={() => setPickerTab('end')}
                    className={`cursor-pointer pb-0.5 transition-colors ${pickerTab === 'end' ? 'text-primary border-b-2 border-primary' : 'hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                  >
                    {padZero(pickerEndHours)}:{padZero(pickerEndMinutes)}
                  </span>
                </div>
              </div>
            )}

            {/* Tab Selector */}
            {mode === 'endTime' && (
              <div className="bg-zinc-100 dark:bg-zinc-900/60 p-1 rounded-2xl flex gap-1 shadow-xs border border-zinc-200/20">
                <button
                  type="button"
                  onClick={() => setPickerTab('start')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black cursor-pointer border-0 transition-all ${pickerTab === 'start' ? 'bg-primary text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 bg-transparent'}`}
                >
                  {isHebrew ? 'שעת התחלה' : 'Start Time'}
                </button>
                <button
                  type="button"
                  onClick={() => setPickerTab('end')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black cursor-pointer border-0 transition-all ${pickerTab === 'end' ? 'bg-primary text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 bg-transparent'}`}
                >
                  {isHebrew ? 'שעת סיום' : 'End Time'}
                </button>
              </div>
            )}

            {/* Time Digits Picker */}
            <div className="flex items-center justify-center gap-6 py-2" dir="ltr">
              {/* Hours Box */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleHourChange(true)}
                  className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/20 active:scale-90 transition-all cursor-pointer border-0"
                >
                  <Icon name="keyboard_arrow_up" size="xl" />
                </button>
                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-4xl font-black text-text-light dark:text-text-dark font-mono shadow-inner">
                  {padZero(activeHours)}
                </div>
                <button
                  onClick={() => handleHourChange(false)}
                  className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/20 active:scale-90 transition-all cursor-pointer border-0"
                >
                  <Icon name="keyboard_arrow_down" size="xl" />
                </button>
              </div>

              {/* Separator Colon */}
              <div className="text-primary text-4xl font-bold font-mono self-center mt-2">:</div>

              {/* Minutes Box */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleMinuteChange(true)}
                  className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/20 active:scale-90 transition-all cursor-pointer border-0"
                >
                  <Icon name="keyboard_arrow_up" size="xl" />
                </button>
                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-4xl font-black text-text-light dark:text-text-dark font-mono shadow-inner">
                  {padZero(activeMinutes)}
                </div>
                <button
                  onClick={() => handleMinuteChange(false)}
                  className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/20 active:scale-90 transition-all cursor-pointer border-0"
                >
                  <Icon name="keyboard_arrow_down" size="xl" />
                </button>
              </div>
            </div>

            {/* Quick Adjustments */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{isHebrew ? 'התאמה מהירה' : 'Quick Adjust'}</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => adjustActiveTime(60)}
                  className="py-3 rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs cursor-pointer transition-colors text-center"
                >
                  +1 שעה
                </button>
                <button
                  onClick={() => adjustActiveTime(30)}
                  className="py-3 rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs cursor-pointer transition-colors text-center"
                >
                  +30 דק'
                </button>
                <button
                  onClick={() => adjustActiveTime(15)}
                  className="py-3 rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs cursor-pointer transition-colors text-center"
                >
                  +15 דק'
                </button>
                <button
                  onClick={() => adjustActiveTime(-60)}
                  className="py-3 rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs cursor-pointer transition-colors text-center"
                >
                  -1 שעה
                </button>
                <button
                  onClick={() => adjustActiveTime(-30)}
                  className="py-3 rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs cursor-pointer transition-colors text-center"
                >
                  -30 דק'
                </button>
                <button
                  onClick={() => adjustActiveTime(-15)}
                  className="py-3 rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs cursor-pointer transition-colors text-center"
                >
                  -15 דק'
                </button>
              </div>
            </div>

            {/* Common Hours */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{isHebrew ? 'שעות נפוצות' : 'Common Hours'}</span>
              <div className="grid grid-cols-4 gap-2">
                {commonHoursList.map(timeStr => (
                  <button
                    key={timeStr}
                    onClick={() => selectCommonHour(timeStr)}
                    className="py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors text-center font-mono shadow-xs"
                  >
                    {timeStr}
                  </button>
                ))}
              </div>
            </div>

            {/* Save / Cancel Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setActiveSubModal('none')}
                className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl border-0 cursor-pointer text-sm transition-colors hover:bg-zinc-200"
              >
                {isHebrew ? 'ביטול' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-lg border-0 cursor-pointer text-sm hover:bg-primary/95 transition-all active:scale-98"
              >
                {mode === 'entryTime' 
                  ? (isHebrew ? 'שמור שעת כניסה' : 'Save Entry Time')
                  : (isHebrew ? 'סיים משמרת' : 'End Shift')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────────────── JSX ─────────────────────── */
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f9f9ff] page-bg font-display overflow-x-hidden pb-24" dir={isHebrew ? 'rtl' : 'ltr'}>

      {/* Header */}
      <header className="flex items-center justify-between p-4 pb-2 bg-background-light dark:bg-background-dark sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800 w-full">
        {activeShift ? (
          <div className="flex items-center gap-1.5 text-primary">
            <span className="text-xl font-bold leading-normal tracking-[0.015em] select-none">{activeJob?.jobName}</span>
            {jobs.length > 1 && (
              <select
                value={selectedJobId}
                onChange={e => {
                  const newJobId = e.target.value;
                  setSelectedJobId(newJobId);
                  if (activeShift) {
                    const updated = { ...activeShift, jobId: newJobId };
                    setActiveShift(updated);
                    localStorage.setItem('paycheck_active_shift', JSON.stringify(updated));
                  }
                }}
                className="opacity-0 absolute w-24 cursor-pointer"
              >
                {jobs.map(j => <option key={j.id} value={j.id}>{j.jobName}</option>)}
              </select>
            )}
            {jobs.length > 1 && <Icon name="expand_more" size="xl" />}
          </div>
        ) : (
          <h1 className="text-text-light dark:text-text-dark text-xl font-bold leading-tight tracking-[-0.015em] text-center flex-1">
            {ls.notInShift}
          </h1>
        )}

        {/* Styled Edit Button */}
        {activeShift && (
          <button
            onClick={openEditSheet}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-primary to-[#5a9aff] shadow-md shadow-primary/30 active:scale-95 transition-all cursor-pointer border-0"
          >
            <Icon name="tune" size="sm" className="text-white" />
            <span>{isHebrew ? 'עריכה' : 'Edit'}</span>
          </button>
        )}
      </header>

      <main className="flex-grow p-4 flex flex-col items-center justify-center gap-8 min-h-[calc(100vh-140px)]">
        {!activeShift ? (
          /* ==================== IDLE STATE ==================== */
          <div className="flex flex-col items-center justify-center gap-6 text-center w-full max-w-sm px-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute size-44 rounded-full bg-primary/5 animate-ping duration-2000" />
              <div className="absolute size-36 rounded-full bg-primary/10 animate-pulse" />
              <button
                onPointerDown={startPress}
                onPointerUp={cancelPress}
                onPointerLeave={cancelPress}
                className="relative z-10 size-28 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-transform duration-100 select-none cursor-pointer border-0"
              >
                {isPressing && (
                  <svg className="absolute inset-0 size-full -rotate-90">
                    <circle cx="56" cy="56" r="52" stroke="rgba(255,255,255,0.3)" strokeWidth="6" fill="transparent" />
                    <circle cx="56" cy="56" r="52" stroke="white" strokeWidth="6" fill="transparent"
                      strokeDasharray="326.7"
                      strokeDashoffset={326.7 - (326.7 * pressProgress) / 100}
                      className="transition-all duration-75"
                    />
                  </svg>
                )}
                <Icon name="play_arrow" size="4xl" />
              </button>
            </div>
            <div className="space-y-1 mt-2">
              <h2 className="text-xl font-bold text-text-light dark:text-text-dark">{ls.notInShift}</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs leading-relaxed">{ls.longPressToStart}</p>
            </div>
          </div>
        ) : (
          /* ==================== ACTIVE STATE ==================== */
          <div className="flex flex-col items-center justify-center gap-6 w-full max-w-sm">
            {/* Pulsing Neon Live Earnings Circle */}
            <div className="relative w-56 h-56 rounded-full border-[6px] border-[#00d5ff] dark:border-[#007AFF] bg-[#0c1428] dark:bg-[#131D35] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,213,255,0.45)] dark:shadow-[0_0_30px_rgba(0,122,255,0.45)] select-none overflow-visible">
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#00d5ff]/20 dark:border-[#007AFF]/20 animate-spin-slow" />
              <div className="absolute inset-4 rounded-full border border-[#00d5ff]/10 dark:border-[#007AFF]/10 animate-ping" />

              {floatingParticles.map(p => (
                <span
                  key={p.id}
                  className="animate-float-up absolute bottom-1/2 pointer-events-none font-mono font-black text-emerald-400 text-xs select-none"
                  style={{ left: `calc(50% + ${p.x}px)`, transform: 'translateX(-50%)' }}
                >
                  {p.amount}
                </span>
              ))}

              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold tracking-widest text-[#00d5ff] dark:text-[#007AFF] uppercase mb-1">
                  {isHebrew ? 'הרווחת עד כה' : 'LIVE EARNINGS'}
                </span>
                <span className="text-3xl font-black text-white tracking-tight drop-shadow-sm font-mono">
                  ₪{getLiveEarnings().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Shift Detail Cards */}
            <div className="grid grid-cols-2 gap-4 w-full px-2">
              <Card padding="md" className="flex flex-col items-center justify-center text-center rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1">{ls.entryTime}</span>
                <span className="text-lg font-black text-text-light dark:text-text-dark">{getFormattedEntryTime()}</span>
              </Card>
              <Card padding="md" className="flex flex-col items-center justify-center text-center rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1">{ls.currentRate}</span>
                <span className="text-lg font-black text-primary">{activeShift.currentRatePercent}%</span>
              </Card>
            </div>

            {/* Time in Shift */}
            <div className="w-full text-center mt-2">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1 block">{ls.timeInShift}</span>
              <span className="text-5xl font-black text-text-light dark:text-text-dark font-mono tracking-tight select-none">{formatElapsed(elapsedSeconds)}</span>
            </div>

            {/* Swipe to End */}
            <div
              ref={swipeContainerRef}
              className="w-full max-w-[282px] h-[56px] rounded-full bg-zinc-200 dark:bg-zinc-800/80 border border-gray-300 dark:border-zinc-700 relative p-1 flex items-center select-none overflow-hidden mt-4"
            >
              <span
                className="text-zinc-500 dark:text-zinc-400 text-xs font-bold absolute inset-0 flex items-center justify-center pointer-events-none tracking-wide"
                style={{ opacity: Math.max(0, 1 - sliderX / 110) }}
              >
                {ls.slideToEnd}
              </span>
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="size-11 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-md select-none touch-none"
                style={{ transform: `translateX(${isHebrew ? -sliderX : sliderX}px)`, transition: isSwiping ? 'none' : 'transform 200ms ease-out' }}
              >
                <Icon name={isHebrew ? 'chevron_left' : 'chevron_right'} size="2xl" className="text-white" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══════════════ EDIT ACTION SHEET ═══════════════ */}
      {isEditSheetOpen && activeShift && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" dir={isHebrew ? 'rtl' : 'ltr'}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeAll} />

          {/* Sheet */}
          <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-background-light dark:bg-[#12121e] shadow-2xl overflow-hidden animate-slide-up">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            </div>

            {/* Title */}
            <div className="px-6 pb-2 pt-1">
              <h2 className="text-2xl font-black text-text-light dark:text-text-dark text-center">
                {isHebrew ? 'עריכת משמרת' : 'Edit Shift'}
              </h2>
            </div>

            {/* Action Tiles Grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {/* Delete Shift */}
              <button
                onClick={handleDeleteShift}
                className="rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-4 flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                  <Icon name="delete" size="xl" className="text-red-500" />
                </div>
                <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300 text-center leading-tight">
                  {isHebrew ? 'מחיקת משמרת' : 'Delete Shift'}
                </span>
              </button>

              {/* End at Other Time */}
              <button
                onClick={() => { setIsEditSheetOpen(false); setActiveSubModal('endTime'); }}
                className="rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-4 flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                  <Icon name="alarm_on" size="xl" className="text-blue-500" />
                </div>
                <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300 text-center leading-tight">
                  {isHebrew ? 'סיום בזמן אחר' : 'End at Other Time'}
                </span>
              </button>

              {/* Change Rate */}
              <button
                onClick={() => setActiveSubModal('rate')}
                className="rounded-2xl p-4 flex flex-col items-start gap-2 cursor-pointer active:scale-95 transition-all relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)' }}
              >
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center mb-auto">
                  <Icon name="percent" size="lg" className="text-white" />
                </div>
                <div>
                  <span className="text-base font-black text-white block leading-tight">{isHebrew ? 'שינוי תעריף' : 'Change Rate'}</span>
                  <span className="text-xs text-white/70 font-semibold">{activeShift.currentRatePercent}%</span>
                </div>
              </button>

              {/* Change Entry Time */}
              <button
                onClick={() => setActiveSubModal('entryTime')}
                className="rounded-2xl p-4 flex flex-col items-start gap-2 cursor-pointer active:scale-95 transition-all relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0288D1 0%, #01579B 100%)' }}
              >
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center mb-auto">
                  <Icon name="schedule" size="lg" className="text-white" />
                </div>
                <div>
                  <span className="text-base font-black text-white block leading-tight">{isHebrew ? 'שינוי שעת כניסה' : 'Change Entry Time'}</span>
                  <span className="text-xs text-white/70 font-semibold">{getFormattedEntryTime()}</span>
                </div>
              </button>

              {/* Add Bonuses */}
              <button
                onClick={() => setActiveSubModal('bonuses')}
                className="rounded-2xl p-4 flex flex-col items-start gap-2 cursor-pointer active:scale-95 transition-all relative overflow-hidden col-span-2"
                style={{ background: 'linear-gradient(135deg, #1565C0 0%, #4a4aff 100%)' }}
              >
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center mb-auto">
                  <Icon name="redeem" size="lg" className="text-white" />
                </div>
                <div>
                  <span className="text-base font-black text-white block leading-tight">{isHebrew ? 'הוספת בונוסים' : 'Add Bonuses'}</span>
                  <span className="text-xs text-white/70 font-semibold">₪{activeShift.bonuses}</span>
                </div>
              </button>
            </div>

            {/* Close button */}
            <div className="px-4 pb-6 pt-1">
              <button
                onClick={closeAll}
                className="w-full py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-text-light dark:text-text-dark font-bold text-sm border-0 cursor-pointer active:scale-98 transition-all"
              >
                {isHebrew ? 'סגור' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ SUB‑MODALS ═══════════════ */}

      {/* Entry Time */}
      {activeSubModal === 'entryTime' && renderCustomTimePickerModal('entryTime')}

      {/* Rate */}
      {activeSubModal === 'rate' && renderSubModal({
        title: isHebrew ? 'שינוי תעריף' : 'Change Rate',
        icon: 'percent',
        gradient: 'bg-gradient-to-r from-[#1565C0] to-[#0D47A1]',
        onSave: saveRate,
        children: (
          <>
            <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
              {isHebrew ? 'אחוז תעריף (לפי הגדרות)' : 'Rate Percent (from settings)'}
            </label>
            <div className="flex gap-3">
              {[100, 125, 150, 200].map(rate => (
                <button
                  key={rate}
                  onClick={() => setEditRate(rate.toString())}
                  className={`flex-1 py-3 rounded-2xl font-black text-sm border-0 cursor-pointer transition-all ${editRate === rate.toString() ? 'bg-gradient-to-b from-[#1565C0] to-[#0D47A1] text-white shadow-lg' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}
                >
                  {rate}%
                </button>
              ))}
            </div>
            <input
              type="number"
              value={editRate}
              onChange={e => setEditRate(e.target.value)}
              placeholder="100"
              className="w-full p-4 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-primary text-xl font-black text-center"
            />
          </>
        ),
      })}

      {/* Bonuses */}
      {activeSubModal === 'bonuses' && renderSubModal({
        title: isHebrew ? 'הוספת בונוסים' : 'Add Bonuses',
        icon: 'redeem',
        gradient: 'bg-gradient-to-r from-[#1565C0] to-[#4a4aff]',
        onSave: saveBonuses,
        children: (
          <>
            <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
              {isHebrew ? 'סכום בונוס (₪)' : 'Bonus Amount (₪)'}
            </label>
            <input
              type="number"
              value={editBonuses}
              onChange={e => setEditBonuses(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full p-4 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-primary text-2xl font-black text-center"
            />
          </>
        ),
      })}


      {/* End at Other Time */}
      {activeSubModal === 'endTime' && renderCustomTimePickerModal('endTime')}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav
          items={[
            { id: '2', icon: 'list_alt', label: nav.shifts, onClick: () => navigate('/shifts') },
            { id: '3', icon: 'track_changes', label: nav.live, active: true, onClick: () => navigate('/now') },
            { id: '1', icon: 'work', label: nav.home, onClick: () => navigate('/') },
            { id: '4', icon: 'settings', label: nav.settings, onClick: () => navigate('/settings') },
          ]}
        />
      </div>
    </div>
  );
};
