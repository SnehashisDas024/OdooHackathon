import clsx from 'clsx';

export default function Avatar({ name, src, size = 'md', className }) {
  const sizes = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const initials = (name || 'U')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={clsx('rounded-full object-cover flex-shrink-0', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={clsx(
        'rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white select-none',
        sizes[size],
        className
      )}
      style={{ background: 'var(--brand-primary)', fontFamily: 'Sora, sans-serif' }}
      aria-label={name || 'User avatar'}
    >
      {initials}
    </div>
  );
}
