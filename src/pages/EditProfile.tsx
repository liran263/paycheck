import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { Icon } from '../components/ui/Icon';
import { useAppSettings } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { updateEmail, verifyBeforeUpdateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

export const EditProfile: FC = () => {
  const navigate = useNavigate();
  const { language } = useAppSettings();

  const { user, updateUserProfile } = useData();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePic, setProfilePic] = useState(user?.profilePictureUrl || '');

  // Secure email change states
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [emailUpdateError, setEmailUpdateError] = useState('');
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
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
    fullName: language === 'he' ? 'שם מלא' : 'Full Name',
    fullNamePlaceholder: language === 'he' ? 'הכנס שם מלא' : 'Enter full name',
    currentEmail: language === 'he' ? 'אימייל נוכחי' : 'Current Email',
    save: language === 'he' ? 'שמור שינויים' : 'Save Changes',
    
    // Secure email card labels
    secureEmailTitle: language === 'he' ? 'עדכון כתובת אימייל מאובטח' : 'Secure Email Update',
    secureEmailDesc: language === 'he' ? 'כדי לשנות את האימייל, אנא הזן את הכתובת החדשה והסיסמה הנוכחית שלך לצורך אימות.' : 'To change your email, please enter the new address and your current password for verification.',
    newEmail: language === 'he' ? 'אימייל חדש' : 'New Email Address',
    newEmailPlaceholder: language === 'he' ? 'הכנס אימייל חדש' : 'Enter new email address',
    password: language === 'he' ? 'סיסמה נוכחית' : 'Current Password',
    passwordPlaceholder: language === 'he' ? 'הכנס סיסמה נוכחית' : 'Enter current password',
    updateBtn: language === 'he' ? 'עדכן אימייל' : 'Update Email',
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await updateUserProfile({
        name: name.trim(),
        profilePictureUrl: profilePic.trim() || undefined,
      });
      alert(language === 'he' ? 'הפרופיל עודכן בהצלחה!' : 'Profile updated successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(language === 'he' ? 'שגיאה בעדכון הפרופיל' : 'Error updating profile');
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailUpdateError('');
    setEmailUpdateSuccess('');

    if (!newEmail.trim()) {
      setEmailUpdateError(language === 'he' ? 'נא להזין כתובת אימייל חדשה' : 'Please enter new email');
      return;
    }
    if (!currentPassword) {
      setEmailUpdateError(language === 'he' ? 'נא להזין סיסמה נוכחית לאימות' : 'Please enter current password');
      return;
    }

    setIsUpdatingEmail(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('No user signed in');
      }

      // 1. Reauthenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // 2. Update email in Firebase Auth
      let verificationSent = false;
      try {
        await verifyBeforeUpdateEmail(currentUser, newEmail.trim());
        verificationSent = true;
      } catch (authErr: any) {
        console.warn('verifyBeforeUpdateEmail failed, trying updateEmail fallback...', authErr);
        if (authErr.code === 'auth/operation-not-allowed' || authErr.code === 'auth/unsupported-tenant-operation') {
          // Fallback to direct update if verifyBeforeUpdateEmail is not supported/allowed
          await updateEmail(currentUser, newEmail.trim());
        } else {
          throw authErr;
        }
      }

      // 3. Update email in Firestore
      await updateUserProfile({
        email: newEmail.trim(),
      });

      if (verificationSent) {
        setEmailUpdateSuccess(language === 'he' 
          ? 'קישור אימות נשלח לכתובת האימייל החדשה! אנא אשר אותו בתיבת המייל כדי להשלים את העדכון.' 
          : 'Verification link sent to the new email! Please confirm it to complete the update.');
      } else {
        setEmailUpdateSuccess(language === 'he' ? 'כתובת האימייל עודכנה בהצלחה!' : 'Email updated successfully!');
        setEmail(newEmail.trim());
      }
      setNewEmail('');
      setCurrentPassword('');
    } catch (err: any) {
      console.error('Email update error:', err);
      let errMsg = language === 'he' ? 'שגיאה בעדכון האימייל, נסה שוב' : 'Error updating email, try again';
      if (err.code) {
        if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          errMsg = language === 'he' ? 'הסיסמה שהוזנה שגויה' : 'Incorrect password';
        } else if (err.code === 'auth/invalid-email') {
          errMsg = language === 'he' ? 'כתובת אימייל לא תקינה' : 'Invalid email address';
        } else if (err.code === 'auth/email-already-in-use') {
          errMsg = language === 'he' ? 'כתובת אימייל זו כבר קיימת במערכת' : 'Email already in use';
        } else {
          errMsg = `${errMsg} (${err.code})`;
        }
      } else if (err.message) {
        errMsg = `${errMsg}: ${err.message}`;
      }
      setEmailUpdateError(errMsg);
    } finally {
      setIsUpdatingEmail(false);
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

      <main className="p-4 flex-grow flex flex-col gap-6 max-w-lg mx-auto w-full">
        
        {/* Form 1: General Profile Edit */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="bg-white dark:bg-card-dark shadow-sm rounded-2xl p-5 border border-gray-100 dark:border-border-dark flex flex-col gap-4">
            
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{labels.fullName}</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={labels.fullNamePlaceholder}
                className="w-full bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary text-text-light dark:text-text-dark font-medium placeholder:text-zinc-400"
              />
            </div>

            {/* Read-only Current Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 dark:text-zinc-500 text-sm font-semibold">{labels.currentEmail}</label>
              <div className="relative">
                <input
                  disabled
                  type="email"
                  value={email}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-zinc-500 dark:text-zinc-400 font-medium cursor-not-allowed"
                />
                <div className="absolute inset-y-0 end-3 flex items-center text-zinc-400">
                  <Icon name="lock" size="md" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white font-bold text-base rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Icon name="check" size="lg" />
            {labels.save}
          </button>
        </form>

        {/* Form 2: Secure Email Update */}
        <form onSubmit={handleEmailUpdate} className="flex flex-col gap-4">
          <div className="bg-white dark:bg-card-dark shadow-sm rounded-2xl p-5 border border-gray-100 dark:border-border-dark flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-black text-text-light dark:text-text-dark mb-1">{labels.secureEmailTitle}</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">{labels.secureEmailDesc}</p>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* New Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{labels.newEmail}</label>
              <input
                required
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={labels.newEmailPlaceholder}
                className="w-full bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary text-text-light dark:text-text-dark font-medium placeholder:text-zinc-400"
              />
            </div>

            {/* Password Verification */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{labels.password}</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={labels.passwordPlaceholder}
                  className="w-full bg-[#f1f3fe] dark:bg-[#1A2545] border border-gray-200 dark:border-gray-700 rounded-lg py-3 ps-4 pe-12 focus:ring-2 focus:ring-primary focus:border-primary text-text-light dark:text-text-dark font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 flex items-center px-3 text-zinc-400 dark:text-zinc-500 hover:text-primary transition-colors cursor-pointer bg-transparent border-0"
                  aria-label="Toggle password visibility"
                >
                  <Icon name={showPassword ? 'visibility_off' : 'visibility'} size="xl" />
                </button>
              </div>
            </div>

            {emailUpdateError && <p className="text-sm text-red-500 mt-1">{emailUpdateError}</p>}
            {emailUpdateSuccess && <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-semibold">{emailUpdateSuccess}</p>}
          </div>

          <button
            type="submit"
            disabled={isUpdatingEmail}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-[#5a9aff] hover:opacity-95 text-white font-bold text-base rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="security" size="lg" />
            {isUpdatingEmail ? (language === 'he' ? 'עדכון...' : 'Updating...') : labels.updateBtn}
          </button>
        </form>

      </main>
    </div>
  );
};
