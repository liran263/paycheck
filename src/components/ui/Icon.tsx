import { type HTMLAttributes, type FC } from 'react';

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  filled?: boolean;
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
};

export const Icon: FC<IconProps> = ({ 
  name, 
  size = '2xl', 
  filled = false,
  className = '', 
  ...props 
}) => {
  return (
    <span 
      className={`material-symbols-outlined ${sizeMap[size]} ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        ...(props.style || {})
      }}
      {...props}
    >
      {name}
    </span>
  );
};
