import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { AdminTable } from '../../components/ui/AdminTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import { X, FileText, Globe, Paperclip, Mail, Phone } from 'lucide-react';

const PAGE_SIZE = 15;

const APPLICATION_STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Hired'];

const CAN_WRITE = ['ADMIN', 'RECRUITER', 'SUPERADMIN'];

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function ApplicationsPage() {
  const toast    = useToast();
  const { role } = useAuth();
  const canWrite = CAN_WRITE.includes(role);

  // List state
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination]     = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);

  // Filter state
  const [search, setSearch]             = useState('');
  const [filterJobId, setFilterJobId]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUnread, setFilterUnread] = useState('');
  const [minExp, setMinExp]             = useState('');
  const [maxExp, setMaxExp]             = useState('');

  // Jobs list for filter dropdown
  const [jobs, setJobs] = useState([]);

  // Detail modal state
  const [selected, setSelected]         = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch jobs list (once) for filter dropdown ────────────────────────────
  useEffect(() => {
    api.get('/job/getJobs?limit=100&isLive=')
      .then(res => setJobs(res.data?.jobs || []))
      .catch(() => {/* non-critical */});
  }, []);

  // ── Fetch applications ─────────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE });
      if (search)       params.set('search', search);
      if (filterJobId)  params.set('jobId', filterJobId);
      if (filterStatus) params.set('status', filterStatus);
      if (filterUnread) params.set('isRead', 'false');
      if (minExp !== '') params.set('minExperience', minExp);
      if (maxExp !== '') params.set('maxExperience', maxExp);

      const res = await api.get(`/job-applications/getApplications?${params}`);
      setApplications(res.data?.applications || []);
      setPagination(res.data?.pagination  || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      toast.error(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterJobId, filterStatus, filterUnread, minExp, maxExp]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  // ── Mark as read ───────────────────────────────────────────────────────────
  async function markAsRead(appId) {
    try {
      await api.patch(`/job-applications/markApplicationAsRead/${appId}`);
      setApplications(prev =>
        prev.map(a => a._id === appId ? { ...a, isRead: true } : a)
      );
      if (selected?._id === appId) {
        setSelected(prev => ({ ...prev, isRead: true }));
      }
    } catch {
      // Fire-and-forget; silently ignore errors
    }
  }

  function openDetail(app) {
    setSelected(app);
    if (!app.isRead) markAsRead(app._id);
  }

  // ── Status update ──────────────────────────────────────────────────────────
  async function handleStatusChange(appId, newStatus) {
    setUpdatingStatus(true);
    try {
      await api.patch(`/job-applications/updateApplicationStatus/${appId}`, { status: newStatus });
      setApplications(prev =>
        prev.map(a => a._id === appId ? { ...a, status: newStatus } : a)
      );
      if (selected?._id === appId) {
        setSelected(prev => ({ ...prev, status: newStatus }));
      }
      toast.success('Status updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/job-applications/deleteApplication/${deleteTarget._id}`);
      toast.success('Application deleted.');
      setDeleteTarget(null);
      setSelected(null);
      fetchApplications();
    } catch (err) {
      toast.error(err.message || 'Failed to delete application.');
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Search submit ──────────────────────────────────────────────────────────
  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  }

  // ── Table rows ─────────────────────────────────────────────────────────────
  const unreadCount = applications.filter(a => !a.isRead).length;

  const rows = applications.map(a => [
    /* Candidate */
    <button key={`name-${a._id}`} className="text-left" onClick={() => openDetail(a)}>
      <span className={`block font-semibold text-sm ${a.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
        {!a.isRead && (
          <span className="inline-block w-2 h-2 rounded-full bg-brand-green mr-2 align-middle" title="Unread" />
        )}
        {a.fullName}
      </span>
      <span className="block text-xs text-gray-400">{a.email}</span>
    </button>,

    /* Phone */
    <a key={`phone-${a._id}`} href={`tel:${a.phoneNumber}`} className="text-xs text-brand-gray hover:text-brand-green transition-colors">
      {a.phoneNumber}
    </a>,

    /* Experience */
    <span key={`exp-${a._id}`} className="text-xs text-gray-500">
      {a.yearsOfExperience != null ? `${a.yearsOfExperience} yr${a.yearsOfExperience !== 1 ? 's' : ''}` : '—'}
    </span>,

    /* Job */
    <span key={`job-${a._id}`} className="text-xs text-gray-600">
      <span className="font-semibold">{a.jobId?.title || '—'}</span>
      {a.jobId?.department && <span className="block text-gray-400">{a.jobId.department}</span>}
    </span>,

    /* Status */
    <StatusBadge key={`status-${a._id}`} value={a.status} />,

    /* Read indicator */
    <span
      key={`read-${a._id}`}
      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
        a.isRead
          ? 'bg-gray-50 text-gray-400 border-gray-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}
    >
      {a.isRead ? 'Read' : 'Unread'}
    </span>,

    /* Date */
    <span key={`date-${a._id}`} className="text-xs text-gray-400">{fmtDate(a.createdAt)}</span>,

    /* Actions */
    <div key={`actions-${a._id}`} className="admin-table__actions">
      <button className="admin-btn admin-btn--xs admin-btn--ghost" onClick={() => openDetail(a)}>
        View
      </button>
      {canWrite && (
        <button
          className="admin-btn admin-btn--xs admin-btn--danger"
          onClick={() => setDeleteTarget(a)}
        >
          Delete
        </button>
      )}
    </div>,
  ]);

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <h2 className="admin-page__title">Applications</h2>
          <p className="admin-page__sub">
            {pagination.total ?? 0} total application{(pagination.total ?? 0) !== 1 ? 's' : ''}
            {unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <form className="admin-filters" onSubmit={handleSearch}>
        <input
          id="apps-search"
          type="search"
          className="admin-input admin-input--search"
          placeholder="Search name, email, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          id="apps-job"
          className="admin-select"
          value={filterJobId}
          onChange={(e) => { setFilterJobId(e.target.value); setPage(1); }}
        >
          <option value="">All Jobs</option>
          {jobs.map(j => (
            <option key={j._id} value={j._id}>{j.title}</option>
          ))}
        </select>

        <select
          id="apps-status"
          className="admin-select"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {APPLICATION_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          id="apps-unread"
          className="admin-select"
          value={filterUnread}
          onChange={(e) => { setFilterUnread(e.target.value); setPage(1); }}
        >
          <option value="">All (read &amp; unread)</option>
          <option value="true">Unread only</option>
        </select>

        <input
          id="apps-min-exp"
          type="number" min={0}
          className="admin-input"
          placeholder="Min exp (yrs)"
          value={minExp}
          onChange={(e) => { setMinExp(e.target.value); setPage(1); }}
          style={{ width: 130 }}
        />
        <input
          id="apps-max-exp"
          type="number" min={0}
          className="admin-input"
          placeholder="Max exp (yrs)"
          value={maxExp}
          onChange={(e) => { setMaxExp(e.target.value); setPage(1); }}
          style={{ width: 130 }}
        />

        <button type="submit" className="admin-btn admin-btn--primary">Search</button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="admin-page-center"><Spinner size="lg" /></div>
      ) : (
        <AdminTable
          headers={['Candidate', 'Phone', 'Experience', 'Job', 'Status', 'Read', 'Received', 'Actions']}
          rows={rows}
          emptyMessage="No applications found."
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-btn admin-btn--ghost admin-btn--sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </button>
          <span className="admin-pagination__info">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            className="admin-btn admin-btn--ghost admin-btn--sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <div
            className="admin-modal"
            style={{ maxWidth: 680 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="admin-modal__header">
              <div>
                <h3 className="admin-modal__title">{selected.fullName}</h3>
                <p className="admin-modal__sub">
                  Applied {fmtDate(selected.createdAt)}
                  {selected.jobId?.title && ` · ${selected.jobId.title}`}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {canWrite && (
                  <button
                    className="admin-btn admin-btn--sm admin-btn--danger"
                    onClick={() => setDeleteTarget(selected)}
                  >
                    Delete
                  </button>
                )}
                <button className="admin-modal__close" onClick={() => setSelected(null)}><X size={18} /></button>
              </div>
            </div>

            {/* Modal body */}
            <div className="admin-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Email',            value: selected.email },
                  { label: 'Phone',            value: selected.phoneNumber },
                  { label: 'Location',         value: selected.currentLocation || '—' },
                  { label: 'Organisation',     value: selected.currentOrganisation || '—' },
                  { label: 'Experience',       value: selected.yearsOfExperience != null ? `${selected.yearsOfExperience} years` : '—' },
                  { label: 'Department',       value: selected.jobId?.department || '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--admin-gray)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Status selector */}
              {canWrite && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--admin-gray)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Application Status
                  </p>
                  <select
                    value={selected.status || 'Applied'}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange(selected._id, e.target.value)}
                    className="admin-select"
                    id="modal-status-select"
                  >
                    {APPLICATION_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Document links */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--admin-gray)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Documents
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selected.resumeLink && (
                    <a href={selected.resumeLink} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--sm admin-btn--ghost">
                      <FileText size={14} /> Resume ↗
                    </a>
                  )}
                  {selected.portfolioLink && (
                    <a href={selected.portfolioLink} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--sm admin-btn--ghost">
                      <Globe size={14} /> Portfolio ↗
                    </a>
                  )}
                  {(selected.otherDocumentLinks || []).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--sm admin-btn--ghost">
                      <Paperclip size={14} /> Document {i + 1} ↗
                    </a>
                  ))}
                  {!selected.resumeLink && !selected.portfolioLink && !(selected.otherDocumentLinks?.length) && (
                    <span style={{ fontSize: 13, color: 'var(--admin-gray)' }}>No documents provided.</span>
                  )}
                </div>
              </div>

              {/* Cover letter */}
              {selected.coverLetter && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--admin-gray)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Cover Letter
                  </p>
                  <div style={{
                    background: 'var(--admin-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    fontSize: 13,
                    color: 'var(--admin-text)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {selected.coverLetter}
                  </div>
                </div>
              )}

              {/* Quick reply links */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <a
                  href={`mailto:${selected.email}?subject=Re: Your Application — ${encodeURIComponent(selected.jobId?.title || 'Position')}`}
                  className="admin-btn admin-btn--sm admin-btn--primary"
                >
                  <Mail size={14} /> Reply via Email
                </a>
                <a href={`tel:${selected.phoneNumber}`} className="admin-btn admin-btn--sm admin-btn--ghost">
                  <Phone size={14} /> Call
                </a>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Application"
        message={`Permanently delete the application from "${deleteTarget?.fullName}"? This cannot be undone.`}
        confirmLabel={deleteLoading ? 'Deleting…' : 'Delete'}
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default ApplicationsPage;
