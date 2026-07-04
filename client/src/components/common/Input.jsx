import clsx from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, hint, id, className, required, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl text-sm border transition-all',
          'focus:outline-none focus:ring-2 focus:ring-[--brand-primary] focus:border-transparent',
          'placeholder:text-[--ink-muted]',
          error
            ? 'border-[--status-danger] bg-red-50'
            : 'border-[--border-hairline] bg-white',
          className
        )}
        style={{ color: 'var(--ink-primary)', fontFamily: 'Inter, sans-serif' }}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-[--status-danger]" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs" style={{ color: 'var(--ink-muted)' }}>
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
