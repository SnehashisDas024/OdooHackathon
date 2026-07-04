import { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#ECF0F3]/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className={`neumorphic-convex relative rounded-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 id="modal-title" className="text-lg font-medium" style={{ fontFamily: 'Avenir Next, Nunito, Inter, sans-serif', color: 'var(--ink-primary)' }}>
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
