import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { AdminTable } from '../../components/ui/AdminTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';

const CAN_WRITE = ['ADMIN', 'RECRUITER'];

export function EmployeesPage() {
  const { role } = useAuth();
  const toast = useToast();
  const canWrite = CAN_WRITE.includes(role);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/employee/getAllTeamMembers');
      setMembers(res.data?.teamMembers || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/employee/deleteTeamMember/${deleteTarget._id}`);
      toast.success('Employee deleted.');
      setDeleteTarget(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  const rows = members.map((m) => [
    <div className="admin-table__person">
      {m.image?.url
        ? <img src={m.image.url} alt={m.name} className="admin-table__avatar" />
        : <span className="admin-table__avatar-placeholder">{m.name?.[0]}</span>}
      <div>
        <p className="admin-table__primary">{m.name}</p>
        <p className="admin-table__secondary">{m.designation}</p>
      </div>
    </div>,
    m.qualification,
    m.location,
    m.experience,
    <div className="admin-table__badges">
      {m.isLeader && <StatusBadge value="active" />}
      <StatusBadge value={m.isLive ? 'live' : 'draft'} />
    </div>,
    <div className="admin-table__actions">
      {m.resume?.url && (
        <a href={m.resume.url} target="_blank" rel="noopener noreferrer"
          className="admin-btn admin-btn--xs admin-btn--ghost">
          Resume
        </a>
      )}
      {canWrite && (
        <>
          <Link to={`/osi-console/employees/${m._id}/edit`} className="admin-btn admin-btn--xs admin-btn--ghost">
            Edit
          </Link>
          <button className="admin-btn admin-btn--xs admin-btn--danger"
            onClick={() => setDeleteTarget(m)}>
            Delete
          </button>
        </>
      )}
      {!canWrite && <span className="admin-table__readonly">View only</span>}
    </div>,
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h2 className="admin-page__title">Employees</h2>
          <p className="admin-page__sub">{members.length} team member{members.length !== 1 ? 's' : ''}</p>
        </div>
        {canWrite && (
          <Link to="/osi-console/employees/create" id="create-employee-btn" className="admin-btn admin-btn--primary">
            + Add Employee
          </Link>
        )}
      </div>

      {loading
        ? <div className="admin-page-center"><Spinner size="lg" /></div>
        : <AdminTable
            headers={['Employee', 'Qualification', 'Location', 'Experience', 'Status', 'Actions']}
            rows={rows}
            emptyMessage="No team members found."
          />
      }

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Employee"
        message={`Permanently delete ${deleteTarget?.name}? Their Cloudinary image and resume will also be removed.`}
        confirmLabel={deleteLoading ? 'Deleting…' : 'Delete'}
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
