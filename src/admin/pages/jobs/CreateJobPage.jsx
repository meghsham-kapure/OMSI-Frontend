import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { FormField } from '../../components/ui/FormField';
import { FormErrorBanner } from '../../components/ui/FormErrorBanner';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';

const EMP_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const DEPARTMENTS = ['Engineering', 'Design', 'Surveying', 'Management', 'Administration', 'Other'];

const INITIAL = {
  title: '',
  department: 'Engineering',
  location: '',
  employmentType: 'Full-time',
  experienceLevel: '',
  description: '',
  applicationDeadline: '',
  isLive: true,
};

export function CreateJobPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Job title is required (e.g. Senior Structural Engineer).';
    if (!form.department.trim()) errs.department = 'Department is required.';
    if (!form.location.trim()) errs.location = 'Job location is required (e.g. Pune, Maharashtra).';
    if (!form.description.trim()) errs.description = 'Job description is required — include responsibilities, requirements, and other details.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await api.post('/job/createJob', form);
      toast.success('Job created successfully.');
      navigate('/osi-console/jobs');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h2 className="admin-page__title">New Job</h2>
          <p className="admin-page__sub">Fill in the details to publish a job listing.</p>
        </div>
        <Link to="/osi-console/jobs" className="admin-btn admin-btn--ghost">← Back</Link>
      </div>

      <form id="create-job-form" className="admin-card admin-form-wide" onSubmit={handleSubmit} noValidate>
        <LoadingOverlay visible={loading} message="Creating job…" />
        <FormErrorBanner errors={errors} />
        <div className="admin-form-grid">
          <FormField id="cj-title" label="Job Title" required value={form.title}
            onChange={(e) => set('title', e.target.value)} error={errors.title}
            placeholder="e.g. Senior Structural Engineer" />

          <div className="admin-form-field">
            <label htmlFor="cj-department" className="admin-form-field__label">Department</label>
            <select id="cj-department" className="admin-select" value={form.department}
              onChange={(e) => set('department', e.target.value)}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <FormField id="cj-location" label="Location" required value={form.location}
            onChange={(e) => set('location', e.target.value)} error={errors.location}
            placeholder="e.g. Pune, Maharashtra" />

          <div className="admin-form-field">
            <label htmlFor="cj-employment-type" className="admin-form-field__label">Employment Type</label>
            <select id="cj-employment-type" className="admin-select" value={form.employmentType}
              onChange={(e) => set('employmentType', e.target.value)}>
              {EMP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <FormField id="cj-experience" label="Experience Level" value={form.experienceLevel}
            onChange={(e) => set('experienceLevel', e.target.value)}
            placeholder="e.g. 3–5 years, Entry Level" />

          <FormField id="cj-deadline" label="Application Deadline" type="date"
            value={form.applicationDeadline}
            onChange={(e) => set('applicationDeadline', e.target.value)} />
        </div>

        <div className="admin-form-field">
          <label htmlFor="cj-description" className="admin-form-field__label">
            Description <span className="admin-form-field__req">*</span>
          </label>
          <textarea
            id="cj-description"
            className={`admin-textarea ${errors.description ? 'admin-input--error' : ''}`}
            rows={8}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Write the job description in Markdown. Include responsibilities, requirements, and any other relevant details…"
          />
          {errors.description && <p className="admin-form-field__error">{errors.description}</p>}
          <p className="admin-form-field__hint">Markdown supported (headings, lists, bold, etc.)</p>
        </div>

        <div className="admin-form-toggles">
          <label className="admin-toggle">
            <input id="cj-is-live" type="checkbox" checked={form.isLive}
              onChange={(e) => set('isLive', e.target.checked)} />
            <span className="admin-toggle__track" />
            <span className="admin-toggle__label">Live (visible on public careers page)</span>
          </label>
        </div>

        <div className="admin-form-actions">
          <Link to="/osi-console/jobs" className="admin-btn admin-btn--ghost">Cancel</Link>
          <button id="cj-submit" type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
            {loading ? 'Creating…' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
