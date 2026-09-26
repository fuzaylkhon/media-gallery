import type { ComponentProps } from 'react';

export function Button({ className = '', type = 'button', ...props }: ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={`cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
