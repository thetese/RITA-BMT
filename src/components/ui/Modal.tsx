import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './DesignSystem';

export default function Modal({ title, children, onClose, isOpen, size = 'md' }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        ).filter((el: any) => !el.disabled);
        if (focusable.length === 0) return;

        const first: any = focusable[0];
        const last: any = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.classList.add('modal-open');
      setTimeout(() => {
        if (!modalRef.current) return;
        const firstInput = modalRef.current.querySelector('input, textarea, select, button');
        if (firstInput) firstInput.focus();
      }, 50);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={'modal-content modal-' + size}
        onClick={e => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <Button variant="ghost" size="sm" icon={<X size={18} />} onClick={onClose} aria-label="Close" />
        </div>
        {children}
      </div>
    </div>
  );
}
