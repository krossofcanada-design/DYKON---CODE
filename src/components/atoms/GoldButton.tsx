import type { ButtonHTMLAttributes } from 'react';

export default function GoldButton({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`gold-button ${className}`} {...props}>{children}</button>;
}
