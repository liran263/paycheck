import { FC } from 'react';
import { Icon } from './Icon';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}

interface BottomNavProps {
  items: NavItem[];
}

export const BottomNav: FC<BottomNavProps> = ({ items }) => {
  return (
    <nav className="sticky bottom-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm p-2 z-10">
      <div className="flex justify-around items-center">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex flex-col items-center gap-1 p-2 ${
              item.active 
                ? 'text-primary' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Icon name={item.icon} size="3xl" />
            <span className={`text-xs ${item.active ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};
