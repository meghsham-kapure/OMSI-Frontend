import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { FormField } from '../../components/ui/FormField';
import { FileUpload } from '../../components/ui/FileUpload';
import { FormErrorBanner } from '../../components/ui/FormErrorBanner';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { Spinner } from '../../components/ui/Spinner';

const CATEGORIES = ['Construction', 'Transportation', 'Structural', 'Water', 'Surveying'];
const STATUSES = ['Upcoming', 'Ongoing', 'Finished'];

/** Convert ISO date string → YYYY-MM-DD for <input type="date"> */
function toDateInput(iso) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function EditProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(null); // null = loading
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/project/getProjectById/${projectId}`);
        const p = res.data;
        setForm({
          title: p.title || '',
          category: p.category || 'Construction',
          status: p.status || 'Ongoing',
          location: p.location || '',
          client: p.client || '',
          description: p.description || '',
          budget: p.budget || '',
          startDate: toDateInput(p.startDate),
          endDate: toDateInput(p.endDate),
          isLive: p.isLive ?? true,
          teamLeader: p.teamLeader || '',
          isFeatured: p.isFeatured ?? false,
        });
        setExistingImages(p.images || []);
      } catch (err) {
        toast.error('Failed to load project: ' + err.message);
        navigate('/osi-console/projects');
      } finally {
        setFetching(false);
      }
    }
    load();
  }, [projectId]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const errs = {};
    const t = form.title?.trim();
    if (t !== undefined && t.length > 0 && t.length < 5) errs.title = `Title is too short — minimum 5 characters (currently ${t.length}).`;
    if (t !== undefined && !t) errs.title = 'Title cannot be empty.';

    const desc = form.description?.trim();
    if (desc !== undefined && desc.length > 0 && desc.length < 50) errs.description = `Description is too short — minimum 50 characters (currently ${desc.length}).`;

    const loc = form.location?.trim();
    if (loc !== undefined && loc.length > 0 && loc.length < 5) errs.location = `Location is too short — minimum 5 characters (currently ${loc.length}).`;

    const cl = form.client?.trim();
    if (cl !== undefined && cl.length > 0 && cl.length < 5) errs.client = `Client name is too short — minimum 5 characters (currently ${cl.length}).`;

    const bud = form.budget?.trim();
    if (bud !== undefined && bud.length > 0 && bud.length < 5) errs.budget = `Budget is too short — minimum 5 characters (currently ${bud.length}).`;

    const tl = form.teamLeader?.trim();
    if (tl !== undefined && tl.length > 0 && tl.length < 2) errs.teamLeader = `Team leader name is too short — minimum 2 characters.`;

    if ((existingImages.length + newImages.length) > 3) errs.images = `Too many images — maximum 3 allowed (${existingImages.length} existing + ${newImages.length} new).`;
    if (form.isFeatured && existingImages.length === 0 && newImages.length === 0)
      errs.images = 'Featured projects require at least 1 image.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== undefined && v !== null) fd.append(k, String(v));
      });
      newImages.forEach((img) => fd.append('images', img));

      await api.patch(`/project/updateProject/${projectId}`, fd);
      toast.success('Project updated successfully.');
      navigate('/osi-console/projects');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <div className="admin-page-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h2 className="admin-page__title">Edit Project</h2>
          <p className="admin-page__sub">Update project details.</p>
        </div>
        <Link to="/osi-console/projects" className="admin-btn admin-btn--ghost">← Back</Link>
      </div>

      <form id="edit-project-form" className="admin-card admin-form-wide" onSubmit={handleSubmit} noValidate>
        <LoadingOverlay visible={loading} message="Saving changes…" />
        <FormErrorBanner errors={errors} />
        <div className="admin-form-grid">
          <FormField id="ep-title" label="Title" value={form.title}
            onChange={(e) => set('title', e.target.value)} error={errors.title} />

          <div className="admin-form-field">
            <label htmlFor="ep-category" className="admin-form-field__label">Category</label>
            <select id="ep-category" className="admin-select" value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="admin-form-field">
            <label htmlFor="ep-status" className="admin-form-field__label">Status</label>
            <select id="ep-status" className="admin-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <FormField id="ep-location" label="Location" value={form.location}
            onChange={(e) => set('location', e.target.value)} />

          <FormField id="ep-client" label="Client" value={form.client}
            onChange={(e) => set('client', e.target.value)} />

          <FormField id="ep-budget" label="Budget" value={form.budget}
            onChange={(e) => set('budget', e.target.value)} />

          <FormField id="ep-team-leader" label="Team Leader" value={form.teamLeader}
            onChange={(e) => set('teamLeader', e.target.value)} />

          <FormField id="ep-start-date" label="Start Date" type="date" value={form.startDate}
            onChange={(e) => set('startDate', e.target.value)} />

          <FormField id="ep-end-date" label="End Date" type="date" value={form.endDate}
            onChange={(e) => set('endDate', e.target.value)} />
        </div>

        <div className="admin-form-field">
          <label htmlFor="ep-description" className="admin-form-field__label">Description</label>
          <textarea id="ep-description" className="admin-textarea" rows={4}
            value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div className="admin-form-toggles">
          <label className="admin-toggle">
            <input id="ep-is-live" type="checkbox" checked={form.isLive} onChange={(e) => set('isLive', e.target.checked)} />
            <span className="admin-toggle__track" />
            <span className="admin-toggle__label">Live</span>
          </label>
          <label className="admin-toggle">
            <input id="ep-is-featured" type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
            <span className="admin-toggle__track" />
            <span className="admin-toggle__label">Featured</span>
          </label>
        </div>

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div className="admin-form-field">
            <label className="admin-form-field__label">Current Images</label>
            <p className="admin-form-field__hint">
              {existingImages.length} existing image{existingImages.length !== 1 ? 's' : ''} will be kept. New uploads below will be added alongside them.
            </p>
            <div className="admin-existing-images">
              {existingImages.map((img, i) => (
                <img key={img.publicId || i} src={img.url} alt={`Project image ${i + 1}`}
                  className="admin-existing-images__img" />
              ))}
            </div>
          </div>
        )}

        {/* New images */}
        <FileUpload
          id="ep-images"
          label="Add More Images (optional)"
          accept="image/png,image/jpeg"
          multiple
          files={newImages}
          onChange={setNewImages}
          error={errors.images}
          hint={`PNG, JPG, JPEG · max ${3 - existingImages.length} more · max 5 MB each`}
        />

        <div className="admin-form-actions">
          <Link to="/osi-console/projects" className="admin-btn admin-btn--ghost">Cancel</Link>
          <button id="ep-submit" type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
