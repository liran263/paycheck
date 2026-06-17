import { type FC, type ReactNode } from 'react';
import { Icon } from './Icon';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  brandBlue?: boolean;
}

export const Header: FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction,
  brandBlue = false,
}) => {
  return (
    <header className={`
      flex items-center p-4 pb-2 justify-between sticky top-0 z-10
      ${brandBlue 
        ? 'bg-[#E3F2FD] dark:bg-background-dark' 
        : 'bg-background-light dark:bg-background-dark'}
    `}>
      <div className="flex size-12 shrink-0 items-center justify-center rtl:rotate-180">
        {showBack ? (
          <button 
            onClick={onBack} 
            className="text-text-light dark:text-text-dark flex items-center justify-center"
            aria-label="Go back"
          >
            <Icon name="arrow_back" size="2xl" />
          </button>
        ) : (
          <div className="w-8"></div>
        )}
      </div>
      
      {title && (
        <h1 className="text-text-light dark:text-text-dark text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          {title}
        </h1>
      )}
      
      <div className="flex w-12 items-center justify-end">
        {rightAction || <div className="w-8"></div>}
      </div>
    </header>
  );
};
