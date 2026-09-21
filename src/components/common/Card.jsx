import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  padding = 'p-6',
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-200',
          hoverEffect && 'hover:shadow-md hover:border-slate-300',
          padding,
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
