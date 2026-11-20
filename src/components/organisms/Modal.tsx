/* Displays content in a native modal dialog with close controls. */

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

export default function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(
    /* Opens the dialog and registers its cleanup. */
    () => {
      const dialog = ref.current;
      dialog?.showModal();
      /* Closes the dialog when the component unmounts. */
      return () => dialog?.close();
    },
    []
  );
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={
        /* Closes the modal when its backdrop is clicked. */
        (event) => {
          if (event.target === event.currentTarget) onClose();
        }
      }
    >
      <div className="modal-inner">
        <button className="modal-close" aria-label="Luk" onClick={onClose}>
          ×
        </button>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
