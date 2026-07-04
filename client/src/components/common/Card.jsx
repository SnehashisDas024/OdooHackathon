import clsx from 'clsx';

export default function Card({ children, className, hover = true, onClick, ...props }) {
  return (
    <div
      className={clsx('card neumorphic-convex p-6', hover && 'cursor-default', onClick && 'cursor-pointer', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
