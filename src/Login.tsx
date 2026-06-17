import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark font-display p-4 md:p-6" dir="rtl">
            <div className="flex w-full max-w-md flex-col items-center bg-white dark:bg-card-dark rounded-3xl p-8 md:p-10 shadow-soft border border-border-light dark:border-border-dark transition-all duration-300">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20">
                    <svg className="text-primary" fill="none" height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                </div>
                <h1 className="text-text-light dark:text-text-dark tracking-tight text-[28px] font-bold leading-tight text-center pb-6">התחברות</h1>
                <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
                    <div className="flex w-full flex-wrap items-end gap-4">
                        <label className="flex w-full flex-col min-w-40 flex-1">
                            <p className="text-text-light dark:text-text-dark text-sm font-semibold leading-normal pb-2">אימייל או שם משתמש</p>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-zinc-200 dark:border-border-dark bg-field-light dark:bg-field-dark h-14 placeholder:text-subtle-text-light dark:placeholder:text-subtle-text-dark p-[15px] text-base font-normal leading-normal transition-all duration-200 shadow-xs"
                                placeholder="הקלד/י אימייל או שם משתמש"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="flex w-full flex-wrap items-end gap-4">
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
                    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                    <div className="mt-6 flex w-full">
                        <button type="submit" className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark transition-all duration-200 shadow-sm">
                            <span className="truncate">התחברות</span>
                        </button>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm text-subtle-text-light dark:text-subtle-text-dark">
                        אין לך חשבון?{' '}
                        <Link className="font-semibold text-primary hover:underline" to="/register">הרשמה</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
