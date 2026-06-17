import { type FC, type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'outline' | 'neutral';
  className?: string;
}

const variantStyles = {
  success: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30',
  warning: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30',
  outline: 'bg-transparent border border-gray-300 dark:border-gray-600 text-zinc-500 dark:text-zinc-400',
  neutral: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60'
};

export const Badge: FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = ''
}) => {
  return (
    <span
      className={`
        inline-flex items-center justify-center 
        px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
