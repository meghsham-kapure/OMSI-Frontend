import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { AdminTable } from '../../components/ui/AdminTable';
import { Spinner } from '../../components/ui/Spinner';
import { X, Check, Mail, Phone } from 'lucide-react';

const PAGE_SIZE = 10;

/**
 * Formats ISO date string to a readable local time.
 */
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function FeedbackPage() {
  const toast = useToast();

  const [responses, setResponses]     = useState([]);
  const [pagination, setPagination]   = useState({ page: 1, totalPages: 1, totalResponses: 0 });
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);

  // Detail modal state
  const [selected, setSelected]       = useState(null);
  const [markingRead, setMarkingRead] = useState(false);

  const fetchResponses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/feedback/getAllResponses?page=${page}&limit=${PAGE_SIZE}`);
      setResponses(res.data?.responses || []);
      setPagination(res.data?.pagination || { page: 1, totalPages: 1, totalResponses: 0 });
    } catch (err) {
      toast.error(err.message || 'Failed to load responses.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchResponses(); }, [fetchResponses]);

  async function markAsRead(feedbackId) {
    setMarkingRead(true);
    try {
      await api.patch(`/feedback/markAsRead/${feedbackId}`);
      // Optimistically update local state
      setResponses(prev =>
        prev.map(r => r._id === feedbackId ? { ...r, isRead: true } : r)
      );
      if (selected?._id === feedbackId) {
        setSelected(prev => ({ ...prev, isRead: true }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to mark as read.');
    } finally {
      setMarkingRead(false);
    }
  }

  function openDetail(response) {
    setSelected(response);
    // Auto-mark as read when opened if not already
    if (!response.isRead) {
      markAsRead(response._id);
    }
  }

  const rows = responses.map(r => [
    /* Name */
    <button
      key={`name-${r._id}`}
      className="text-left"
      onClick={() => openDetail(r)}
    >
      <span className={`block font-semibold text-sm ${r.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
        {!r.isRead && (
          <span className="inline-block w-2 h-2 rounded-full bg-brand-green mr-2 align-middle" title="Unread" />
        )}
        {r.fullName}
      </span>
      <span className="block text-xs text-gray-400">{r.emailAddress}</span>
    </button>,

    /* Enquiry Type */
    <span key={`type-${r._id}`} className="text-xs font-semibold px-2 py-1 rounded-full bg-brand-bg border border-brand-border text-brand-gray">
      {r.enquiryType || 'Project Consultancy'}
    </span>,

    /* Phone */
    <a key={`phone-${r._id}`} href={`tel:${r.phoneNumber}`} className="text-xs text-brand-gray hover:text-brand-green transition-colors">
      {r.phoneNumber}
    </a>,

    /* Organisation */
    <span key={`org-${r._id}`} className="text-xs text-gray-500">{r.organisationName || '—'}</span>,

    /* Status */
    <span
      key={`read-${r._id}`}
      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
        r.isRead
          ? 'bg-gray-50 text-gray-400 border-gray-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}
    >
      {r.isRead ? 'Read' : 'Unread'}
    </span>,

    /* Date */
    <span key={`date-${r._id}`} className="text-xs text-gray-400">{fmtDate(r.createdAt)}</span>,

    /* Actions */
    <div key={`actions-${r._id}`} className="admin-table__actions">
      <button
        className="admin-btn admin-btn--xs admin-btn--ghost"
        onClick={() => openDetail(r)}
      >
        View
      </button>
    </div>,
  ]);

  const unreadCount = responses.filter(r => !r.isRead).length;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <h2 className="admin-page__title">Feedback & Enquiries</h2>
          <p className="admin-page__sub">
            {pagination.totalResponses} total response{pagination.totalResponses !== 1 ? 's' : ''}
            {unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-page-center"><Spinner size="lg" /></div>
      ) : (
        <AdminTable
          headers={['Sender', 'Enquiry Type', 'Phone', 'Organisation', 'Status', 'Received', 'Actions']}
          rows={rows}
          emptyMessage="No enquiries received yet."
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

      {/* ── Detail Modal ─────────────────────────────────────────────── */}
      {selected && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelected(null)}
        >
          <div
            className="admin-modal"
            style={{ maxWidth: 600 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="admin-modal__header">
              <div>
                <h3 className="admin-modal__title">{selected.fullName}</h3>
                <p className="admin-modal__sub">{fmtDate(selected.createdAt)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {!selected.isRead && (
                  <button
                    className="admin-btn admin-btn--sm admin-btn--primary"
                    disabled={markingRead}
                    onClick={() => markAsRead(selected._id)}
                  >
                    {markingRead ? 'Marking…' : 'Mark as Read'}
                  </button>
                )}
                <button className="admin-modal__close" onClick={() => setSelected(null)}><X size={18} /></button>
              </div>
            </div>

            {/* Modal body */}
            <div className="admin-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Email',             value: selected.emailAddress },
                  { label: 'Phone',             value: selected.phoneNumber },
                  { label: 'Organisation',      value: selected.organisationName || '—' },
                  { label: 'Enquiry Type',      value: selected.enquiryType || 'Project Consultancy' },
                  { label: 'Preferred Contact', value: selected.preferredContactTime || '—' },
                  { label: 'Read Status',       value: selected.isRead ? 'Read' : 'Unread' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--admin-gray)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--admin-gray)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Project Requirements
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
                  {selected.description}
                </div>
              </div>

              {/* Quick reply links */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <a
                  href={`mailto:${selected.emailAddress}?subject=Re: ${encodeURIComponent(selected.enquiryType || 'Your Enquiry')}`}
                  className="admin-btn admin-btn--sm admin-btn--primary"
                >
                  <Mail size={14} /> Reply via Email
                </a>
                <a
                  href={`tel:${selected.phoneNumber}`}
                  className="admin-btn admin-btn--sm admin-btn--ghost"
                >
                  <Phone size={14} /> Call
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackPage;
