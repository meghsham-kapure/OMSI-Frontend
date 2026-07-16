import { useRef, useState } from 'react';
import { FolderOpen, FileText, X } from 'lucide-react';

/**
 * Drag-and-drop + click file upload.
 * @param {Object} props
 * @param {string} props.id
 * @param {string} [props.accept] - e.g. "image/*" or ".pdf"
 * @param {boolean} [props.multiple]
 * @param {File[]} props.files - controlled
 * @param {(files: File[]) => void} props.onChange
 * @param {string} [props.error]
 * @param {string} [props.label]
 * @param {string} [props.hint]
 */
export function FileUpload({ id, accept, multiple, files, onChange, error, label, hint }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(newFiles) {
    const list = Array.from(newFiles);
    onChange(multiple ? list : list.slice(0, 1));
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function removeFile(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="admin-form-field">
      {label && <label className="admin-form-field__label">{label}</label>}

      <div
        className={`admin-file-drop ${isDragging ? 'admin-file-drop--active' : ''} ${error ? 'admin-file-drop--error' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          className="admin-file-input"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="admin-file-drop__inner">
          <span className="admin-file-drop__icon"><FolderOpen size={28} /></span>
          <p className="admin-file-drop__text">
            {isDragging ? 'Drop files here' : 'Click or drag & drop files here'}
          </p>
          {hint && <p className="admin-file-drop__hint">{hint}</p>}
        </div>
      </div>

      {error && <p className="admin-form-field__error">{error}</p>}

      {files.length > 0 && (
        <ul className="admin-file-list">
          {files.map((file, i) => {
            const isImage = file.type?.startsWith('image/');
            const preview = isImage ? URL.createObjectURL(file) : null;
            return (
              <li key={`${file.name}-${i}`} className="admin-file-item">
                {preview ? (
                  <img src={preview} alt={file.name} className="admin-file-item__preview" />
                ) : (
                  <span className="admin-file-item__icon"><FileText size={20} /></span>
                )}
                <span className="admin-file-item__name">{file.name}</span>
                <button
                  type="button"
                  className="admin-file-item__remove"
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
