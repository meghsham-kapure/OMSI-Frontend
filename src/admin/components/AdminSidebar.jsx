import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../../assets/logo.png';

const NAV_ITEMS = [
  {
    path: '/osi-console/dashboard',
    label: 'Dashboard',
    icon: '◈',
    roles: ['SUPERADMIN', 'ADMIN', 'ENGINEER', 'RECRUITER', 'USER'],
  },
  {
    path: '/osi-console/users',
    label: 'Users',
    icon: '👤',
    roles: ['SUPERADMIN'],
  },
  {
    path: '/osi-console/projects',
    label: 'Projects',
    icon: '🏗',
    roles: ['SUPERADMIN', 'ADMIN', 'ENGINEER', 'RECRUITER'],
  },
  {
    path: '/osi-console/employees',
    label: 'Employees',
    icon: '👥',
    roles: ['SUPERADMIN', 'ADMIN', 'ENGINEER', 'RECRUITER'],
  },
  {
    path: '/osi-console/feedback',
    label: 'Feedback',
    icon: '📬',
    roles: ['SUPERADMIN', 'ADMIN', 'ENGINEER'],
  },
  {
    path: '/osi-console/account',
    label: 'My Account',
    icon: '⚙',
    roles: ['SUPERADMIN', 'ADMIN', 'ENGINEER', 'RECRUITER', 'USER'],
  },
];

/**
 * @param {Object} props
 * @param {boolean} props.collapsed
 * @param {() => void} props.onToggle
 */
export function AdminSidebar({ collapsed, onToggle }) {
  const { role } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''}`}>
      {/* Brand */}
      <div className="admin-sidebar__brand">
        <img src={logo} alt="Om Seva" className="admin-sidebar__logo" />
        {!collapsed && (
          <div className="admin-sidebar__brand-text">
            <span className="admin-sidebar__brand-name">OM SEVA</span>
            <span className="admin-sidebar__brand-sub">Admin Panel</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="admin-sidebar__nav">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="admin-sidebar__link-icon">{item.icon}</span>
            {!collapsed && <span className="admin-sidebar__link-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Toggle */}
      <button
        className="admin-sidebar__toggle"
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  );
}
