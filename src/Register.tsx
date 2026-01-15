import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Password visibility states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Error states
    const [usernameError, setUsernameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [agreementError, setAgreementError] = useState('');
    const [generalError, setGeneralError] = useState(''); // New global error state

    const navigate = useNavigate();

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);

        // Validate password match in real-time
        if (value && password && value !== password) {
            setPasswordError('הסיסמאות אינן תואמות');
        } else if (passwordError === 'הסיסמאות אינן תואמות') {
            setPasswordError('');
        }
    };

    const validateForm = () => {
        let isValid = true;

        // Username validation
        // Accept either a valid Email OR a strict Username (5-15 chars, 1 uppercase, 2 numbers)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^(?=(?:.*[A-Z]){1})(?=(?:.*\d){2})[A-Za-z\d]{5,15}$/;

        if (!username) {
            setUsernameError('שדה זה הינו חובה');
            isValid = false;
        } else if (!emailRegex.test(username) && !usernameRegex.test(username)) {
            setUsernameError('יש להזין כתובת אימייל תקינה או שם משתמש (5-15 תווים, אות גדולה ו-2 מספרים)');
            isValid = false;
        } else {
            setUsernameError('');
        }

        // Phone validation (Israeli format: 05XXXXXXXX - exactly 10 digits)
        const phoneRegex = /^05\d{8}$/;
        if (!phone || !phoneRegex.test(phone)) {
            setPhoneError('מספר טלפון חייב להיות בעל 10 ספרות (ולהתחיל ב-05)');
            isValid = false;
        } else {
            setPhoneError('');
        }

        // Password validation
        // 8-20 chars, 1 uppercase, 2 numbers
        const passwordRegex = /^(?=(?:.*[A-Z]){1})(?=(?:.*\d){2}).{8,20}$/;
        if (!password || !passwordRegex.test(password)) {
            setPasswordError('הסיסמה אינה עומדת בדרישות');
            isValid = false;
        } else if (password !== confirmPassword) {
            setPasswordError('הסיסמאות אינן תואמות');
            isValid = false;
        } else {
            setPasswordError('');
        }

        // Agreement validation
        if (!agreedToTerms) {
            setAgreementError('יש לאשר את תנאי השימוש');
            isValid = false;
        } else {
            setAgreementError('');
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError('');

        if (validateForm()) {
            try {
                // Determine if username is actually an email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isEmail = emailRegex.test(username);

                // If it's not an email, we need an email to register with Firebase Auth.
                // Assuming for this use case, if they provide a username, we might need to ask for email OR just fake one?
                // OR, the prompt implies "Username or Email" is the login identifier.
                // If I enter "User12", that's not an email. `createUserWithEmailAndPassword` REQUIRES an email.
                // If the user enters a username, we are stuck.
                // OPTION: Append a domain if it's a username to make it an email for Auth purposes?
                // OR: Fail if it's not an email? BUT the requirement was "Allow Username Pattern".
                // I will append a dummy domain if it's not an email, e.g., username@paycheck.local, and store the real type in Firestore.

                let registrationEmail = username;
                if (!isEmail) {
                    registrationEmail = `${username}@paycheck.local`; // strategy to handle username-only login
                }

                // 1. Create Auth User
                const userCredential = await createUserWithEmailAndPassword(auth, registrationEmail, password);
                const user = userCredential.user;

                // 2. Save User Data to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    username: username, // The input value (could be email or username)
                    phone: phone,
                    email: registrationEmail,
                    isEmailLogin: isEmail, // Track if they signed up with real email
                    createdAt: new Date()
                });

                console.log("User registered:", user.uid);
                navigate('/'); // Redirect to home/dashboard

            } catch (err: any) {
                console.error("Registration Error:", err);
                if (err.code === 'auth/email-already-in-use') {
                    setGeneralError('כתובת האימייל (או שם המשתמש) כבר קיימת במערכת');
                } else {
                    setGeneralError('אירעה שגיאה בהרשמה: ' + err.message);
                }
            }
        }
    };

    // Helper to check requirements for UI
    const hasLength = password.length >= 8 && password.length <= 20;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasTwoNumbers = /(?:.*\d){2}/.test(password);

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
                    {/* General Error Display */}
                    {generalError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{generalError}</span>
                        </div>
                    )}

                    <div className="flex w-full flex-wrap items-end gap-4">
                        <label className="flex w-full flex-col min-w-40 flex-1">
                            <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">שם משתמש או אימייל</p>
                            <input
                                className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark border bg-field-light dark:bg-field-dark h-14 placeholder:text-subtle-text-light dark:placeholder:text-subtle-text-dark p-[15px] text-base font-normal leading-normal ${usernameError ? 'border-red-500 focus:ring-red-500' : 'border-border-light dark:border-border-dark focus:ring-primary'}`}
                                placeholder="הקלד/י שם משתמש או אימייל"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            {usernameError && <p className="text-sm text-red-500 mt-1">{usernameError}</p>}
                        </label>
                    </div>
                    <div className="flex w-full flex-wrap items-end gap-4">
                        <label className="flex w-full flex-col min-w-40 flex-1">
                            <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">מספר טלפון</p>
                            <input
                                className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark border bg-field-light dark:bg-field-dark h-14 placeholder:text-subtle-text-light dark:placeholder:text-subtle-text-dark p-[15px] text-base font-normal leading-normal ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-border-light dark:border-border-dark focus:ring-primary'}`}
                                placeholder="הקלד/י מספר טלפון"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            {phoneError && <p className="text-sm text-red-500 mt-1">{phoneError}</p>}
                        </label>
                    </div>
                    <div className="flex w-full flex-wrap items-end gap-4">
                        <label className="flex w-full flex-col min-w-40 flex-1">
                            <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">סיסמה</p>
                            <div className="relative flex w-full flex-1 items-stretch">
                                <input
                                    className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark border bg-field-light dark:bg-field-dark h-14 placeholder:text-subtle-text-light dark:placeholder:text-subtle-text-dark p-[15px] pr-12 text-base font-normal leading-normal ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-border-light dark:border-border-dark focus:ring-primary'}`}
                                    placeholder="הקלד/י סיסמה"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div
                                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center pr-4 text-subtle-text-light dark:text-subtle-text-dark"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </div>
                            </div>

                            {/* Password Requirements UI */}
                            <div className="mt-2 p-3 bg-field-light dark:bg-field-dark rounded-lg border border-border-light dark:border-border-dark">
                                <p className="text-sm font-medium mb-2 text-text-light dark:text-text-dark">דרישות סיסמה:</p>
                                <ul className="text-xs space-y-1">
                                    <li className={`flex items-center gap-2 ${hasLength ? 'text-primary' : 'text-subtle-text-light dark:text-subtle-text-dark'}`}>
                                        <span className="material-symbols-outlined text-[16px]">{hasLength ? 'check_circle' : 'circle'}</span>
                                        8-20 תווים
                                    </li>
                                    <li className={`flex items-center gap-2 ${hasUpperCase ? 'text-primary' : 'text-subtle-text-light dark:text-subtle-text-dark'}`}>
                                        <span className="material-symbols-outlined text-[16px]">{hasUpperCase ? 'check_circle' : 'circle'}</span>
                                        אות גדולה באנגלית (A-Z)
                                    </li>
                                    <li className={`flex items-center gap-2 ${hasTwoNumbers ? 'text-primary' : 'text-subtle-text-light dark:text-subtle-text-dark'}`}>
                                        <span className="material-symbols-outlined text-[16px]">{hasTwoNumbers ? 'check_circle' : 'circle'}</span>
                                        לפחות 2 מספרים
                                    </li>
                                </ul>
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
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                />
                                <div
                                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center pr-4 text-subtle-text-light dark:text-subtle-text-dark"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                </div>
                            </div>
                            {passwordError && (
                                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                            )}
                        </label>
                    </div>
                    <div className="flex w-full flex-col pt-2">
                        <div className="flex items-center gap-3">
                            <input
                                className={`form-checkbox h-5 w-5 rounded bg-field-light dark:bg-field-dark text-primary focus:ring-primary focus:ring-offset-background-light dark:focus:ring-offset-background-dark ${agreementError ? 'border-red-500' : 'border-border-light dark:border-border-dark'}`}
                                id="terms-checkbox"
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                            />
                            <label className="text-sm text-subtle-text-light dark:text-subtle-text-dark" htmlFor="terms-checkbox">
                                אני מסכים ל<a className="font-semibold text-primary hover:underline" href="#">תנאי השימוש</a> ול<a className="font-semibold text-primary hover:underline" href="#">מדיניות הפרטיות</a>.
                            </label>
                        </div>
                        {agreementError && <p className="text-sm text-red-500 mt-1">{agreementError}</p>}
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
                        <Link className="font-semibold text-primary hover:underline" to="/login">התחבר/י</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
