import { TriangleAlert } from 'lucide-react';

/**
 * Shows a warning banner when form validation fails.
 * Lists each specific error message. Renders nothing when there are no errors.
 *
 * @param {Object} props
 * @param {Record<string, string>} props.errors - error map from validation
 */
export function FormErrorBanner({ errors }) {
  const entries = Object.values(errors).filter(Boolean);
  if (entries.length === 0) return null;

  return (
    <div className="admin-form-error-banner" role="alert">
      <TriangleAlert size={18} className="admin-form-error-banner__icon" />
      <div className="admin-form-error-banner__content">
        <strong>Please fix the following before submitting:</strong>
        <ul className="admin-form-error-banner__list">
          {entries.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
