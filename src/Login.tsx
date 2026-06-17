import { useState } from 'react';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Forgot password states
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isEmail = emailRegex.test(identifier.trim());

            let loginEmail = identifier.trim();
            if (!isEmail) {
                loginEmail = `${identifier.trim()}@paycheck.local`;
            }

            // Set firebase auth persistence based on 'rememberMe' checkbox
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

            await signInWithEmailAndPassword(auth, loginEmail, password);
            navigate('/');
        } catch (err: unknown) {
            console.error("Login Error:", err);
            const firebaseError = err as { code?: string; message?: string };
            // Translate common firebase errors
            if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
                setError('שם משתמש או סיסמה שגויים');
            } else if (firebaseError.code === 'auth/too-many-requests') {
                setError('יותר מדי ניסיונות התחברות, נסה שוב מאוחר יותר');
            } else {
                setError('אירעה שגיאה בהתחברות, נסה שוב');
            }
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResetSuccess('');

        if (!resetEmail.trim()) {
            setError('נא להזין כתובת אימייל');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, resetEmail.trim());
            setResetSuccess('קישור לאיפוס סיסמה נשלח אל תיבת האימייל שלך!');
        } catch (err: unknown) {
            console.error("Reset Password Error:", err);
            const firebaseError = err as { code?: string; message?: string };
            if (firebaseError.code === 'auth/invalid-email') {
                setError('כתובת אימייל לא תקינה');
            } else if (firebaseError.code === 'auth/user-not-found') {
                setError('לא נמצא משתמש עם כתובת אימייל זו');
            } else {
                setError('אירעה שגיאה בשליחת אימייל השחזור, נסה שוב');
            }
        }
    };

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col items-center justify-center bg-gradient-to-tr from-blue-50/40 via-background-light to-indigo-50/40 dark:from-background-dark dark:to-slate-900 font-display p-4 md:p-6" dir="rtl">
            <div className="flex w-full max-w-md flex-col items-center bg-white dark:bg-card-dark rounded-3xl p-8 md:p-10 shadow-soft border border-border-light dark:border-border-dark transition-all duration-300">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20 shadow-lg shadow-primary/10 dark:shadow-primary/5 transition-transform duration-300 hover:scale-105">
                    <svg className="text-primary" fill="none" height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                </div>
                {isForgotPassword ? (
                    <>
                        <h1 className="text-text-light dark:text-text-dark tracking-tight text-[28px] font-black leading-tight text-center pb-2">איפוס סיסמה</h1>
                        <p className="text-sm text-subtle-text-light dark:text-subtle-text-dark text-center pb-6 leading-relaxed">
                            הזן את כתובת האימייל שלך ונשלח אליך קישור לאיפוס הסיסמה.
                        </p>
                        <form onSubmit={handleResetPassword} className="flex w-full flex-col gap-5">
                            <div className="flex w-full flex-wrap items-end">
                                <label className="flex w-full flex-col min-w-40 flex-1">
                                    <p className="text-text-light dark:text-text-dark text-sm font-semibold leading-normal pb-2">כתובת אימייל</p>
                                    <div className="relative flex w-full flex-1 items-stretch">
                                        <input
                                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-zinc-200 dark:border-border-dark bg-field-light dark:bg-field-dark h-14 placeholder:text-subtle-text-light dark:placeholder:text-subtle-text-dark p-[15px] pl-12 text-base font-normal leading-normal transition-all duration-200 shadow-xs"
                                            placeholder="הקלד/י כתובת אימייל"
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400 pointer-events-none">
                                            <span className="material-symbols-outlined text-[22px]">mail</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            
                            {/* Premium Warning Alert Box - Blue/Light Blue style */}
                            <div className="flex gap-3 bg-blue-500/10 dark:bg-blue-500/5 border-r-4 border-primary p-4 rounded-xl text-blue-900 dark:text-blue-350">
                                <span className="material-symbols-outlined text-primary shrink-0">info</span>
                                <p className="text-xs leading-relaxed font-medium">
                                    שים לב: שחזור סיסמה זמין רק עבור משתמשים שנרשמו עם כתובת אימייל אמיתית (ולא שם משתמש בלבד).
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-950/20 border-r-4 border-red-500 p-3 rounded-lg text-red-700 dark:text-red-400 text-sm font-medium">
                                    {error}
                                </div>
                            )}
                            
                            {resetSuccess && (
                                <div className="bg-emerald-50 dark:bg-emerald-950/20 border-r-4 border-emerald-500 p-3.5 rounded-lg text-emerald-700 dark:text-emerald-450 text-sm font-medium leading-relaxed">
                                    {resetSuccess}
                                </div>
                            )}

                            <div className="mt-2 flex w-full flex-col gap-3">
                                <button type="submit" className="w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 flex-1 bg-gradient-to-r from-primary to-[#007AFF] hover:opacity-95 text-white text-base font-bold leading-normal tracking-[0.015em] transition-all duration-200 shadow-md shadow-primary/20 hover:shadow-lg active:scale-[0.99] border-0">
                                    <span className="truncate">שלח קישור לאיפוס</span>
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsForgotPassword(false);
                                        setError('');
                                        setResetSuccess('');
                                    }}
                                    className="w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 flex-1 bg-zinc-100 dark:bg-zinc-800 text-text-light dark:text-text-dark text-base font-bold leading-normal hover:bg-zinc-200 dark:hover:bg-zinc-700/80 transition-all duration-200 border-0 active:scale-[0.99]"
                                >
                                    <span className="truncate">חזרה להתחברות</span>
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <h1 className="text-text-light dark:text-text-dark tracking-tight text-[28px] font-black leading-tight text-center pb-6">התחברות</h1>
                        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
                            <div className="flex w-full flex-wrap items-end">
                                <label className="flex w-full flex-col min-w-40 flex-1">
                                    <p className="text-text-light dark:text-text-dark text-sm font-semibold leading-normal pb-2">אימייל או שם משתמש</p>
                                    <div className="relative flex w-full flex-1 items-stretch">
                                        <input
                                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-zinc-200 dark:border-border-dark bg-field-light dark:bg-field-dark h-14 placeholder:text-subtle-text-light dark:placeholder:text-subtle-text-dark p-[15px] pl-12 text-base font-normal leading-normal transition-all duration-200 shadow-xs"
                                            placeholder="הקלד/י אימייל או שם משתמש"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400 pointer-events-none">
                                            <span className="material-symbols-outlined text-[22px]">person</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            <div className="flex w-full flex-wrap items-end">
                                <label className="flex w-full flex-col min-w-40 flex-1">
                                    <p className="text-text-light dark:text-text-dark text-sm font-semibold leading-normal pb-2">סיסמה</p>
                                    <div className="relative flex w-full flex-1 items-stretch">
                                        <input
                                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-zinc-200 dark:border-border-dark bg-field-light dark:bg-field-dark h-14 placeholder:text-subtle-text-light dark:placeholder:text-subtle-text-dark p-[15px] pr-12 text-base font-normal leading-normal transition-all duration-200 shadow-xs"
                                            placeholder="הקלד/י סיסמה"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <div
                                            className="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center pr-4 text-subtle-text-light dark:text-subtle-text-dark hover:text-primary transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            <div className="flex w-full justify-between items-center pt-1">
                                <div className="flex items-center gap-3">
                                    <input
                                        className="form-checkbox h-5 w-5 rounded bg-field-light dark:bg-field-dark text-primary focus:ring-primary focus:ring-offset-background-light dark:focus:ring-offset-background-dark border-zinc-200 dark:border-border-dark cursor-pointer transition-all duration-200"
                                        id="remember-me-checkbox"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <label className="text-sm text-subtle-text-light dark:text-subtle-text-dark leading-snug cursor-pointer select-none font-medium" htmlFor="remember-me-checkbox">
                                        זכור אותי במכשיר זה
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsForgotPassword(true);
                                        setError('');
                                        setResetSuccess('');
                                    }}
                                    className="text-sm font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer bg-transparent border-0 p-0"
                                >
                                    שכחתי סיסמה
                                </button>
                            </div>
                            {error && (
                                <div className="bg-red-50 dark:bg-red-950/20 border-r-4 border-red-500 p-3 rounded-lg text-red-700 dark:text-red-400 text-sm font-medium">
                                    {error}
                                </div>
                            )}
                            <div className="mt-4 flex w-full">
                                <button type="submit" className="w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 flex-1 bg-gradient-to-r from-primary to-[#007AFF] hover:opacity-95 text-white text-base font-bold leading-normal tracking-[0.015em] transition-all duration-200 shadow-md shadow-primary/20 hover:shadow-lg active:scale-[0.99] border-0">
                                    <span className="truncate">התחברות</span>
                                </button>
                            </div>
                        </form>
                    </>
                )}
                <div className="mt-6 text-center">
                    <p className="text-sm text-subtle-text-light dark:text-subtle-text-dark">
                        אין לך חשבון?{' '}
                        <Link className="font-bold text-primary hover:text-primary/80 transition-colors" to="/register">הרשמה</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
