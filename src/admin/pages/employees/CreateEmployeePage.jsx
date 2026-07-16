import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { FormField } from '../../components/ui/FormField';
import { FileUpload } from '../../components/ui/FileUpload';
import { TagInput } from '../../components/ui/TagInput';
import { FormErrorBanner } from '../../components/ui/FormErrorBanner';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';

const INITIAL = {
  slug: '', name: '', designation: '', qualification: '',
  experience: '', location: '', email: '', phone: '',
  isLeader: false, isLive: true,
};

/** Convert a name to a URL slug */
function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function CreateEmployeePage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(INITIAL);
  const [specializations, setSpecializations] = useState([]);
  const [keyProjects, setKeyProjects] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((f) => {
      const updated = { ...f, [field]: value };
      // Auto-generate slug from name if slug hasn't been manually set
      if (field === 'name' && !f._slugManual) {
        updated.slug = toSlug(value);
      }
      if (field === 'slug') {
        updated._slugManual = true;
      }
      return updated;
    });
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.slug.trim()) errs.slug = 'URL slug is required (auto-generated from name, or enter manually).';
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.designation.trim()) errs.designation = 'Designation is required (e.g. Senior Engineer).';
    if (!form.qualification.trim()) errs.qualification = 'Qualification is required (e.g. B.E Civil).';
    if (!form.experience.trim()) errs.experience = 'Experience is required (e.g. 10 years).';
    if (!form.location.trim()) errs.location = 'Location is required (e.g. Pune).';
    if (!form.email.trim()) errs.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address. Please enter a valid email.';
    if (!form.phone.trim()) errs.phone = 'Phone number is required.';
    else if (form.phone.trim().length < 10) errs.phone = `Phone number must be at least 10 digits (currently ${form.phone.trim().length}).`;
    if (specializations.length === 0) errs.specializations = 'Add at least one specialization — type and press Enter.';
    if (keyProjects.length === 0) errs.keyProjects = 'Add at least one key project — type and press Enter.';
    if (imageFiles.length === 0) errs.image = 'Profile photo is required — upload a PNG or JPG image.';
    if (resumeFiles.length === 0) errs.resume = 'Resume is required — upload a PDF file.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      // Append scalar fields
      const { _slugManual, ...rest } = form;
      Object.entries(rest).forEach(([k, v]) => fd.append(k, String(v)));

      // Arrays as JSON strings (backend accepts both formats)
      fd.append('specializations', JSON.stringify(specializations));
      fd.append('keyProjects', JSON.stringify(keyProjects));

      fd.append('image', imageFiles[0]);
      fd.append('resume', resumeFiles[0]);

      await api.post('/employee/createTeamMember', fd);
      toast.success('Employee created successfully.');
      navigate('/osi-console/employees');
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
          <h2 className="admin-page__title">Add Employee</h2>
          <p className="admin-page__sub">Create a new team member profile.</p>
        </div>
        <Link to="/osi-console/employees" className="admin-btn admin-btn--ghost">← Back</Link>
      </div>

      <form id="create-employee-form" className="admin-card admin-form-wide" onSubmit={handleSubmit} noValidate>
        <LoadingOverlay visible={loading} message="Adding employee…" />
        <FormErrorBanner errors={errors} />
        <div className="admin-form-grid">
          <FormField id="ce-name" label="Full Name" required value={form.name}
            onChange={(e) => set('name', e.target.value)} error={errors.name} placeholder="John Doe" />

          <FormField id="ce-slug" label="Slug (URL-friendly ID)" required value={form.slug}
            onChange={(e) => set('slug', e.target.value)} error={errors.slug}
            hint="Auto-generated from name. Edit if needed." placeholder="john-doe" />

          <FormField id="ce-designation" label="Designation" required value={form.designation}
            onChange={(e) => set('designation', e.target.value)} error={errors.designation}
            placeholder="Senior Engineer" />

          <FormField id="ce-qualification" label="Qualification" required value={form.qualification}
            onChange={(e) => set('qualification', e.target.value)} error={errors.qualification}
            placeholder="B.E Civil" />

          <FormField id="ce-experience" label="Experience" required value={form.experience}
            onChange={(e) => set('experience', e.target.value)} error={errors.experience}
            placeholder="10 years" />

          <FormField id="ce-location" label="Location" required value={form.location}
            onChange={(e) => set('location', e.target.value)} error={errors.location}
            placeholder="Pune" />

          <FormField id="ce-email" label="Email" type="email" required value={form.email}
            onChange={(e) => set('email', e.target.value)} error={errors.email}
            placeholder="john@example.com" />

          <FormField id="ce-phone" label="Phone" required value={form.phone}
            onChange={(e) => set('phone', e.target.value)} error={errors.phone}
            placeholder="9876543210" hint="Min 10 digits." />
        </div>

        {/* Tag inputs */}
        <div className="admin-form-field">
          <label htmlFor="ce-specializations" className="admin-form-field__label">
            Specializations <span className="admin-form-field__req">*</span>
          </label>
          <TagInput id="ce-specializations" values={specializations} onChange={setSpecializations}
            placeholder="Type a specialization and press Enter" />
          {errors.specializations && <p className="admin-form-field__error">{errors.specializations}</p>}
        </div>

        <div className="admin-form-field">
          <label htmlFor="ce-key-projects" className="admin-form-field__label">
            Key Projects <span className="admin-form-field__req">*</span>
          </label>
          <TagInput id="ce-key-projects" values={keyProjects} onChange={setKeyProjects}
            placeholder="Type a project name and press Enter" />
          {errors.keyProjects && <p className="admin-form-field__error">{errors.keyProjects}</p>}
        </div>

        {/* Toggles */}
        <div className="admin-form-toggles">
          <label className="admin-toggle">
            <input id="ce-is-leader" type="checkbox" checked={form.isLeader}
              onChange={(e) => set('isLeader', e.target.checked)} />
            <span className="admin-toggle__track" />
            <span className="admin-toggle__label">Team Leader</span>
          </label>
          <label className="admin-toggle">
            <input id="ce-is-live" type="checkbox" checked={form.isLive}
              onChange={(e) => set('isLive', e.target.checked)} />
            <span className="admin-toggle__track" />
            <span className="admin-toggle__label">Live (visible on public site)</span>
          </label>
        </div>

        {/* File uploads */}
        <FileUpload id="ce-image" label="Profile Photo *" accept="image/png,image/jpeg"
          files={imageFiles} onChange={setImageFiles} error={errors.image}
          hint="PNG, JPG, JPEG · max 10 MB" />

        <FileUpload id="ce-resume" label="Resume * (PDF only)" accept=".pdf,application/pdf"
          files={resumeFiles} onChange={setResumeFiles} error={errors.resume}
          hint="PDF only · max 10 MB" />

        <div className="admin-form-actions">
          <Link to="/osi-console/employees" className="admin-btn admin-btn--ghost">Cancel</Link>
          <button id="ce-submit" type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
            {loading ? 'Creating…' : 'Add Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}
