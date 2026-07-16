import { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Chip-style multi-value input.
 * Values are stored as string[].
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {string[]} props.values
 * @param {(values: string[]) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {string} [props.error]
 */
export function TagInput({ id, values, onChange, placeholder = 'Type and press Enter', error }) {
  const [input, setInput] = useState('');

  function add() {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput('');
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !input && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  function remove(index) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className={`admin-tag-input ${error ? 'admin-tag-input--error' : ''}`}>
      {values.map((v, i) => (
        <span key={`${v}-${i}`} className="admin-tag">
          {v}
          <button
            type="button"
            className="admin-tag__remove"
            onClick={() => remove(i)}
            aria-label={`Remove ${v}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        className="admin-tag-input__field"
        value={input}
        placeholder={values.length ? '' : placeholder}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
      />
    </div>
  );
}
