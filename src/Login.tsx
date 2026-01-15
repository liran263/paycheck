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
            await signInWithEmailAndPassword(auth, identifier, password);
            // Navigate to home/dashboard - for now '/' which will be protected later or just a placeholder
            // Assuming we might want to redirect to a main page.
            // For this step, we'll just log success or maybe alert? 
            // Ideally we should have a dashboard. Let's send to '/' for now.
            navigate('/');
        } catch (err: any) {
            console.error("Login Error:", err);
            // Translate common firebase errors
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('שם משתמש או סיסמה שגויים');
            } else if (err.code === 'auth/too-many-requests') {
                setError('יותר מדי ניסיונות התחברות, נסה שוב מאוחר יותר');
            } else {
                setError('אירעה שגיאה בהתחברות, נסה שוב');
            }
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col items-center bg-background-light dark:bg-background-dark font-display" dir="rtl">
            <div className="flex w-full max-w-md flex-col items-center justify-center p-4 pt-16">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
                    <svg className="text-primary" fill="none" height="40" viewBox="0 0 24 24" width="40" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                </div>
                <h1 className="text-text-light dark:text-text-dark tracking-tight text-[32px] font-bold leading-tight text-center pb-8">התחברות</h1>
                <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
                    <div className="flex w-full flex-wrap items-end gap-4">
                        <label className="flex w-full flex-col min-w-40 flex-1">
                            <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">אימייל</p>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark border border-border-light dark:border-border-dark bg-field-light dark:bg-field-dark h-14 placeholder:text-subtle-text-light dark:placeholder:text-subtle-text-dark p-[15px] text-base font-normal leading-normal"
                                placeholder="הקלד/י אימייל"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="flex w-full flex-wrap items-end gap-4">
                        <label className="flex w-full flex-col min-w-40 flex-1">
                            <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">סיסמה</p>
                            <div className="relative flex w-full flex-1 items-stretch">
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark border border-border-light dark:border-border-dark bg-field-light dark:bg-field-dark h-14 placeholder:text-subtle-text-light dark:placeholder:text-subtle-text-dark p-[15px] pr-12 text-base font-normal leading-normal"
                                    placeholder="הקלד/י סיסמה"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </label>
                    </div>
                    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                    <div className="mt-8 flex w-full">
                        <button type="submit" className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark transition-colors">
                            <span className="truncate">התחברות</span>
                        </button>
                    </div>
                </form>
                <div className="mt-8 text-center">
                    <p className="text-sm text-subtle-text-light dark:text-subtle-text-dark">
                        אין לך חשבון?
                        <Link className="font-semibold text-primary hover:underline" to="/register">הרשמה</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
