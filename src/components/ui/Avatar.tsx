import { type HTMLAttributes, type FC } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeMap = {
  sm: 'size-8',
  md: 'size-12',
  lg: 'size-16',
  xl: 'size-24',
  '2xl': 'size-28',
};

export const Avatar: FC<AvatarProps> = ({ 
  src, 
  alt = "Avatar", 
  size = 'md',
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`
        bg-center bg-no-repeat bg-cover rounded-full 
        bg-gray-200 dark:bg-gray-700
        border-4 border-white dark:border-gray-800 shadow-lg
        flex items-center justify-center overflow-hidden
        ${sizeMap[size]}
        ${className}
      `}
      style={src ? { backgroundImage: `url("${src}")` } : undefined}
      aria-label={alt}
      title={alt}
      {...props}
    >
      {!src && <span className="material-symbols-outlined text-gray-400">person</span>}
    </div>
  );
};
