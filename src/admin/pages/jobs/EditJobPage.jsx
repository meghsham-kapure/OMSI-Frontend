import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { FormField } from '../../components/ui/FormField';
import { FormErrorBanner } from '../../components/ui/FormErrorBanner';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { Spinner } from '../../components/ui/Spinner';

const EMP_TYPES   = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const DEPARTMENTS = ['Engineering', 'Design', 'Surveying', 'Management', 'Administration', 'Other'];

function toDateInput(iso) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function EditJobPage() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const toast     = useToast();

  const [form, setForm]       = useState(null);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/job/getJobById/${jobId}`);
        const j   = res.data?.data ?? res.data;
        setForm({
          title:               j.title               || '',
          department:          j.department          || 'Engineering',
          location:            j.location            || '',
          employmentType:      j.employmentType      || 'Full-time',
          experienceLevel:     j.experienceLevel     || '',
          description:         j.description         || '',
          applicationDeadline: toDateInput(j.applicationDeadline),
          isLive:              j.isLive              ?? true,
        });
      } catch (err) {
        toast.error('Failed to load job: ' + err.message);
        navigate('/osi-console/jobs');
      } finally {
        setFetching(false);
      }
    }
    load();
  }, [jobId]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const errs = {};
    if (form.title !== undefined && !form.title.trim()) errs.title = 'Job title cannot be empty.';
    if (form.department !== undefined && !form.department.trim()) errs.department = 'Department cannot be empty.';
    if (form.location !== undefined && !form.location.trim()) errs.location = 'Job location cannot be empty.';
    if (form.description !== undefined && !form.description.trim()) errs.description = 'Job description cannot be empty.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await api.patch(`/job/updateJob/${jobId}`, form);
      toast.success('Job updated successfully.');
      navigate('/osi-console/jobs');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="admin-page-center"><Spinner size="lg" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h2 className="admin-page__title">Edit Job</h2>
          <p className="admin-page__sub">Update job listing details.</p>
        </div>
        <Link to="/osi-console/jobs" className="admin-btn admin-btn--ghost">← Back</Link>
      </div>

      <form id="edit-job-form" className="admin-card admin-form-wide" onSubmit={handleSubmit} noValidate>
        <LoadingOverlay visible={loading} message="Saving changes…" />
        <FormErrorBanner errors={errors} />
        <div className="admin-form-grid">
          <FormField id="ej-title" label="Job Title" value={form.title}
            onChange={(e) => set('title', e.target.value)} error={errors.title} />

          <div className="admin-form-field">
            <label htmlFor="ej-department" className="admin-form-field__label">Department</label>
            <select id="ej-department" className="admin-select" value={form.department}
              onChange={(e) => set('department', e.target.value)}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <FormField id="ej-location" label="Location" value={form.location}
            onChange={(e) => set('location', e.target.value)} />

          <div className="admin-form-field">
            <label htmlFor="ej-employment-type" className="admin-form-field__label">Employment Type</label>
            <select id="ej-employment-type" className="admin-select" value={form.employmentType}
              onChange={(e) => set('employmentType', e.target.value)}>
              {EMP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <FormField id="ej-experience" label="Experience Level" value={form.experienceLevel}
            onChange={(e) => set('experienceLevel', e.target.value)} />

          <FormField id="ej-deadline" label="Application Deadline" type="date"
            value={form.applicationDeadline}
            onChange={(e) => set('applicationDeadline', e.target.value)} />
        </div>

        <div className="admin-form-field">
          <label htmlFor="ej-description" className="admin-form-field__label">Description</label>
          <textarea
            id="ej-description"
            className="admin-textarea"
            rows={8}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
          <p className="admin-form-field__hint">Markdown supported (headings, lists, bold, etc.)</p>
        </div>

        <div className="admin-form-toggles">
          <label className="admin-toggle">
            <input id="ej-is-live" type="checkbox" checked={form.isLive}
              onChange={(e) => set('isLive', e.target.checked)} />
            <span className="admin-toggle__track" />
            <span className="admin-toggle__label">Live</span>
          </label>
        </div>

        <div className="admin-form-actions">
          <Link to="/osi-console/jobs" className="admin-btn admin-btn--ghost">Cancel</Link>
          <button id="ej-submit" type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
