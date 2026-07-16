import { Spinner } from './Spinner';

/**
 * Semi-transparent overlay with a spinner, shown during async operations.
 * Covers the nearest `position: relative` parent (or the form card).
 *
 * @param {Object} props
 * @param {boolean} props.visible - whether to show the overlay
 * @param {string} [props.message] - optional loading message
 */
export function LoadingOverlay({ visible, message }) {
  if (!visible) return null;

  return (
    <div className="admin-loading-overlay" aria-live="polite">
      <div className="admin-loading-overlay__content">
        <Spinner size="lg" />
        {message && <p className="admin-loading-overlay__msg">{message}</p>}
      </div>
    </div>
  );
}
