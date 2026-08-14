import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../api/notifications';
import './AppShell.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: OrbitIcon, end: true },
  { to: '/projects', label: 'Projects', icon: ProjectsIcon },
  { to: '/tasks', label: 'My Tasks', icon: TasksIcon },
  { to: '/notifications', label: 'Notifications', icon: BellIcon },
];

function OrbitIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2" fill="currentColor" />
      <ellipse cx="9" cy="9" rx="7.5" ry="3.5" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="9" cy="9" rx="3.5" ry="7.5" stroke="currentColor" strokeWidth="1.4" transform="rotate(45 9 9)" />
    </svg>
  );
}
function ProjectsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2.5" y="4" width="13" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 7h13" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function TasksIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 9.5l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2.5" y="2.5" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2.5c-2 0-3.5 1.6-3.5 3.6v2.3c0 .5-.2 1-.6 1.4l-.9 1c-.5.5-.1 1.4.6 1.4h9c.7 0 1.1-.9.6-1.4l-.9-1c-.4-.4-.6-.9-.6-1.4V6.1C12.5 4.1 11 2.5 9 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7.3 14.5a1.7 1.7 0 003.4 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getUnreadCount()
      .then((res) => { if (!cancelled) setUnread(res.unread); })
      .catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then((res) => { if (!cancelled) setUnread(res.unread); }).catch(() => {});
    }, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand">
          <span className="app-shell__brand-mark"><OrbitIcon /></span>
          <span className="app-shell__brand-name">TaskSphere</span>
        </div>

        <nav className="app-shell__nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `app-shell__nav-item ${isActive ? 'is-active' : ''}`}
            >
              <Icon />
              <span>{label}</span>
              {to === '/notifications' && unread > 0 && (
                <span className="app-shell__nav-badge">{unread > 9 ? '9+' : unread}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="app-shell__user">
          <div className="app-shell__avatar">{user?.fullName?.[0]?.toUpperCase() || '?'}</div>
          <div className="app-shell__user-info">
            <div className="app-shell__user-name">{user?.fullName}</div>
            <div className="app-shell__user-role">{user?.role?.replace('_', ' ')}</div>
          </div>
          <button className="app-shell__logout" onClick={handleLogout} title="Log out">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2.5H3.5A1.5 1.5 0 002 4v8a1.5 1.5 0 001.5 1.5H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M10.5 11l3-3-3-3M13.3 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </aside>

      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  );
}
