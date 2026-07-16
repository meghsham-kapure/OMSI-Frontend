import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { FormField } from '../../components/ui/FormField';
import { FileUpload } from '../../components/ui/FileUpload';
import { TagInput } from '../../components/ui/TagInput';
import { FormErrorBanner } from '../../components/ui/FormErrorBanner';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { Spinner } from '../../components/ui/Spinner';

export function EditEmployeePage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(null); // null = loading
  const [specializations, setSpecializations] = useState([]);
  const [keyProjects, setKeyProjects] = useState([]);
  const [existingImage, setExistingImage] = useState(null);
  const [existingResume, setExistingResume] = useState(null);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newResumeFiles, setNewResumeFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/employee/getAllTeamMembers');
        const members = res.data?.teamMembers || [];
        const member = members.find((m) => m._id === employeeId);
        if (!member) throw new Error('Employee not found.');

        setForm({
          name: member.name || '',
          designation: member.designation || '',
          qualification: member.qualification || '',
          experience: member.experience || '',
          location: member.location || '',
          email: member.email || '',
          phone: member.phone || '',
          isLeader: member.isLeader ?? false,
          isLive: member.isLive ?? true,
        });
        setSpecializations(member.specializations || []);
        setKeyProjects(member.keyProjects || []);
        setExistingImage(member.image || null);
        setExistingResume(member.resume || null);
      } catch (err) {
        toast.error('Failed to load employee: ' + err.message);
        navigate('/osi-console/employees');
      } finally {
        setFetching(false);
      }
    }
    load();
  }, [employeeId]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const errs = {};
    const n = form.name?.trim();
    if (n !== undefined && !n) errs.name = 'Full name cannot be empty.';

    const d = form.designation?.trim();
    if (d !== undefined && !d) errs.designation = 'Designation cannot be empty.';

    const q = form.qualification?.trim();
    if (q !== undefined && !q) errs.qualification = 'Qualification cannot be empty.';

    const exp = form.experience?.trim();
    if (exp !== undefined && !exp) errs.experience = 'Experience cannot be empty.';

    const loc = form.location?.trim();
    if (loc !== undefined && !loc) errs.location = 'Location cannot be empty.';

    const em = form.email?.trim();
    if (em !== undefined && !em) errs.email = 'Email cannot be empty.';
    else if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) errs.email = 'Invalid email address.';

    const ph = form.phone?.trim();
    if (ph !== undefined && !ph) errs.phone = 'Phone number cannot be empty.';
    else if (ph && ph.length < 10) errs.phone = `Phone number must be at least 10 digits (currently ${ph.length}).`;

    if (specializations.length === 0) errs.specializations = 'At least one specialization is required.';
    if (keyProjects.length === 0) errs.keyProjects = 'At least one key project is required.';

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
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== undefined && v !== null) fd.append(k, String(v));
      });

      // Arrays as JSON strings
      fd.append('specializations', JSON.stringify(specializations));
      fd.append('keyProjects', JSON.stringify(keyProjects));

      // Optional file replacements
      if (newImageFiles.length > 0) fd.append('image', newImageFiles[0]);
      if (newResumeFiles.length > 0) fd.append('resume', newResumeFiles[0]);

      await api.patch(`/employee/editTeamMember/${employeeId}`, fd);
      toast.success('Employee updated successfully.');
      navigate('/osi-console/employees');
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
          <h2 className="admin-page__title">Edit Employee</h2>
          <p className="admin-page__sub">Update team member details.</p>
        </div>
        <Link to="/osi-console/employees" className="admin-btn admin-btn--ghost">← Back</Link>
      </div>

      <form id="edit-employee-form" className="admin-card admin-form-wide" onSubmit={handleSubmit} noValidate>
        <LoadingOverlay visible={loading} message="Saving changes…" />
        <FormErrorBanner errors={errors} />
        <div className="admin-form-grid">
          <FormField id="ee-name" label="Full Name" value={form.name}
            onChange={(e) => set('name', e.target.value)} error={errors.name} placeholder="John Doe" />

          <FormField id="ee-designation" label="Designation" value={form.designation}
            onChange={(e) => set('designation', e.target.value)} error={errors.designation}
            placeholder="Senior Engineer" />

          <FormField id="ee-qualification" label="Qualification" value={form.qualification}
            onChange={(e) => set('qualification', e.target.value)} error={errors.qualification}
            placeholder="B.E Civil" />

          <FormField id="ee-experience" label="Experience" value={form.experience}
            onChange={(e) => set('experience', e.target.value)} error={errors.experience}
            placeholder="10 years" />

          <FormField id="ee-location" label="Location" value={form.location}
            onChange={(e) => set('location', e.target.value)} error={errors.location}
            placeholder="Pune" />

          <FormField id="ee-email" label="Email" type="email" value={form.email}
            onChange={(e) => set('email', e.target.value)} error={errors.email}
            placeholder="john@example.com" />

          <FormField id="ee-phone" label="Phone" value={form.phone}
            onChange={(e) => set('phone', e.target.value)} error={errors.phone}
            placeholder="9876543210" hint="Min 10 digits." />
        </div>

        {/* Tag inputs */}
        <div className="admin-form-field">
          <label htmlFor="ee-specializations" className="admin-form-field__label">
            Specializations <span className="admin-form-field__req">*</span>
          </label>
          <TagInput id="ee-specializations" values={specializations} onChange={setSpecializations}
            placeholder="Type a specialization and press Enter" />
          {errors.specializations && <p className="admin-form-field__error">{errors.specializations}</p>}
        </div>

        <div className="admin-form-field">
          <label htmlFor="ee-key-projects" className="admin-form-field__label">
            Key Projects <span className="admin-form-field__req">*</span>
          </label>
          <TagInput id="ee-key-projects" values={keyProjects} onChange={setKeyProjects}
            placeholder="Type a project name and press Enter" />
          {errors.keyProjects && <p className="admin-form-field__error">{errors.keyProjects}</p>}
        </div>

        {/* Toggles */}
        <div className="admin-form-toggles">
          <label className="admin-toggle">
            <input id="ee-is-leader" type="checkbox" checked={form.isLeader}
              onChange={(e) => set('isLeader', e.target.checked)} />
            <span className="admin-toggle__track" />
            <span className="admin-toggle__label">Team Leader</span>
          </label>
          <label className="admin-toggle">
            <input id="ee-is-live" type="checkbox" checked={form.isLive}
              onChange={(e) => set('isLive', e.target.checked)} />
            <span className="admin-toggle__track" />
            <span className="admin-toggle__label">Live (visible on public site)</span>
          </label>
        </div>

        {/* Existing profile photo */}
        {existingImage?.url && (
          <div className="admin-form-field">
            <label className="admin-form-field__label">Current Photo</label>
            <p className="admin-form-field__hint">
              Upload a new image below to replace the current one.
            </p>
            <div className="admin-existing-images">
              <img src={existingImage.url} alt="Current profile" className="admin-existing-images__img" />
            </div>
          </div>
        )}

        {/* New image upload */}
        <FileUpload id="ee-image" label="Replace Photo (optional)" accept="image/png,image/jpeg"
          files={newImageFiles} onChange={setNewImageFiles} error={errors.image}
          hint="PNG, JPG, JPEG · max 10 MB · leave empty to keep current" />

        {/* Existing resume */}
        {existingResume?.url && (
          <div className="admin-form-field">
            <label className="admin-form-field__label">Current Resume</label>
            <p className="admin-form-field__hint">
              Upload a new PDF below to replace the current one.
            </p>
            <a href={existingResume.url} target="_blank" rel="noopener noreferrer"
              className="admin-btn admin-btn--sm admin-btn--ghost" style={{ marginTop: 6 }}>
              View current resume ↗
            </a>
          </div>
        )}

        {/* New resume upload */}
        <FileUpload id="ee-resume" label="Replace Resume (optional — PDF only)" accept=".pdf,application/pdf"
          files={newResumeFiles} onChange={setNewResumeFiles} error={errors.resume}
          hint="PDF only · max 10 MB · leave empty to keep current" />

        <div className="admin-form-actions">
          <Link to="/osi-console/employees" className="admin-btn admin-btn--ghost">Cancel</Link>
          <button id="ee-submit" type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
