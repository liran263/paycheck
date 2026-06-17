import { forwardRef, type SelectHTMLAttributes } from 'react';

// Using forwardRef so it can be used with react-hook-form or similar
export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { label?: string; containerClassName?: string }
>(({ className = '', containerClassName = '', label, children, ...props }, ref) => {
  return (
    <label className={`flex flex-col flex-1 min-w-40 ${containerClassName}`}>
      {label && (
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal pb-2">
          {label}
        </p>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            appearance-none flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md 
            text-[#1c1c1e] dark:text-white 
            focus:outline-0 focus:ring-2 focus:ring-[#007aff]/50 
            border border-gray-200 dark:border-gray-600 
            bg-[#f0f4ff] dark:bg-gray-700 
            h-12 rtl:pl-10 rtl:pr-3 ltr:pl-3 ltr:pr-10 text-base font-normal leading-normal
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        <span className="material-symbols-outlined absolute rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          expand_more
        </span>
      </div>
    </label>
  );
});

Select.displayName = 'Select';
