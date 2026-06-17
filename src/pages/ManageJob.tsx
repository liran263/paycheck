import { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Header } from '../components/ui/Header';
import { Icon } from '../components/ui/Icon';
import { useAppSettings } from '../context/AppContext';

export const ManageJob: FC = () => {
  const navigate = useNavigate();
  const { language } = useAppSettings();

  const { jobs, updateJob, deleteJob } = useData();

  // Load jobs and find active job
  const activeJobId = localStorage.getItem('paycheck_active_job_id');
  const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0];

  const [jobName, setJobName] = useState(activeJob ? activeJob.jobName : '');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Localization strings
  const labels = {
    title: language === 'he' ? 'ניהול עבודה' : 'Manage Job',
    renameCard: language === 'he' ? 'עריכת שם העבודה' : 'Rename Job',
    jobNameLabel: language === 'he' ? 'שם העבודה הנוכחי' : 'Current Job Name',
    saveName: language === 'he' ? 'שמור שם חדש' : 'Save New Name',
    nameSuccess: language === 'he' ? 'השם עודכן בהצלחה!' : 'Name updated successfully!',
    addNewJobCard: language === 'he' ? 'הוספת עבודה חדשה' : 'Add New Job',
    addNewJobDesc: language === 'he' ? 'צור עבודה חדשה נוספת עם הגדרות שכר והפסקות משלה.' : 'Create another job with its own wage and break settings.',
    addNewJobBtn: language === 'he' ? 'הוסף עבודה חדשה' : 'Add New Job',
    deleteCard: language === 'he' ? 'אזור מסוכן - מחיקת עבודה' : 'Danger Zone - Delete Job',
    deleteDesc: language === 'he' ? 'מחיקת העבודה תמחוק לצמיתות את כל המשמרות והנתונים המשויכים אליה. פעולה זו אינה הפיכה!' : 'Deleting the job will permanently remove all associated shifts and data. This action is irreversible!',
    deleteBtn: language === 'he' ? 'מחק עבודה זו' : 'Delete This Job',
    confirmDeleteTitle: language === 'he' ? 'האם אתה בטוח שברצונך למחוק?' : 'Are you sure you want to delete?',
    confirmDeleteDesc: language === 'he' ? `העבודה "${activeJob?.jobName}" וכל המשמרות שלה יימחקו לצמיתות.` : `The job "${activeJob?.jobName}" and all of its shifts will be permanently deleted.`,
    cancel: language === 'he' ? 'ביטול' : 'Cancel',
    confirm: language === 'he' ? 'כן, מחק עבודה' : 'Yes, Delete Job',
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName.trim() || !activeJob) return;

    updateJob({ ...activeJob, jobName: jobName.trim() });
    alert(labels.nameSuccess);
    navigate('/');
  };

  const handleDelete = () => {
    if (!activeJob) return;

    // Delete job (which deletes the job and its shifts in Firestore)
    deleteJob(activeJob.id);

    // Update active job in localStorage to the first remaining one
    const updatedJobs = jobs.filter(j => j.id !== activeJob.id);
    if (updatedJobs.length > 0) {
      localStorage.setItem('paycheck_active_job_id', updatedJobs[0].id);
    } else {
      localStorage.removeItem('paycheck_active_job_id');
    }

    setShowConfirmDelete(false);
    navigate('/');
  };

  if (!activeJob) {
    return (
      <div className="p-4 text-center">
        <p>לא נמצאה עבודה פעילה.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary">חזור לבית</button>
      </div>
    );
  }

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

      <main className="p-4 flex-1 flex flex-col max-w-lg mx-auto w-full gap-5">
        
        {/* Rename Card */}
        <div className="bg-white card-component shadow-sm rounded-xl p-5 border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Icon name="edit" className="text-primary" />
            <h3 className="font-bold text-text-light dark:text-text-dark text-base">{labels.renameCard}</h3>
          </div>
          
          <form onSubmit={handleRename} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{labels.jobNameLabel}</label>
              <input
                required
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                className="w-full bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary text-text-light dark:text-text-dark font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-1 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg transition-all active:scale-98 cursor-pointer"
            >
              {labels.saveName}
            </button>
          </form>
        </div>

        {/* Add New Job Card */}
        <div className="bg-white card-component shadow-sm rounded-xl p-5 border border-gray-100 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Icon name="add_circle" className="text-primary" />
            <h3 className="font-bold text-text-light dark:text-text-dark text-base">{labels.addNewJobCard}</h3>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{labels.addNewJobDesc}</p>
          <button
            onClick={() => navigate('/add-job')}
            className="w-full py-3 bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 text-text-light dark:text-text-dark font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Icon name="add" />
            {labels.addNewJobBtn}
          </button>
        </div>

        {/* Delete Card */}
        <div className="bg-white card-component shadow-sm rounded-xl p-5 border border-red-200 dark:border-red-900/30 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Icon name="delete_forever" className="text-red-500" />
            <h3 className="font-bold text-red-500 text-base">{labels.deleteCard}</h3>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{labels.deleteDesc}</p>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 font-bold rounded-lg transition-all active:scale-98 cursor-pointer"
          >
            {labels.deleteBtn}
          </button>
        </div>

      </main>

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131D35] w-full max-w-sm rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-[#1E2D50] flex flex-col gap-4 text-center">
            <Icon name="warning" className="text-amber-500 mx-auto" size="4xl" />
            <h4 className="text-lg font-bold text-text-light dark:text-text-dark">{labels.confirmDeleteTitle}</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{labels.confirmDeleteDesc}</p>
            
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-[#1A2545] text-text-light dark:text-text-dark font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all cursor-pointer"
              >
                {labels.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all cursor-pointer shadow-md"
              >
                {labels.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
