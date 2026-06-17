<<<<<<< Updated upstream
import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { Icon } from '../components/ui/Icon';
import { Select } from '../components/ui/Select';
import { useAppSettings } from '../context/AppContext';
import { useData } from '../context/DataContext';
import type { Shift } from '../types';

// Parse date string like '2024-05-15' as local Date object
const parseLocalDate = (dateStr: string) => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  return new Date(dateStr);
};

// Convert local Date object back to YYYY-MM-DD
const toYYYYMMDD = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Format date display string
const getFormattedDate = (dateStr: string, isHebrew: boolean) => {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  const year = d.getFullYear();
  const monthIdx = d.getMonth();
  
  const monthsHe = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  if (isHebrew) {
    return `${day} ב${monthsHe[monthIdx]}, ${year}`;
  } else {
    return `${monthsEn[monthIdx]} ${day}, ${year}`;
  }
};

// Utility: calculate net hours and pay from shift inputs
function calcShiftSummary(
  startTime: string,
  endTime: string,
  breakMinutes: number,
  bonus: number,
  hourlyWage: number,
  overtimeStartsAfterHours: number,
  overtimePercentage: number
) {
  if (!startTime || !endTime) return null;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  if (totalMinutes <= 0) totalMinutes += 24 * 60; // overnight shift

  const netMinutes = totalMinutes - breakMinutes;
  if (netMinutes <= 0) return null;

  const netHours = netMinutes / 60;
  const overtimeHours = Math.max(0, netHours - overtimeStartsAfterHours);
  const regularHours = netHours - overtimeHours;

  const regularPay = regularHours * hourlyWage;
  const overtimePay = overtimeHours * hourlyWage * (overtimePercentage / 100);
  const totalPay = regularPay + overtimePay + bonus;

  return { netHours, overtimeHours, totalPay };
}

