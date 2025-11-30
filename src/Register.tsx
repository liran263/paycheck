import React from 'react';

const Register: React.FC = () => {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden p-4 font-display">
            <div className="w-full max-w-md bg-white dark:bg-background-dark rounded-xl shadow-lg p-8 space-y-6">
                <h1 className="text-[#111418] dark:text-white tracking-light text-[32px] font-bold leading-tight text-center">
                    PayShift Registration
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#111418] dark:text-gray-300 text-base font-medium leading-normal pb-2">
                            First Name
                        </p>
                        <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-0 border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-[#617589] p-[15px] text-base font-normal leading-normal"
                            placeholder="Enter your first name"
                            defaultValue=""
                        />
                    </label>
                    <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#111418] dark:text-gray-300 text-base font-medium leading-normal pb-2">
                            Last Name
                        </p>
                        <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-0 border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-[#617589] p-[15px] text-base font-normal leading-normal"
                            placeholder="Enter your last name"
                            defaultValue=""
                        />
                    </label>
                </div>
                <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#111418] dark:text-gray-300 text-base font-medium leading-normal pb-2">
                        Username
                    </p>
                    <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-0 border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-[#617589] p-[15px] text-base font-normal leading-normal"
                        placeholder="Enter your username"
                        defaultValue=""
                    />
                </label>
                <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#111418] dark:text-gray-300 text-base font-medium leading-normal pb-2">
                        Email
                    </p>
                    <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-0 border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-[#617589] p-[15px] text-base font-normal leading-normal"
                        placeholder="Enter your email"
                        defaultValue=""
                    />
                </label>
                <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#111418] dark:text-gray-300 text-base font-medium leading-normal pb-2">
                        Password
                    </p>
                    <div className="flex w-full flex-1 items-stretch rounded-lg">
                        <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-0 border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-[#617589] p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                            placeholder="Enter your password"
                            type="password"
                            defaultValue=""
                        />
                        <div className="text-[#617589] flex border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-800 items-center justify-center pr-[15px] rounded-r-lg border-l-0">
                            <span className="material-symbols-outlined">visibility_off</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                        <div className="h-1 flex-1 bg-gray-300 dark:bg-gray-600 rounded-full">
                            <div className="h-1 bg-red-500 w-1/4 rounded-full"></div>
                        </div>
                        <div className="h-1 flex-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className="h-1 flex-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className="h-1 flex-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Weak</p>
                    </div>
                </label>
                <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#111418] dark:text-gray-300 text-base font-medium leading-normal pb-2">
                        Confirm Password
                    </p>
                    <div className="flex w-full flex-1 items-stretch rounded-lg">
                        <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-0 border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-[#617589] p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                            placeholder="Confirm your password"
                            type="password"
                            defaultValue=""
                        />
                        <div className="text-[#617589] flex border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-gray-800 items-center justify-center pr-[15px] rounded-r-lg border-l-0">
                            <span className="material-symbols-outlined">visibility_off</span>
                        </div>
                    </div>
                </label>
                <button className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors duration-300 h-14">
                    Register
                </button>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <a className="font-medium text-primary hover:underline" href="#">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Register;
