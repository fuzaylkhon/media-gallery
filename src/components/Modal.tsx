import type { ReactNode } from 'react';

type ModalProps = {
  onClose: () => void;
  className?: string;
  children: ReactNode;
};

export function Modal({ onClose, className = '', children }: ModalProps) {
  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      className={`m-auto rounded-2xl bg-white p-0 shadow-xl ${className}`}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      {children}
    </dialog>
  );
}