export const AddShift: FC = () => {
  const navigate = useNavigate();
  const { language } = useAppSettings();
  const isHebrew = language === 'he';
  
  const { jobs, shifts, addShift } = useData();
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs.length > 0 ? jobs[0].id : '');

  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);
  
  // Find current job details
  const job = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const today = new Date();
  // Format as YYYY-MM-DD for input type="date"
  const formattedToday = today.toISOString().split('T')[0];

  const [date, setDate] = useState(formattedToday);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [breakMinutes, setBreakMinutes] = useState(job ? job.autoBreakMinutes : 30);
  const [bonus, setBonus] = useState('0');
  const [notes, setNotes] = useState('');

  // Modal open states
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  // Date picker states
  const [tempDate, setTempDate] = useState(date);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // Unified Time picker states
  const [tempStartHour, setTempStartHour] = useState(9);
  const [tempStartMinute, setTempStartMinute] = useState(0);
  const [tempEndHour, setTempEndHour] = useState(17);
  const [tempEndMinute, setTempEndMinute] = useState(0);
  const [activeTimeField, setActiveTimeField] = useState<'start' | 'end'>('start');

  // Break picker states
  const [isBreakPickerOpen, setIsBreakPickerOpen] = useState(false);
  const [tempBreakInput, setTempBreakInput] = useState('');

  const openDatePicker = () => {
    setTempDate(date);
    const d = parseLocalDate(date);
    setCalendarMonth(d.getMonth());
    setCalendarYear(d.getFullYear());
    setIsDatePickerOpen(true);
  };

  const openUnifiedTimePicker = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    setTempStartHour(isNaN(startH) ? 9 : startH);
    setTempStartMinute(isNaN(startM) ? 0 : startM);
    setTempEndHour(isNaN(endH) ? 17 : endH);
    setTempEndMinute(isNaN(endM) ? 0 : endM);
    
    setActiveTimeField('start');
    setIsTimePickerOpen(true);
  };

  const openBreakPicker = () => {
    setTempBreakInput(breakMinutes.toString());
    setIsBreakPickerOpen(true);
  };

  const handleBreakKeypress = (key: string) => {
    if (key === '.') {
      if (tempBreakInput.includes('.')) return;
      setTempBreakInput(prev => prev + '.');
    } else if (key === 'delete') {
      setTempBreakInput(prev => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
    } else {
      setTempBreakInput(prev => {
        if (prev === '0') return key;
        if (prev.includes('.') && (prev.split('.')[1] || '').length >= 2) return prev;
        if (prev.length >= 6) return prev;
        return prev + key;
      });
    }
  };

  const saveBreakPicker = () => {
    const val = parseFloat(tempBreakInput);
    setBreakMinutes(isNaN(val) ? 0 : val);
    setIsBreakPickerOpen(false);
  };

  const activeHour = activeTimeField === 'start' ? tempStartHour : tempEndHour;
  const activeMinute = activeTimeField === 'start' ? tempStartMinute : tempEndMinute;

  const setActiveHour = (h: number | ((prev: number) => number)) => {
    if (activeTimeField === 'start') {
      setTempStartHour(typeof h === 'function' ? (h as any)(tempStartHour) : h);
    } else {
      setTempEndHour(typeof h === 'function' ? (h as any)(tempEndHour) : h);
    }
  };

  const setActiveMinute = (m: number | ((prev: number) => number)) => {
    if (activeTimeField === 'start') {
      setTempStartMinute(typeof m === 'function' ? (m as any)(tempStartMinute) : m);
    } else {
      setTempEndMinute(typeof m === 'function' ? (m as any)(tempEndMinute) : m);
    }
  };

  const getTempDurationText = () => {
    let totalMinutes = (tempEndHour * 60 + tempEndMinute) - (tempStartHour * 60 + tempStartMinute);
    if (totalMinutes <= 0) totalMinutes += 24 * 60; // overnight shift
    const durationHours = totalMinutes / 60;
    return isHebrew ? `${durationHours.toFixed(1)} שעות` : `${durationHours.toFixed(1)} hrs`;
  };

  // Handle job changes to update default break time
  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    const selectedJob = jobs.find(j => j.id === jobId);
    if (selectedJob) {
      setBreakMinutes(selectedJob.autoBreakMinutes);
    }
  };

  const summary = job ? calcShiftSummary(
    startTime,
    endTime,
    breakMinutes,
    parseFloat(bonus) || 0,
    job.hourlyWage,
    job.overtimeStartsAfterHours,
    job.overtimePercentage
  ) : null;

  const handleSave = () => {
    if (!job) return;

    // Create ISO string for startDateTime
    const startDateTime = `${date}T${startTime}:00.000Z`;
    let endDateTime = `${date}T${endTime}:00.000Z`;

    // Handle overnight shift by checking if end time is before start time
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    if ((endH * 60 + endM) <= (startH * 60 + startM)) {
      const nextDay = new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      endDateTime = `${nextDayStr}T${endTime}:00.000Z`;
    }

    const newShift: Shift = {
      id: 's_' + Date.now(),
      jobId: selectedJobId,
      status: 'completed',
      startDateTime,
      endDateTime,
      breakMinutes,
      bonuses: parseFloat(bonus) || 0,
    };
    if (notes && notes.trim()) {
      newShift.notes = notes.trim();
    }

    addShift(newShift);
    
    navigate('/shifts');
  };

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-[#f9f9ff] page-bg font-display overflow-x-hidden pb-24"
      dir="rtl"
    >
      <Header
        title="הוספת משמרת"
        showBack
        onBack={() => navigate('/')}
      />

      <main className="p-4 flex-1 flex flex-col gap-4 w-full max-w-md mx-auto">

        {/* Job selection card */}
        <div className="flex flex-col gap-2 rounded-xl bg-white card-component shadow-sm p-4 border border-gray-100">
          <p className="text-subtle-text-light dark:text-subtle-text-dark text-sm font-medium">בחר עבודה</p>
          <Select 
            value={selectedJobId} 
            onChange={(e) => handleJobChange(e.target.value)}
            className="w-full"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.jobName}{j.employerName && j.employerName !== 'עצמאי' ? ` (${j.employerName})` : ''}
              </option>
            ))}
          </Select>

          {job && (
            <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-gray-100 text-sm text-zinc-500">
              <p>שכר שעתי: ₪{job.hourlyWage.toFixed(2)}</p>
              <p>שעות נוספות אחרי: {job.overtimeStartsAfterHours > 0 ? `${job.overtimeStartsAfterHours} שעות` : 'לא מוגדר'}</p>
            </div>
          )}
        </div>

        {job && (
          <div className="grid grid-cols-2 gap-4">

            {/* Date Picker */}
            <button
              type="button"
              onClick={openDatePicker}
              className="col-span-2 bg-white card-component shadow-sm rounded-xl p-4 flex items-center justify-between border border-gray-100 cursor-pointer text-right hover:bg-gray-50 dark:hover:bg-[#1A2545]/50 transition-colors w-full focus:outline-none"
            >
              <div className="flex flex-col flex-1">
                <p className="text-zinc-400 dark:text-zinc-400 text-sm font-medium mb-1">
                  {isHebrew ? 'תאריך' : 'Date'}
                </p>
                <div className="text-lg font-bold text-primary">
                  {getFormattedDate(date, isHebrew)}
                </div>
              </div>
              <Icon name="calendar_today" size="3xl" className="text-primary dark:text-blue-400 mr-2 shrink-0" />
            </button>

            {/* Shift Hours Picker */}
            <button
              type="button"
              onClick={openUnifiedTimePicker}
              className="col-span-2 bg-white card-component shadow-sm rounded-xl p-4 flex items-center justify-between border border-gray-100 cursor-pointer text-right hover:bg-gray-50 dark:hover:bg-[#1A2545]/50 transition-colors w-full focus:outline-none"
            >
              <div className="flex flex-col flex-1">
                <p className="text-zinc-400 dark:text-zinc-400 text-sm font-medium mb-1">
                  {isHebrew ? 'שעות המשמרת (התחלה - סיום)' : 'Shift Hours (Start - End)'}
                </p>
                <div className="text-lg font-bold text-primary flex items-center gap-2 justify-end" dir="ltr">
                  <span>{startTime}</span>
                  <span className="text-zinc-400 dark:text-zinc-500 font-normal">→</span>
                  <span>{endTime}</span>
                </div>
              </div>
              <Icon name="schedule" size="3xl" className="text-primary dark:text-blue-400 mr-2 shrink-0" />
            </button>

            {/* Break */}
            <button
              type="button"
              onClick={openBreakPicker}
              className="bg-white card-component shadow-sm rounded-xl p-4 flex flex-col justify-between h-28 border border-gray-100 cursor-pointer text-right hover:bg-gray-50 dark:hover:bg-[#1A2545]/50 transition-colors focus:outline-none"
            >
              <p className="text-zinc-400 dark:text-zinc-400 text-sm font-medium">
                {isHebrew ? 'הפסקה (דקות)' : 'Break (minutes)'}
              </p>
              <div className="text-xl font-bold text-primary">
                {breakMinutes || 0}
              </div>
            </button>

            {/* Bonus */}
            <div className="bg-white card-component shadow-sm rounded-xl p-4 flex flex-col justify-between h-28 border border-gray-100">
              <p className="text-zinc-400 dark:text-zinc-400 text-sm font-medium">בונוסים</p>
              <input
                type="number"
                min={0}
                step="any"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                placeholder="₪0"
                className="bg-transparent border-none p-0 text-right text-xl font-bold text-primary focus:outline-none focus:ring-0 w-full"
=======
// @ts-nocheck
import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockJobs } from '../data/mock-data';
import { Icon } from '../components/ui/Icon';

export const AddShift: FC = () => {
  const navigate = useNavigate();

  // Get current date in YYYY-MM-DD format for default input value
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State values for form fields
  const [selectedJobId, setSelectedJobId] = useState(mockJobs[0].id);
  const [date, setDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:30');
  const [breakMinutes, setBreakMinutes] = useState(mockJobs[0].autoBreakMinutes || 60);
  const [bonuses, setBonuses] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const selectedJob = mockJobs.find(j => j.id === selectedJobId) || mockJobs[0];

  // Auto update break minutes when selected job changes
  useEffect(() => {
    setBreakMinutes(selectedJob.autoBreakMinutes || 0);
  }, [selectedJobId, selectedJob]);

  // Live Calculations
  const parseTimeToHours = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (isNaN(minutes) ? 0 : minutes) / 60;
  };

  const startHours = parseTimeToHours(startTime);
  const endHours = parseTimeToHours(endTime);
  
  let totalHoursRaw = endHours - startHours;
  if (totalHoursRaw < 0) {
    totalHoursRaw += 24; // Handles overnight shift
  }

  const breakHours = (Number(breakMinutes) || 0) / 60;
  const netHours = Math.max(0, totalHoursRaw - breakHours);

  const overtimeThreshold = selectedJob.overtimeStartsAfterHours || 8;
  const regularHours = Math.min(netHours, overtimeThreshold);
  const overtimeHours = Math.max(0, netHours - overtimeThreshold);

  const hourlyWage = selectedJob.hourlyWage;
  // Overtime multiplier: let's use 1.5 if overtime starts, which is standard in the original design and Israeli labor laws.
  const overtimeMultiplier = 1.5; 

  const regularPay = regularHours * hourlyWage;
  const overtimePay = overtimeHours * hourlyWage * overtimeMultiplier;
  const totalPay = regularPay + overtimePay + (Number(bonuses) || 0);

  // Form submit handler
  const handleSave = () => {
    setShowSuccessToast(true);
    setTimeout(() => {
      navigate('/');
    }, 1800);
  };

  return (
    <div dir="rtl" className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-light-blue dark:bg-background-dark font-display text-charcoal dark:text-white">
      
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-center animate-bounce">
          <div className="bg-success text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 font-bold">
            <Icon name="check_circle" />
            <span>המשמרת נשמרה בהצלחה!</span>
          </div>
        </div>
      )}

      {/* Header Sticky */}
      <div className="flex items-center bg-transparent p-4 pb-2 justify-between sticky top-0 z-10">
        <button 
          onClick={() => navigate('/')} 
          className="text-charcoal dark:text-white flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
          aria-label="Back to Dashboard"
        >
          <span className="material-symbols-outlined text-2xl">arrow_forward</span>
        </button>
        <h2 className="text-charcoal dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">הוספת משמרת</h2>
        <div className="w-10"></div>
      </div>

      <main className="p-4 flex-1">
        <div className="flex flex-col gap-4">
          
          {/* Job Selection Block */}
          <div className="flex flex-col items-stretch justify-start rounded-xl bg-card-bg-light dark:bg-card-bg-dark shadow-xs p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <p className="text-charcoal dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">בחר עבודה</p>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="bg-transparent text-primary dark:text-blue-400 font-bold border-none text-left outline-none focus:ring-0 focus:outline-none cursor-pointer"
              >
                {mockJobs.map(job => (
                  <option key={job.id} value={job.id} className="bg-white dark:bg-card-bg-dark text-charcoal dark:text-white">
                    {job.jobName} - {job.employerName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 border-t border-gray-100 dark:border-gray-800 pt-3">
              <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                שכר שעתי: ₪{hourlyWage.toFixed(2)}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                שעות נוספות (150%) אחרי {overtimeThreshold} שעות
              </p>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Date Picker */}
            <div className="col-span-2 bg-card-bg-light dark:bg-card-bg-dark shadow-xs rounded-xl p-4 flex items-center justify-between border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col flex-grow">
                <label className="text-gray-500 dark:text-gray-400 text-base font-medium leading-normal mb-1">תאריך</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 text-right text-xl font-bold text-primary dark:text-blue-400 focus:outline-none focus:ring-0 focus:border-0 cursor-pointer"
                />
              </div>
              <span className="material-symbols-outlined text-3xl text-primary dark:text-blue-400 ml-1">calendar_today</span>
            </div>

            {/* Start Time */}
            <div className="bg-card-bg-light dark:bg-card-bg-dark shadow-xs rounded-xl p-4 flex flex-col justify-between h-32 border border-gray-100 dark:border-gray-800">
              <label className="text-gray-500 dark:text-gray-400 text-base font-medium leading-normal">שעת התחלה</label>
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-right text-xl font-bold text-primary dark:text-blue-400 focus:outline-none focus:ring-0 focus:border-0 cursor-pointer"
              />
            </div>

            {/* End Time */}
            <div className="bg-card-bg-light dark:bg-card-bg-dark shadow-xs rounded-xl p-4 flex flex-col justify-between h-32 border border-gray-100 dark:border-gray-800">
              <label className="text-gray-500 dark:text-gray-400 text-base font-medium leading-normal">שעת סיום</label>
              <input 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-right text-xl font-bold text-primary dark:text-blue-400 focus:outline-none focus:ring-0 focus:border-0 cursor-pointer"
              />
            </div>

            {/* Break Time */}
            <div className="bg-card-bg-light dark:bg-card-bg-dark shadow-xs rounded-xl p-4 flex flex-col justify-between h-32 border border-gray-100 dark:border-gray-800">
              <label className="text-gray-500 dark:text-gray-400 text-base font-medium leading-normal">זמן הפסקה (דקות)</label>
              <input 
                type="number" 
                placeholder="0"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Math.max(0, Number(e.target.value)))}
                className="w-full bg-transparent border-0 p-0 text-right text-xl font-bold text-primary dark:text-blue-400 focus:outline-none focus:ring-0 focus:border-0"
              />
            </div>

            {/* Bonuses */}
            <div className="bg-card-bg-light dark:bg-card-bg-dark shadow-xs rounded-xl p-4 flex flex-col justify-between h-32 border border-gray-100 dark:border-gray-800">
              <label className="text-gray-500 dark:text-gray-400 text-base font-medium leading-normal">בונוסים</label>
              <input 
                type="number" 
                placeholder="₪0"
                value={bonuses}
                onChange={(e) => setBonuses(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-right text-xl font-bold text-primary dark:text-blue-400 focus:outline-none focus:ring-0 focus:border-0"
>>>>>>> Stashed changes
              />
            </div>

            {/* Notes */}
<<<<<<< Updated upstream
            <div className="col-span-2 bg-white card-component shadow-sm rounded-xl p-4 border border-gray-100">
              <p className="text-zinc-400 dark:text-zinc-400 text-sm font-medium">הערות</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות אופציונליות..."
                rows={2}
                className="bg-transparent border-none p-0 text-right text-base font-normal text-primary placeholder:text-blue-500 focus:outline-none focus:ring-0 w-full mt-2 resize-none"
              />
            </div>

            {/* Live summary */}
            {summary && (
              <div className="col-span-2 bg-white card-component p-4 rounded-xl flex flex-col gap-3 shadow-lg border border-primary/40">
                <h3 className="text-lg font-bold text-primary">סיכום משמרת</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col items-center p-2 rounded-lg bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-[#1E2D50]">
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">שעות נטו</p>
                    <p className="text-xl font-bold text-text-light dark:text-text-dark">{summary.netHours.toFixed(1)}</p>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-[#1E2D50]">
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">שעות נוספות</p>
                    <p className="text-xl font-bold text-text-light dark:text-text-dark">{summary.overtimeHours.toFixed(1)}</p>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-primary/20 border border-primary">
                    <p className="text-sm font-bold text-primary">סה"כ למשמרת</p>
                    <p className="text-xl font-extrabold text-primary">₪{summary.totalPay.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Save button */}
      <footer className="p-4 pt-2 fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark z-10 flex justify-center">
        <div className="w-full max-w-md">
          <button
            onClick={handleSave}
            disabled={!job}
            className="w-full h-14 bg-primary hover:bg-primary-hover text-black font-bold text-lg rounded-xl flex items-center justify-center shadow-sm transition-colors cursor-pointer disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            שמור משמרת
          </button>
        </div>
      </footer>

      {/* Custom Date Picker Modal */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#F2F7FF] dark:bg-[#0B1120] text-slate-800 dark:text-[#E8EFFF] overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 w-full bg-white/80 dark:bg-[#131D35]/80 backdrop-blur-md z-50 flex justify-center border-b border-gray-100 dark:border-[#1E2D50]">
            <div className="w-full max-w-md flex justify-between items-center px-4 h-16">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full active:opacity-70 transition-opacity hover:bg-gray-100 dark:hover:bg-[#1A2545]"
                >
                  <Icon name="close" className="text-primary text-2xl" />
                </button>
                <h1 className="font-title-md text-xl font-bold">{isHebrew ? 'בחירת תאריך' : 'Select Date'}</h1>
              </div>
              <div className="font-bold text-primary text-xl">PayShift</div>
            </div>
          </header>

          <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col gap-6">
            {/* Selection Preview Card */}
            <div className="bg-white dark:bg-[#131D35] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-[#1E2D50]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon name="calendar_month" className="text-primary font-bold" />
                </div>
                <div>
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs font-bold tracking-wider uppercase opacity-70">
                    {isHebrew ? 'התאריך שנבחר' : 'Selected Date'}
                  </p>
                  <p className="font-bold text-lg" id="selected-display">
                    {getFormattedDate(tempDate, isHebrew)}
                  </p>
                </div>
              </div>
            </div>

            {/* Calendar Component */}
            <div className="bg-white dark:bg-[#131D35] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-[#1E2D50] flex flex-col gap-6">
              {/* Month Header */}
              <div className="flex justify-between items-center mb-2">
                <button 
                  type="button"
                  onClick={() => {
                    // Previous month navigation
                    if (calendarMonth === 0) {
                      setCalendarMonth(11);
                      setCalendarYear(calendarYear - 1);
                    } else {
                      setCalendarMonth(calendarMonth - 1);
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1A2545] active:scale-95 transition-all text-primary"
                >
                  <Icon name={isHebrew ? 'chevron_right' : 'chevron_left'} />
                </button>
                <div className="text-center">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-[#E8EFFF]">
                    {isHebrew 
                      ? `${['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'][calendarMonth]} ${calendarYear}`
                      : `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][calendarMonth]} ${calendarYear}`
                    }
                  </h3>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    // Next month navigation
                    if (calendarMonth === 11) {
                      setCalendarMonth(0);
                      setCalendarYear(calendarYear + 1);
                    } else {
                      setCalendarMonth(calendarMonth + 1);
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1A2545] active:scale-95 transition-all text-primary"
                >
                  <Icon name={isHebrew ? 'chevron_left' : 'chevron_right'} />
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 text-center">
                {(isHebrew 
                  ? ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'] 
                  : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
                ).map((dayName, idx) => (
                  <div key={idx} className="text-zinc-400 dark:text-zinc-500 text-xs font-bold pb-2 opacity-70">
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                {/* Empty spaces at the start of the month */}
                {Array.from({ length: new Date(calendarYear, calendarMonth, 1).getDay() }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-10 w-full" />
                ))}

                {/* Date buttons */}
                {Array.from({ length: new Date(calendarYear, calendarMonth + 1, 0).getDate() }).map((_, idx) => {
                  const day = idx + 1;
                  const currentCellDate = toYYYYMMDD(new Date(calendarYear, calendarMonth, day));
                  const isSelected = tempDate === currentCellDate;

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => setTempDate(currentCellDate)}
                      className={`h-10 w-full flex items-center justify-center rounded-xl text-base font-semibold transition-all active:scale-90 ${
                        isSelected 
                          ? 'bg-primary text-white shadow-md shadow-primary/20 scale-95' 
                          : 'text-slate-800 dark:text-[#E8EFFF] hover:bg-gray-100 dark:hover:bg-[#1A2545]'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Select Options */}
            <div className="flex flex-wrap gap-2 justify-center">
              {/* Today */}
              <button
                type="button"
                onClick={() => {
                  const todayStr = toYYYYMMDD(new Date());
                  setTempDate(todayStr);
                  const todayD = parseLocalDate(todayStr);
                  setCalendarMonth(todayD.getMonth());
                  setCalendarYear(todayD.getFullYear());
                }}
                className="px-4 py-2 rounded-full border border-primary/20 text-primary hover:bg-primary/5 transition-colors font-medium text-sm"
              >
                {isHebrew ? 'היום' : 'Today'}
              </button>

              {/* Yesterday */}
              <button
                type="button"
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  const yesterdayStr = toYYYYMMDD(yesterday);
                  setTempDate(yesterdayStr);
                  const yesterdayD = parseLocalDate(yesterdayStr);
                  setCalendarMonth(yesterdayD.getMonth());
                  setCalendarYear(yesterdayD.getFullYear());
                }}
                className="px-4 py-2 rounded-full border border-primary/20 text-primary hover:bg-primary/5 transition-colors font-medium text-sm"
              >
                {isHebrew ? 'אתמול' : 'Yesterday'}
              </button>

              {/* Previous Shift */}
              {(() => {
                const sortedShifts = [...shifts].sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());
                const latestShift = sortedShifts.find(s => s.jobId === selectedJobId) || sortedShifts[0];
                if (!latestShift) return null;

                const prevShiftDate = latestShift.startDateTime.split('T')[0];

                return (
                  <button
                    type="button"
                    onClick={() => {
                      setTempDate(prevShiftDate);
                      const prevD = parseLocalDate(prevShiftDate);
                      setCalendarMonth(prevD.getMonth());
                      setCalendarYear(prevD.getFullYear());
                    }}
                    className="px-4 py-2 rounded-full border border-primary/20 text-primary hover:bg-primary/5 transition-colors font-medium text-sm"
                  >
                    {isHebrew ? 'המשמרת הקודמת' : 'Previous Shift'}
                  </button>
                );
              })()}
            </div>
          </main>

          {/* Footer Actions (Glassmorphic) */}
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/70 dark:bg-[#131D35]/70 backdrop-blur-md flex justify-center border-t border-gray-100 dark:border-[#1E2D50] z-50">
            <div className="w-full max-w-md flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setDate(tempDate);
                  setIsDatePickerOpen(false);
                }}
                className="flex-1 h-14 bg-primary text-white rounded-[16px] font-bold text-lg hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                {isHebrew ? 'שמירה' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(false)}
                className="flex-1 h-14 bg-primary/10 text-primary rounded-[16px] font-bold text-lg hover:bg-primary/15 active:scale-95 transition-all"
              >
                {isHebrew ? 'ביטול' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Time Picker Modal */}
      {isTimePickerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#F2F7FF] dark:bg-[#0B1120] text-slate-800 dark:text-[#E8EFFF] overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 w-full bg-white/80 dark:bg-[#131D35]/80 backdrop-blur-md z-50 flex justify-center border-b border-gray-100 dark:border-[#1E2D50]">
            <div className="w-full max-w-md flex justify-between items-center px-4 h-16">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setIsTimePickerOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full active:opacity-70 transition-opacity hover:bg-gray-100 dark:hover:bg-[#1A2545]"
                >
                  <Icon name="close" className="text-primary text-2xl" />
                </button>
                <h1 className="font-title-md text-xl font-bold">
                  {isHebrew ? 'בחירת שעות המשמרת' : 'Select Shift Hours'}
                </h1>
              </div>
              <div className="font-bold text-primary text-xl">PayShift</div>
            </div>
          </header>

          <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col gap-6">
            {/* Selection Preview Card */}
            <div className="bg-white dark:bg-[#131D35] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-[#1E2D50]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon name="schedule" className="text-primary font-bold" />
                  </div>
                  <div>
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs font-bold tracking-wider uppercase opacity-70">
                      {isHebrew ? 'משך המשמרת' : 'Shift Duration'}
                    </p>
                    <p className="font-bold text-lg">
                      {getTempDurationText()}
                    </p>
                  </div>
                </div>
                {/* Live display of start and end times */}
                <div className="flex items-center gap-2 text-sm font-extrabold" dir="ltr">
                  <span className={activeTimeField === 'start' ? 'text-primary underline decoration-2 underline-offset-4' : 'text-zinc-400 dark:text-zinc-500'}>
                    {String(tempStartHour).padStart(2, '0')}:{String(tempStartMinute).padStart(2, '0')}
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-600">→</span>
                  <span className={activeTimeField === 'end' ? 'text-primary underline decoration-2 underline-offset-4' : 'text-zinc-400 dark:text-zinc-500'}>
                    {String(tempEndHour).padStart(2, '0')}:{String(tempEndMinute).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle tabs */}
            <div className="flex bg-white dark:bg-[#131D35] p-1.5 rounded-2xl w-full max-w-xs mx-auto border border-gray-100 dark:border-[#1E2D50] shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTimeField('start')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl active:scale-95 transition-all ${
                  activeTimeField === 'start'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-primary'
                }`}
              >
                {isHebrew ? 'שעת התחלה' : 'Start Time'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTimeField('end')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl active:scale-95 transition-all ${
                  activeTimeField === 'end'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-primary'
                }`}
              >
                {isHebrew ? 'שעת סיום' : 'End Time'}
              </button>
            </div>

            {/* Time Adjuster Component (Forced LTR to make Hours left / Minutes right) */}
            <div className="bg-white dark:bg-[#131D35] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-[#1E2D50] flex flex-col items-center gap-6">
              <div className="flex items-center justify-center gap-6 select-none" dir="ltr">
                {/* Hours Block */}
                <div className="flex flex-col items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setActiveHour((prev) => (prev + 1) % 24)}
                    className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center active:scale-90 transition-all"
                  >
                    <Icon name="expand_less" size="3xl" />
                  </button>
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-[#1A2545] border border-gray-100 dark:border-[#1E2D50] flex items-center justify-center text-4xl font-extrabold text-slate-800 dark:text-[#E8EFFF]">
                    {String(activeHour).padStart(2, '0')}
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveHour((prev) => (prev + 23) % 24)}
                    className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center active:scale-90 transition-all"
                  >
                    <Icon name="expand_more" size="3xl" />
                  </button>
                </div>

                {/* Colon */}
                <div className="text-4xl font-black text-primary select-none">:</div>

                {/* Minutes Block */}
                <div className="flex flex-col items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setActiveMinute((prev) => (prev + 1) % 60)}
                    className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center active:scale-90 transition-all"
                  >
                    <Icon name="expand_less" size="3xl" />
                  </button>
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-[#1A2545] border border-gray-100 dark:border-[#1E2D50] flex items-center justify-center text-4xl font-extrabold text-slate-800 dark:text-[#E8EFFF]">
                    {String(activeMinute).padStart(2, '0')}
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveMinute((prev) => (prev + 59) % 60)}
                    className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center active:scale-90 transition-all"
                  >
                    <Icon name="expand_more" size="3xl" />
                  </button>
                </div>
              </div>

              {/* Quick Adjustment Buttons */}
              <div className="w-full flex flex-col gap-2 mt-2">
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold self-start px-1">
                  {isHebrew ? 'התאמה מהירה' : 'Quick Adjust'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: isHebrew ? '+1 שעה' : '+1 Hr', val: 60 },
                    { label: isHebrew ? '+30 דק\'' : '+30 Min', val: 30 },
                    { label: isHebrew ? '+15 דק\'' : '+15 Min', val: 15 },
                    { label: isHebrew ? '-1 שעה' : '-1 Hr', val: -60 },
                    { label: isHebrew ? '-30 דק\'' : '-30 Min', val: -30 },
                    { label: isHebrew ? '-15 דק\'' : '-15 Min', val: -15 },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        let totalMin = activeHour * 60 + activeMinute + btn.val;
                        if (totalMin < 0) totalMin += 24 * 60;
                        totalMin = totalMin % (24 * 60);
                        setActiveHour(Math.floor(totalMin / 60));
                        setActiveMinute(totalMin % 60);
                      }}
                      className="py-2.5 rounded-xl border border-primary/20 text-primary hover:bg-primary/5 active:scale-95 transition-all text-xs font-semibold bg-white dark:bg-[#131D35]"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Presets */}
              <div className="w-full flex flex-col gap-2 mt-2">
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold self-start px-1">
                  {isHebrew ? 'שעות נפוצות' : 'Common Times'}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {['08:00', '09:00', '15:00', '16:00', '17:00', '18:00', '23:00', '00:00'].map((timePreset) => (
                    <button
                      key={timePreset}
                      type="button"
                      onClick={() => {
                        const [h, m] = timePreset.split(':').map(Number);
                        setActiveHour(h);
                        setActiveMinute(m);
                      }}
                      className="py-2.5 rounded-xl bg-gray-50 dark:bg-[#1A2545] border border-gray-100 dark:border-[#1E2D50] text-slate-700 dark:text-[#E8EFFF] hover:bg-gray-100 dark:hover:bg-[#2A3A60] active:scale-95 transition-all text-xs font-bold"
                    >
                      {timePreset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Footer Actions (Glassmorphic) */}
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/70 dark:bg-[#131D35]/70 backdrop-blur-md flex justify-center border-t border-gray-100 dark:border-[#1E2D50] z-50">
            <div className="w-full max-w-md flex gap-4">
              <button
                type="button"
                onClick={() => {
                  const startStr = `${String(tempStartHour).padStart(2, '0')}:${String(tempStartMinute).padStart(2, '0')}`;
                  const endStr = `${String(tempEndHour).padStart(2, '0')}:${String(tempEndMinute).padStart(2, '0')}`;
                  setStartTime(startStr);
                  setEndTime(endStr);
                  setIsTimePickerOpen(false);
                }}
                className="flex-1 h-14 bg-primary text-white rounded-[16px] font-bold text-lg hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                {isHebrew ? 'שמירה' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setIsTimePickerOpen(false)}
                className="flex-1 h-14 bg-primary/10 text-primary rounded-[16px] font-bold text-lg hover:bg-primary/15 active:scale-95 transition-all"
              >
                {isHebrew ? 'ביטול' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Break Picker Modal */}
      {isBreakPickerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#F2F7FF] dark:bg-[#0B1120] text-slate-800 dark:text-[#E8EFFF] overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 w-full bg-white/80 dark:bg-[#131D35]/80 backdrop-blur-md z-50 flex justify-center border-b border-gray-100 dark:border-[#1E2D50]">
            <div className="w-full max-w-md flex justify-between items-center px-4 h-16">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setIsBreakPickerOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full active:opacity-70 transition-opacity hover:bg-gray-100 dark:hover:bg-[#1A2545]"
                >
                  <Icon name="close" className="text-primary text-2xl" />
                </button>
                <h1 className="font-title-md text-xl font-bold">
                  {isHebrew ? 'הפסקה (דקות)' : 'Break (minutes)'}
                </h1>
              </div>
              <div className="font-bold text-primary text-xl">PayShift</div>
            </div>
          </header>

          <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col items-center gap-6">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center">
              {isHebrew ? 'הגדר את זמן ההפסקה בדקות' : 'Set break duration in minutes'}
            </p>
            <div className="flex items-baseline gap-2 mb-2 bg-[#f1f3fe] dark:bg-[#1A2545] px-6 py-2 rounded-xl border border-gray-100 dark:border-[#1E2D50]">
              <span className="text-4xl font-extrabold text-primary">{tempBreakInput || '0'}</span>
              <span className="text-lg font-bold text-zinc-500 dark:text-zinc-400">
                {isHebrew ? 'דקות' : 'minutes'}
              </span>
            </div>
            
            <div className="flex gap-2 w-full max-w-[280px] justify-between mb-2">
              {[15, 30, 45, 60].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTempBreakInput(val.toString())}
                  className="px-3.5 py-1.5 rounded-full border border-gray-300 dark:border-[#1E2D50] text-sm text-text-light dark:text-text-dark hover:bg-primary/10 hover:border-primary active:scale-95 transition-all cursor-pointer bg-white dark:bg-[#131D35]"
                >
                  {val} {isHebrew ? 'דק\'' : 'min'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleBreakKeypress(num)}
                  className="h-12 rounded-xl bg-white dark:bg-[#1A2545] border border-gray-200 dark:border-[#1E2D50] hover:bg-[#e4e7f8] dark:hover:bg-[#2A3A60] text-lg font-bold text-text-light dark:text-text-dark active:scale-95 transition-transform cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleBreakKeypress('.')}
                className="h-12 rounded-xl bg-white dark:bg-[#1A2545] border border-gray-200 dark:border-[#1E2D50] hover:bg-[#e4e7f8] dark:hover:bg-[#2A3A60] text-lg font-bold text-text-light dark:text-text-dark active:scale-95 transition-transform cursor-pointer"
              >
                .
              </button>
              <button
                type="button"
                onClick={() => handleBreakKeypress('0')}
                className="h-12 rounded-xl bg-white dark:bg-[#1A2545] border border-gray-200 dark:border-[#1E2D50] hover:bg-[#e4e7f8] dark:hover:bg-[#2A3A60] text-lg font-bold text-text-light dark:text-text-dark active:scale-95 transition-transform cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleBreakKeypress('delete')}
                className="h-12 rounded-xl bg-white dark:bg-[#1A2545] border border-gray-200 dark:border-[#1E2D50] hover:bg-[#e4e7f8] dark:hover:bg-[#2A3A60] flex items-center justify-center text-text-light dark:text-text-dark active:scale-95 transition-transform cursor-pointer"
              >
                <Icon name="backspace" size="xl" />
              </button>
            </div>
          </main>

          {/* Footer Actions */}
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/70 dark:bg-[#131D35]/70 backdrop-blur-md flex justify-center border-t border-gray-100 dark:border-[#1E2D50] z-50">
            <div className="w-full max-w-md flex gap-4">
              <button
                type="button"
                onClick={saveBreakPicker}
                className="flex-1 h-14 bg-primary text-white rounded-[16px] font-bold text-lg hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                {isHebrew ? 'שמירה' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setIsBreakPickerOpen(false)}
                className="flex-1 h-14 bg-primary/10 text-primary rounded-[16px] font-bold text-lg hover:bg-primary/15 active:scale-95 transition-all"
              >
                {isHebrew ? 'ביטול' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
=======
            <div className="col-span-2 bg-card-bg-light dark:bg-card-bg-dark shadow-xs rounded-xl p-4 border border-gray-100 dark:border-gray-800">
              <label className="text-gray-500 dark:text-gray-400 text-base font-medium leading-normal">הערות</label>
              <textarea 
                placeholder="הערות אופציונליות..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-right text-base font-normal text-charcoal dark:text-white mt-2 resize-none h-16 focus:outline-none focus:ring-0 focus:border-0"
              />
            </div>

          </div>

          {/* Shift Summary Box */}
          <div className="bg-primary/95 dark:bg-blue-600 p-4 rounded-xl flex flex-col gap-3 text-white shadow-lg">
            <h3 className="text-lg font-bold">סיכום משמרת</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              
              <div className="flex flex-col items-center p-2 rounded-lg bg-white/20">
                <p className="text-blue-100 text-sm font-medium">שעות נטו</p>
                <p className="text-xl font-bold">{netHours.toFixed(2)}</p>
              </div>

              <div className="flex flex-col items-center p-2 rounded-lg bg-white/20">
                <p className="text-blue-100 text-sm font-medium">שעות נוספות</p>
                <p className="text-xl font-bold">{overtimeHours.toFixed(2)}</p>
              </div>

              <div className="flex flex-col items-center p-2 rounded-lg bg-white text-primary">
                <p className="text-sm font-bold">סה"כ למשמרת</p>
                <p className="text-xl font-extrabold">₪{totalPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer Sticky with Save Button */}
      <footer className="p-4 pt-2 sticky bottom-0 bg-light-blue dark:bg-background-dark">
        <button 
          onClick={handleSave}
          className="w-full h-16 bg-card-bg-light dark:bg-card-bg-dark text-primary dark:text-blue-300 font-bold text-xl rounded-xl flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer border border-gray-200 dark:border-gray-700"
        >
          שמור משמרת
        </button>
      </footer>

>>>>>>> Stashed changes
    </div>
  );
};
