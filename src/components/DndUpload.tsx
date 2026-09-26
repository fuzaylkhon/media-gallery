import type { ChangeEventHandler, DragEventHandler, ReactNode } from 'react';
import { useState } from 'react';

type DndUploadProps = {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  children?: ReactNode;
};

export function DndUpload({ onFiles, accept, multiple = true, className, children }: DndUploadProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop: DragEventHandler = (event) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) onFiles(Array.from(event.dataTransfer.files));
  };

  const handleDragLeave: DragEventHandler = (event) => {
    const target = event.relatedTarget;
    if (!(target instanceof Node) || !event.currentTarget.contains(target)) setDragging(false);
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { files } = event.target;
    if (files && files.length > 0) onFiles(Array.from(files));
    event.target.value = '';
  };

  return (
    <label
      className={className}
      data-dragging={dragging || undefined}
      onDragOver={(event) => event.preventDefault()}
      onDragEnter={() => setDragging(true)}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input type='file' className='sr-only' accept={accept} multiple={multiple} onChange={handleChange} />
      {children}
    </label>
  );
}
