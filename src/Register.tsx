import React, { useState } from 'react';

export default function Register() {
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);

        // Validate password match in real-time
        if (value && password && value !== password) {
            setPasswordError('הסיסמאות אינן תואמות');
        } else {
            setPasswordError('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate passwords match before submission
        if (password !== confirmPassword) {
            setPasswordError('הסיסמאות אינן תואמות');
            return;
        }

        console.log({
            username,
            phone,
            password,
            confirmPassword,
            agreedToTerms,
        });
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
                <h1 className="text-text-light dark:text-text-dark tracking-tight text-[32px] font-bold leading-tight text-center pb-8">יצירת חשבון חדש</h1>
                <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
                    <div className="flex w-full flex-wrap items-end gap-4">
                        <label className="flex w-full flex-col min-w-40 flex-1">
                            <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">שם משתמש או אימייל</p>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark border border-border-light dark:border-border-dark bg-field-light dark:bg-field-dark h-14 placeholder:text-subtle-text-light dark:placeholder:text-subtle-text-dark p-[15px] text-base font-normal leading-normal"
                                placeholder="הקלד/י שם משתמש או אימייל"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="flex w-full flex-wrap items-end gap-4">
                        <label className="flex w-full flex-col min-w-40 flex-1">
                            <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">מספר טלפון</p>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark border border-border-light dark:border-border-dark bg-field-light dark:bg-field-dark h-14 placeholder:text-subtle-text-light dark:placeholder:text-subtle-text-dark p-[15px] text-base font-normal leading-normal"
                                placeholder="הקלד/י מספר טלפון"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
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
                                <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center pr-4 text-subtle-text-light dark:text-subtle-text-dark">
                                    <span className="material-symbols-outlined">visibility</span>
                                </div>
                            </div>
                        </label>
                    </div>
                    <div className="flex w-full flex-wrap items-end gap-4">
                        <label className="flex w-full flex-col min-w-40 flex-1">
                            <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">אישור סיסמה</p>
                            <div className="relative flex w-full flex-1 items-stretch">
                                <input
                                    className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark border bg-field-light dark:bg-field-dark h-14 placeholder:text-subtle-text-light dark:placeholder:text-subtle-text-dark p-[15px] pr-12 text-base font-normal leading-normal ${passwordError
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-border-light dark:border-border-dark focus:ring-primary'
                                        }`}
                                    placeholder="הקלד/י את הסיסמה שוב"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                />
                                <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center pr-4 text-subtle-text-light dark:text-subtle-text-dark">
                                    <span className="material-symbols-outlined">visibility_off</span>
                                </div>
                            </div>
                            {passwordError && (
                                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                            )}
                        </label>
                    </div>
                    <div className="flex w-full items-center gap-3 pt-2">
                        <input
                            className="form-checkbox h-5 w-5 rounded border-border-light dark:border-border-dark bg-field-light dark:bg-field-dark text-primary focus:ring-primary focus:ring-offset-background-light dark:focus:ring-offset-background-dark"
                            id="terms-checkbox"
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                        />
                        <label className="text-sm text-subtle-text-light dark:text-subtle-text-dark" htmlFor="terms-checkbox">
                            אני מסכים ל<a className="font-semibold text-primary hover:underline" href="#">תנאי השימוש</a> ול<a className="font-semibold text-primary hover:underline" href="#">מדיניות הפרטיות</a>.
                        </label>
                    </div>
                    <div className="mt-8 flex w-full">
                        <button type="submit" className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark transition-colors">
                            <span className="truncate">הרשמה</span>
                        </button>
                    </div>
                </form>
                <div className="mt-8 text-center">
                    <p className="text-sm text-subtle-text-light dark:text-subtle-text-dark">
                        כבר יש לך חשבון?
                        <a className="font-semibold text-primary hover:underline" href="#">התחבר/י</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
