import { HTMLAttributes, ReactNode, FC } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  interactive = false,
  ...props 
}) => {
  return (
    <div 
      className={`bg-white dark:bg-card-dark rounded-xl shadow-sm ${paddingMap[padding]} ${interactive ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
