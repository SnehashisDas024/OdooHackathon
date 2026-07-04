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
          'neumorphic-concave w-full px-4 py-2.5 rounded-xl text-sm transition-all',
          'focus:outline-none placeholder:text-[--ink-soft]',
          error && 'text-[--status-danger]',
          className
        )}
        style={{ color: 'var(--ink-primary)', fontFamily: 'Avenir Next, Nunito, Inter, sans-serif' }}
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
