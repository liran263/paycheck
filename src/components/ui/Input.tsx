import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  containerClassName = '',
  label,
  error,
  icon,
  iconPosition = 'right',
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col w-full relative ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative w-full flex items-center">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-4 z-10 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            w-full bg-white dark:bg-card-dark
            border-0 rounded-lg h-14
            text-text-light dark:text-text-dark text-base font-medium
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:ring-2 focus:ring-primary
            ${icon && iconPosition === 'left' ? 'pl-12' : 'pl-4'}
            ${icon && iconPosition === 'right' ? 'pr-12' : 'pr-4'}
            ${error ? 'ring-2 ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-4 z-10 text-gray-400 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-1 absolute -bottom-5">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
