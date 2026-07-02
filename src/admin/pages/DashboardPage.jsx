import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Spinner } from '../components/ui/Spinner';

const ROLE_PERMISSIONS = {
  SUPERADMIN: [
    { label: 'Users', path: '/osi-console/users', icon: '👤', color: 'var(--admin-purple)' },
  ],
  ADMIN: [
    { label: 'Projects',  path: '/osi-console/projects',  icon: '🏗', color: 'var(--admin-blue)' },
    { label: 'Employees', path: '/osi-console/employees', icon: '👥', color: 'var(--admin-teal)' },
    { label: 'Feedback',  path: '/osi-console/feedback',  icon: '📬', color: 'var(--admin-green)' },
  ],
  ENGINEER: [
    { label: 'Projects', path: '/osi-console/projects', icon: '🏗', color: 'var(--admin-blue)' },
    { label: 'Feedback', path: '/osi-console/feedback', icon: '📬', color: 'var(--admin-green)' },
  ],
  RECRUITER: [
    { label: 'Employees', path: '/osi-console/employees', icon: '👥', color: 'var(--admin-teal)' },
  ],
};

export function DashboardPage() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({ projects: null, employees: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [projectsRes, employeesRes] = await Promise.allSettled([
          api.get('/project/getAllProjects?limit=1'),
          api.get('/employee/getAllTeamMembers'),
        ]);

        setStats({
          projects:
            projectsRes.status === 'fulfilled'
              ? projectsRes.value.data?.pagination?.totalProjects ?? '—'
              : '—',
          employees:
            employeesRes.status === 'fulfilled'
              ? employeesRes.value.data?.totalTeamMembers ?? '—'
              : '—',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const quickLinks = ROLE_PERMISSIONS[role] || [];

  return (
    <div className="admin-page">
      {/* Welcome */}
      <div className="admin-dashboard-welcome">
        <div>
          <h2 className="admin-dashboard-welcome__title">
            Welcome back 👋
          </h2>
          <p className="admin-dashboard-welcome__sub">
            You're signed in as <strong>{role}</strong>. Here's a quick overview.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="admin-page-center"><Spinner size="lg" /></div>
      ) : (
        <div className="admin-stat-grid">
          <StatCard label="Total Projects" value={stats.projects} icon="🏗" color="var(--admin-blue)" />
          <StatCard label="Team Members" value={stats.employees} icon="👥" color="var(--admin-teal)" />
        </div>
      )}

      {/* Quick Links */}
      {quickLinks.length > 0 && (
        <section className="admin-dashboard-section">
          <h3 className="admin-dashboard-section__title">Quick Access</h3>
          <div className="admin-quick-links">
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="admin-quick-link"
                style={{ '--link-color': link.color }}
              >
                <span className="admin-quick-link__icon">{link.icon}</span>
                <span className="admin-quick-link__label">Manage {link.label}</span>
                <span className="admin-quick-link__arrow">→</span>
              </Link>
            ))}
            <Link to="/osi-console/account" className="admin-quick-link" style={{ '--link-color': 'var(--admin-green)' }}>
              <span className="admin-quick-link__icon">⚙</span>
              <span className="admin-quick-link__label">My Account</span>
              <span className="admin-quick-link__arrow">→</span>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="admin-stat-card" style={{ '--card-color': color }}>
      <span className="admin-stat-card__icon">{icon}</span>
      <div>
        <p className="admin-stat-card__value">{value ?? '—'}</p>
        <p className="admin-stat-card__label">{label}</p>
      </div>
    </div>
  );
}
