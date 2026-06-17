import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { Icon } from '../components/ui/Icon';
import { useAppSettings } from '../context/AppContext';
import { useData } from '../context/DataContext';

export const EditProfile: FC = () => {
  const navigate = useNavigate();
  const { language } = useAppSettings();

  const { user, updateUserProfile } = useData();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('password123'); // Default mock password
  const [profilePic, setProfilePic] = useState(user?.profilePictureUrl || '');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setProfilePic(user.profilePictureUrl || '');
    }
  }, [user]);

  // Localization strings
  const labels = {
    title: language === 'he' ? 'עריכת פרופיל' : 'Edit Profile',
    avatarSection: language === 'he' ? 'תמונת פרופיל' : 'Profile Picture',
    avatarUrlPlaceholder: language === 'he' ? 'הזן קישור לתמונה או בחר מהאפשרויות מטה' : 'Enter image URL or select a preset',
    presets: language === 'he' ? 'אפשרויות מהירות' : 'Quick Presets',
    fullName: language === 'he' ? 'שם מלא' : 'Full Name',
    fullNamePlaceholder: language === 'he' ? 'הכנס שם מלא' : 'Enter full name',
    email: language === 'he' ? 'אימייל' : 'Email Address',
    emailPlaceholder: language === 'he' ? 'הכנס אימייל' : 'Enter email address',
    password: language === 'he' ? 'סיסמה' : 'Password',
    passwordPlaceholder: language === 'he' ? 'הכנס סיסמה' : 'Enter password',
    save: language === 'he' ? 'שמור שינויים' : 'Save Changes',
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      await updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        profilePictureUrl: profilePic.trim() || undefined,
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(language === 'he' ? 'שגיאה בעדכון הפרופיל' : 'Error updating profile');
    }
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
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          
          {/* Form fields */}
          <div className="bg-white card-component shadow-sm rounded-xl p-5 border border-gray-100 flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{labels.fullName}</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={labels.fullNamePlaceholder}
                className="w-full bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary text-text-light dark:text-text-dark font-medium placeholder:text-zinc-400"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{labels.email}</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={labels.emailPlaceholder}
                className="w-full bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary text-text-light dark:text-text-dark font-medium placeholder:text-zinc-400"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{labels.password}</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={labels.passwordPlaceholder}
                  className="w-full bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-lg py-3 ps-4 pe-12 focus:ring-2 focus:ring-primary focus:border-primary text-text-light dark:text-text-dark font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 flex items-center px-3 text-zinc-400 dark:text-zinc-500 hover:text-primary transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  <Icon name={showPassword ? 'visibility_off' : 'visibility'} size="xl" />
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 py-4 bg-primary hover:bg-primary/95 text-white font-bold text-lg rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Icon name="check" size="xl" />
            {labels.save}
          </button>

        </form>
      </main>
    </div>
  );
};
