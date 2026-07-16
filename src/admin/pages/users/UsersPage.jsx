import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { AdminTable } from '../../components/ui/AdminTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';

const ROLES = ['SUPERADMIN', 'ADMIN', 'ENGINEER', 'RECRUITER', 'USER'];

export function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState(null); // { userId, email }
  const [roleTarget, setRoleTarget] = useState(null);     // { userId, email, currentRole }
  const [selectedRole, setSelectedRole] = useState('');
  const [emailTarget, setEmailTarget] = useState(null);   // { userId }
  const [newEmail, setNewEmail] = useState('');
  const [pwTarget, setPwTarget] = useState(null);         // { userId }
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await api.get('/user/getAllUsers');
      // getAllUsers has nested structure: res.data.data is the array
      const data = res.data?.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await api.delete('/user/deleteUserById', { deleteUserId: deleteTarget.userId });
      toast.success('User deleted.');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleStatus(userId, currentStatus) {
    try {
      await api.patch('/user/toggleUserStatus', { userId, isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleRoleChange() {
    if (!roleTarget || !selectedRole) return;
    setActionLoading(true);
    try {
      await api.patch('/user/changeRole', { userId: roleTarget.userId, role: selectedRole });
      toast.success('Role updated.');
      setRoleTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEmailChange() {
    if (!emailTarget || !newEmail) return;
    setActionLoading(true);
    try {
      await api.patch('/user/changeEmail', { userId: emailTarget.userId, email: newEmail });
      toast.success('Email updated.');
      setEmailTarget(null);
      setNewEmail('');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePasswordReset() {
    if (!pwTarget || !newPassword) return;
    setActionLoading(true);
    try {
      await api.patch('/user/changePassword', { userId: pwTarget.userId, password: newPassword });
      toast.success('Password reset.');
      setPwTarget(null);
      setNewPassword('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const rows = users.map((u) => [
    <span className="admin-table__email">{u.email}</span>,
    <StatusBadge value={u.role} />,
    <StatusBadge value={u.isActive ? 'active' : 'inactive'} />,
    <div className="admin-table__actions">
      {/* Toggle status */}
      <button
        className={`admin-btn admin-btn--xs ${u.isActive ? 'admin-btn--ghost' : 'admin-btn--success'}`}
        onClick={() => handleToggleStatus(u._id, u.isActive)}
        title={u.isActive ? 'Deactivate user' : 'Activate user'}
      >
        {u.isActive ? 'Deactivate' : 'Activate'}
      </button>
      {/* Change role */}
      <button
        className="admin-btn admin-btn--xs admin-btn--ghost"
        onClick={() => { setRoleTarget({ userId: u._id, email: u.email, currentRole: u.role }); setSelectedRole(u.role); }}
      >
        Role
      </button>
      {/* Reset email */}
      <button
        className="admin-btn admin-btn--xs admin-btn--ghost"
        onClick={() => { setEmailTarget({ userId: u._id }); setNewEmail(''); }}
      >
        Email
      </button>
      {/* Reset password */}
      <button
        className="admin-btn admin-btn--xs admin-btn--ghost"
        onClick={() => { setPwTarget({ userId: u._id }); setNewPassword(''); }}
      >
        Password
      </button>
      {/* Delete */}
      <button
        className="admin-btn admin-btn--xs admin-btn--danger"
        onClick={() => setDeleteTarget({ userId: u._id, email: u.email })}
      >
        Delete
      </button>
    </div>,
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h2 className="admin-page__title">Users</h2>
          <p className="admin-page__sub">{users.length} total user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/osi-console/users/create" id="create-user-btn" className="admin-btn admin-btn--primary">
          + Create User
        </Link>
      </div>

      {loading ? (
        <div className="admin-page-center"><Spinner size="lg" /></div>
      ) : (
        <AdminTable
          headers={['Email', 'Role', 'Status', 'Actions']}
          rows={rows}
          emptyMessage="No users found."
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${deleteTarget?.email}? This cannot be undone.`}
        confirmLabel={actionLoading ? 'Deleting…' : 'Delete'}
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Change Role Modal */}
      {roleTarget && (
        <div className="admin-overlay" onClick={() => setRoleTarget(null)}>
          <div className="admin-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-dialog__title">Change Role</h2>
            <p className="admin-dialog__msg">{roleTarget.email}</p>
            <select
              id="change-role-select"
              className="admin-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="admin-dialog__actions">
              <button className="admin-btn admin-btn--ghost" onClick={() => setRoleTarget(null)}>Cancel</button>
              <button className="admin-btn admin-btn--primary" onClick={handleRoleChange} disabled={actionLoading}>
                {actionLoading ? <><Spinner size="sm" /> Saving…</> : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {emailTarget && (
        <div className="admin-overlay" onClick={() => setEmailTarget(null)}>
          <div className="admin-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-dialog__title">Reset Email</h2>
            <input
              id="change-email-input"
              type="email"
              className="admin-input"
              placeholder="newemail@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <div className="admin-dialog__actions">
              <button className="admin-btn admin-btn--ghost" onClick={() => setEmailTarget(null)}>Cancel</button>
              <button className="admin-btn admin-btn--primary" onClick={handleEmailChange} disabled={actionLoading}>
                {actionLoading ? <><Spinner size="sm" /> Saving…</> : 'Update Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {pwTarget && (
        <div className="admin-overlay" onClick={() => setPwTarget(null)}>
          <div className="admin-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-dialog__title">Reset Password</h2>
            <p className="admin-dialog__msg">Enter a new password for this user.</p>
            <input
              id="reset-password-input"
              type="password"
              className="admin-input"
              placeholder="NewPassword@123"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="admin-dialog__actions">
              <button className="admin-btn admin-btn--ghost" onClick={() => setPwTarget(null)}>Cancel</button>
              <button className="admin-btn admin-btn--primary" onClick={handlePasswordReset} disabled={actionLoading}>
                {actionLoading ? <><Spinner size="sm" /> Saving…</> : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
