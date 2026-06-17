import { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { Icon } from '../components/ui/Icon';
import { useAppSettings } from '../context/AppContext';
import { useData } from '../context/DataContext';
import type { Job } from '../types';

export const AddJob: FC = () => {
  const navigate = useNavigate();
  const { language } = useAppSettings();
  const { addJob } = useData();

  // Form states
  const [jobName, setJobName] = useState('');
  const [hourlyWage, setHourlyWage] = useState('40');
  const [otEnabled, setOtEnabled] = useState(true);
  const [otHours, setOtHours] = useState(8);
  const [otPercentage, setOtPercentage] = useState(125);
  const [travelExpenses, setTravelExpenses] = useState('0');
  const [autoBreakMinutes, setAutoBreakMinutes] = useState('30');
  const [paymentCycleStartDate, setPaymentCycleStartDate] = useState(1);

  // Localization strings
  const labels = {
    title: language === 'he' ? 'הוספת עבודה חדשה' : 'Add New Job',
    jobName: language === 'he' ? 'שם העבודה' : 'Job Name',
    jobNamePlaceholder: language === 'he' ? 'לדוגמה: ברמן קבוע' : 'e.g. Regular Bartender',
    hourlyWage: language === 'he' ? 'שכר שעתי (₪)' : 'Hourly Wage (₪)',
    overtime: language === 'he' ? 'שעות נוספות' : 'Overtime',
    enableOvertime: language === 'he' ? 'הפעל חישוב שעות נוספות' : 'Enable Overtime calculation',
    overtimeThreshold: language === 'he' ? 'שעות נוספות מתחילות אחרי' : 'Overtime starts after',
    hours: language === 'he' ? 'שעות' : 'hours',
    overtimeRate: language === 'he' ? 'תעריף שעות נוספות' : 'Overtime Rate',
    travelExpenses: language === 'he' ? 'נסיעות (₪)' : 'Daily Travel Expenses (₪)',
    autoBreak: language === 'he' ? 'הפסקה (דקות)' : 'Break (minutes)',
    cycleStart: language === 'he' ? 'יום תחילת מחזור תשלום' : 'Payment Cycle Start Day',
    cycleStartDesc: language === 'he' ? 'יום בחודש שבו מתחיל חישוב השכר (1-31)' : 'Day of month wage calculation starts (1-31)',
    save: language === 'he' ? 'צור עבודה' : 'Create Job',
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName.trim()) return;

    const newJob: Omit<Job, 'userId'> = {
      id: 'j_' + Date.now(),
      jobName: jobName.trim(),
      employerName: 'עצמאי',
      hourlyWage: parseFloat(hourlyWage) || 0,
      overtimeStartsAfterHours: otEnabled ? Number(otHours) : 0,
      overtimePercentage: otEnabled ? Number(otPercentage) : 125,
      travelExpenses: parseFloat(travelExpenses) || 0,
      travelMode: 'per_shift' as const,
      autoBreakMinutes: parseFloat(autoBreakMinutes) || 0,
      paymentCycleStartDate: Number(paymentCycleStartDate) || 1,
      remindersEnabled: false,
    };

    addJob(newJob);

    navigate('/');
  };

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-[#f9f9ff] page-bg font-display overflow-x-hidden pb-24"
      dir={language === 'he' ? 'rtl' : 'ltr'}
      style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}
    >
      <Header
        title={labels.title}
        showBack
        onBack={() => navigate('/')}
      />

      <main className="p-4 flex-1 flex flex-col max-w-lg mx-auto w-full">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          
          {/* General Details Card */}
          <div className="bg-white card-component shadow-sm rounded-xl p-5 border border-gray-100 flex flex-col gap-4">
            {/* Job Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{labels.jobName}</label>
              <input
                required
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder={labels.jobNamePlaceholder}
                className="w-full bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary text-text-light dark:text-text-dark font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
            </div>

            {/* Hourly Wage */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{labels.hourlyWage}</label>
              <input
                required
                type="number"
                min="0"
                step="any"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(e.target.value)}
                className="w-full bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary text-text-light dark:text-text-dark font-extrabold text-lg"
              />
            </div>
          </div>

          {/* Overtime Card */}
          <div className="bg-white card-component shadow-sm rounded-xl p-5 border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-text-light dark:text-text-dark text-base">{labels.overtime}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{labels.enableOvertime}</span>
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
              <div className="flex flex-col gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-text-light dark:text-text-dark text-sm">{labels.overtimeThreshold}</span>
                    <span className="text-base font-extrabold text-primary">{otHours} {labels.hours}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="0.5"
                    value={otHours}
                    onChange={(e) => setOtHours(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-text-light dark:text-text-dark text-sm">{labels.overtimeRate}</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[125, 150, 175, 200].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setOtPercentage(pct)}
                        className={`py-2 rounded-lg font-bold text-sm border active:scale-95 transition-all cursor-pointer ${
                          otPercentage === pct
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-[#f1f3fe] dark:bg-[#1A2545] text-text-light dark:text-text-dark border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Expenses & Break Card */}
          <div className="bg-white card-component shadow-sm rounded-xl p-5 border border-gray-100 flex flex-col gap-4">
            {/* Travel Expenses */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{labels.travelExpenses}</label>
              <input
                type="number"
                min="0"
                step="any"
                value={travelExpenses}
                onChange={(e) => setTravelExpenses(e.target.value)}
                className="w-full bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary text-text-light dark:text-text-dark font-bold text-base"
              />
            </div>

            {/* Break Minutes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{labels.autoBreak}</label>
              <input
                type="number"
                min="0"
                step="any"
                value={autoBreakMinutes}
                onChange={(e) => setAutoBreakMinutes(e.target.value)}
                className="w-full bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary text-text-light dark:text-text-dark font-bold text-base"
              />
            </div>
          </div>

          {/* Cycle Card */}
          <div className="bg-white card-component shadow-sm rounded-xl p-5 border border-gray-100 flex flex-col gap-4">
            {/* Payment Cycle Day */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{labels.cycleStart}</label>
              <input
                type="number"
                min="1"
                max="31"
                value={paymentCycleStartDate}
                onChange={(e) => setPaymentCycleStartDate(Number(e.target.value))}
                className="w-full bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary text-text-light dark:text-text-dark font-bold text-base"
              />
              <span className="text-xs text-zinc-400 mt-0.5">{labels.cycleStartDesc}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 py-4 bg-primary hover:bg-primary/95 text-white font-bold text-lg rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Icon name="add" size="xl" />
            {labels.save}
          </button>

        </form>
      </main>
    </div>
  );
};
