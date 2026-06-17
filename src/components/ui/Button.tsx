import { type ButtonHTMLAttributes, type FC } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30',
  secondary: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700',
  ghost: 'bg-transparent text-primary hover:bg-primary/10',
  danger: 'bg-transparent text-red-500 hover:bg-red-50',
  outline: 'bg-transparent border border-gray-300 text-text-light dark:text-text-dark dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
};

const sizeStyles = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-14 px-6 text-lg font-bold',
  xl: 'h-16 px-6 text-xl font-bold',
  icon: 'size-12 p-0 flex items-center justify-center'
};

export const Button: FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center 
        rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
