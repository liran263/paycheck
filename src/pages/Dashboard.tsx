// @ts-nocheck
import { FC } from 'react';
import { mockUser, mockJobs, mockMonthlySummary } from '../data/mock-data';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { Header } from '../components/ui/Header';
import { BottomNav } from '../components/ui/BottomNav';

export const Dashboard: FC = () => {
  const currentJob = mockJobs[0]; // Currently mocking the default selected job
  const currentSummary = mockMonthlySummary.find(s => s.jobId === currentJob.id);

  // Fallbacks if no summary is found for the mock month
  const totalPay = currentSummary?.totalPay || 0;
  const shiftCount = currentSummary?.shiftCount || 0;
  const totalHours = currentSummary?.totalHours || 0;
  const totalBonuses = currentSummary?.totalBonuses || 0;

  const headerRightAction = (
    <button 
      aria-label="Menu" 
      className="text-text-light dark:text-text-dark flex size-12 shrink-0 items-center justify-center"
    >
      <Icon name="account_circle" size="3xl" />
    </button>
  );

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      
      {/* Title Header area modified to match design Dropdown */}
      <Header 
        rightAction={headerRightAction}
        title=""
      />
      {/* Absolute positioning trick to put the custom job selector in the center/left where Header title usually is */}
      <div className="absolute top-0 left-4 h-[60px] flex items-center z-20 pointer-events-none">
         <div className="relative pointer-events-auto">
          <button className="flex items-center gap-1 text-primary">
            <span className="text-xl font-bold leading-normal tracking-[0.015em]">{currentJob.jobName}</span>
            <Icon name="expand_more" />
          </button>
        </div>
      </div>

      <main className="flex-grow p-4 pb-24 /* Padding for bottom nav */">
        <div className="grid grid-cols-2 gap-4">
          
          {/* Add Shift Tile */}
          <div className="bg-primary text-white p-4 rounded-2xl aspect-square flex flex-col justify-between cursor-pointer hover:bg-primary/90 transition-colors shadow-sm">
            <div>
              <div className="bg-white/20 rounded-full size-12 flex items-center justify-center">
                <Icon name="add" size="3xl" />
              </div>
            </div>
            <p className="text-lg font-bold">Add Shift</p>
          </div>

          {/* Hourly Wage Tile */}
          <Card padding="md" className="rounded-2xl aspect-square flex flex-col justify-between">
            <div>
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-12 flex items-center justify-center">
                <Icon name="payments" size="3xl" className="text-primary" />
              </div>
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-normal">Hourly Wage</p>
              <p className="text-lg font-bold text-text-light dark:text-text-dark">₪{currentJob.hourlyWage.toFixed(2)}</p>
            </div>
          </Card>

          {/* Overtime Tile */}
          <Card padding="md" className="rounded-2xl aspect-square flex flex-col justify-between">
            <div>
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-12 flex items-center justify-center">
                <Icon name="schedule" size="3xl" className="text-primary" />
              </div>
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-normal">Overtime</p>
              <p className="text-lg font-bold text-text-light dark:text-text-dark">From {currentJob.overtimeStartsAfterHours} hrs</p>
            </div>
          </Card>

          {/* Bonuses Tile */}
           <Card padding="md" className="rounded-2xl aspect-square flex flex-col justify-between cursor-pointer">
            <div>
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-12 flex items-center justify-center">
                <Icon name="star" size="3xl" className="text-primary" />
              </div>
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-normal">Bonuses</p>
              <p className="text-lg font-bold text-text-light dark:text-text-dark">View Rules</p>
            </div>
          </Card>

          {/* This Month Wide Tile */}
          <Card padding="md" className="col-span-2 rounded-2xl flex flex-col justify-between cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 dark:bg-primary/20 rounded-full size-12 flex items-center justify-center">
                  <Icon name="calendar_today" size="3xl" className="text-primary" />
                </div>
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-normal">This Month</p>
                  <p className="text-lg font-bold text-text-light dark:text-text-dark">₪ {totalPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              <Icon name="chevron_right" className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="flex justify-around text-center mt-4 text-text-light dark:text-text-dark">
              <div>
                <p className="font-bold text-lg">{shiftCount}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Shifts</p>
              </div>
              <div>
                <p className="font-bold text-lg">{totalHours}h</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Hours</p>
              </div>
              <div>
                <p className="font-bold text-lg">₪{totalBonuses}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Bonuses</p>
              </div>
            </div>
          </Card>

        </div>
      </main>

      {/* Wrapping the existing BottomNav with a wrapper to fix it perfectly to bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav 
          items={[
            { id: '1', icon: 'home', label: 'Home', active: true },
            { id: '2', icon: 'list_alt', label: 'Shifts' },
            { id: '3', icon: 'pie_chart', label: 'Reports' },
            { id: '4', icon: 'settings', label: 'Settings' },
          ]}
        />
      </div>
    </div>
  );
};
