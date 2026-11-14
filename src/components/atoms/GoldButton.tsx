import type { ButtonHTMLAttributes } from 'react';

/* Renders a gold-styled button while forwarding standard button props. */
export default function GoldButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`gold-button ${className}`} {...props}>
      {children}
    </button>
  );
}
