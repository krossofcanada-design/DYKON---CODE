import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export default function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} className="modal" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal-inner">
      <button className="modal-close" aria-label="Luk" onClick={onClose}>×</button>
      <h2>{title}</h2>{children}
    </div>
  </dialog>;
}
