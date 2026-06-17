import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { BottomNav } from '../components/ui/BottomNav';
import { Avatar } from '../components/ui/Avatar';
import { useAppSettings } from '../context/AppContext';
import { useTranslations } from '../i18n/translations';
import { useAuth } from '../context/DataContext';

export const Settings: FC = () => {
  const navigate = useNavigate();
  const { theme, language, setTheme, setLanguage } = useAppSettings();
  const { user, logout } = useAuth();
  const t = useTranslations();
  const s = t.settings;
  const nav = t.nav;

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-[#f9f9ff] page-bg font-display overflow-x-hidden pb-24"
      dir={language === 'he' ? 'rtl' : 'ltr'}
      style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}
    >
      <Header
        title={s.title}
      />

      <main className="flex-grow px-4 pt-2 space-y-8 max-w-2xl mx-auto w-full">

        {/* ── User Profile Section ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-indigo-600 text-white rounded-3xl p-6 shadow-md border-0 flex items-center justify-between transition-all duration-300 hover:shadow-lg">
          {/* Decorative background shapes */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4 z-10">
            <div className="relative">
              <Avatar 
                src={user?.profilePictureUrl || ''} 
                size="lg" 
                className="border-2 border-white/50 shadow-inner bg-white/10 dark:bg-white/10" 
              />
              <span className="absolute bottom-0 end-0 size-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-wide leading-tight">{user?.name || (language === 'he' ? 'משתמש' : 'User')}</span>
              <span className="text-sm text-indigo-100/90 font-medium flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">mail</span>
                {user?.email}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/edit-profile')}
            className="z-10 flex items-center justify-center size-11 rounded-full bg-white/15 hover:bg-white/25 border border-white/15 text-white active:scale-95 transition-all cursor-pointer shadow-sm backdrop-blur-sm"
            title={language === 'he' ? 'ערוך פרופיל' : 'Edit Profile'}
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
        </section>

        {/* ── Appearance ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              palette
            </span>
            <h2 className="text-lg font-bold text-[#1C1C1E]">{s.appearance}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Light Mode */}
            <button
              onClick={() => setTheme('light')}
              className={`bg-white p-3 rounded-xl flex flex-col items-center gap-3 border-2 transition-all duration-300 active:scale-95 cursor-pointer ${
                theme === 'light' ? 'border-primary shadow-md shadow-primary/10' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-full aspect-[4/3] bg-[#f9f9ff] rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                <div className="w-2/3 h-1/2 bg-white rounded shadow-sm flex flex-col p-2 gap-1">
                  <div className="h-1 w-full bg-primary/20 rounded" />
                  <div className="h-1 w-1/2 bg-primary/20 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-semibold ${theme === 'light' ? 'text-primary' : 'text-zinc-500'}`}>
                  {s.lightMode}
                </span>
                {theme === 'light' && (
                  <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                )}
              </div>
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => setTheme('dark')}
              className={`bg-white p-3 rounded-xl flex flex-col items-center gap-3 border-2 transition-all duration-300 active:scale-95 cursor-pointer ${
                theme === 'dark' ? 'border-primary shadow-md shadow-primary/10' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-full aspect-[4/3] bg-[#2d3039] rounded-lg border border-gray-600 flex items-center justify-center overflow-hidden">
                <div className="w-2/3 h-1/2 bg-[#1c1c1e] rounded shadow-sm flex flex-col p-2 gap-1">
                  <div className="h-1 w-full bg-white/20 rounded" />
                  <div className="h-1 w-1/2 bg-white/20 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-primary' : 'text-zinc-500'}`}>
                  {s.darkMode}
                </span>
                {theme === 'dark' && (
                  <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                )}
              </div>
            </button>
          </div>
        </section>

        {/* ── Language ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              language
            </span>
            <h2 className="text-lg font-bold text-[#1C1C1E]">{s.language}</h2>
          </div>

          <div className="bg-white card-component rounded-xl overflow-hidden border border-gray-100 divide-y divide-gray-100">
            {/* Hebrew */}
            <label
              className="flex items-center justify-between p-4 hover:bg-primary/5 cursor-pointer transition-colors active:bg-primary/10"
              onClick={() => setLanguage('he')}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">🇮🇱</span>
                <div className="flex flex-col">
                  <span className="font-semibold text-[#1C1C1E]">{language === 'he' ? 'עברית' : 'Hebrew'}</span>
                  <span className="text-xs text-zinc-400">Hebrew</span>
                </div>
              </div>
              <input
                readOnly
                type="radio"
                name="lang"
                value="he"
                checked={language === 'he'}
                className="w-5 h-5 text-primary border-gray-300 focus:ring-primary cursor-pointer"
              />
            </label>

            {/* English */}
            <label
              className="flex items-center justify-between p-4 hover:bg-primary/5 cursor-pointer transition-colors active:bg-primary/10"
              onClick={() => setLanguage('en')}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">🇺🇸</span>
                <div className="flex flex-col">
                  <span className="font-semibold text-[#1C1C1E]">{language === 'he' ? 'אנגלית' : 'English'}</span>
                  <span className="text-xs text-zinc-400">English</span>
                </div>
              </div>
              <input
                readOnly
                type="radio"
                name="lang"
                value="en"
                checked={language === 'en'}
                className="w-5 h-5 text-primary border-gray-300 focus:ring-primary cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* ── Info Note ── */}
        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary flex-shrink-0">info</span>
          <p className="text-sm info-note-text text-[#004493] leading-relaxed">{s.infoNote}</p>
        </div>

        {/* ── Sign Out ── */}
        <button
          onClick={logout}
          className="w-full mt-4 py-3.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 font-bold text-base rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-red-200/50"
        >
          <span className="material-symbols-outlined">logout</span>
          {language === 'he' ? 'התנתק מהחשבון' : 'Sign Out'}
        </button>

      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav
          items={[
            { id: '2', icon: 'list_alt', label: nav.shifts, onClick: () => navigate('/shifts') },
            { id: '3', icon: 'track_changes', label: nav.live, onClick: () => navigate('/now') },
            { id: '1', icon: 'work', label: nav.home, onClick: () => navigate('/') },
            { id: '4', icon: 'settings', label: nav.settings, active: true, onClick: () => navigate('/settings') },
          ]}
        />
      </div>
    </div>
  );
};
