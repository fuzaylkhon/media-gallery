import type { ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
};

export function Modal({ open, ...props }: ModalProps) {
  return open ? <ModalContent {...props} /> : null;
}

function ModalContent({ onClose, className = '', children }: Omit<ModalProps, 'open'>) {
  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      className={`m-auto rounded-2xl bg-white p-0 shadow-xl ${className}`}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          event.currentTarget.close();
        }
      }}
    >
      {children}
    </dialog>
  );
}
