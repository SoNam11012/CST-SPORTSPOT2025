import { ButtonHTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'outline';
};

export default function Button({ children, variant = 'primary', className, ...props }: Props) {
  const baseStyles = 'px-4 py-2 rounded font-medium transition';

  const variantStyles = {
    primary: 'bg-[#2c6e49] text-white hover:bg-[#1b4332]',
    accent: 'bg-[#ffc971] text-[#1b4332] hover:bg-[#ffb84d]',
    outline: 'border border-white text-white hover:bg-white hover:text-[#1b4332]'
  };

  return (
    <button
      className={classNames(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}