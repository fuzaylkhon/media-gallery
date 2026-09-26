import { type ReactNode, useRef } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  className?: string;
  labelledBy: string;
  children: ReactNode;
};

export function Modal({ open, ...props }: ModalProps) {
  return open ? <ModalContent {...props} /> : null;
}

function ModalContent({ onClose, className = '', labelledBy, children }: Omit<ModalProps, 'open'>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  return (
    <dialog
      ref={(dialog) => {
        dialogRef.current = dialog;
        if (dialog && !dialog.open) {
          returnFocusTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          dialog.showModal();
        }
      }}
      aria-labelledby={labelledBy}
      className={`m-auto max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-white p-0 shadow-xl ${className}`}
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
