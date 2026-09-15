import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, setUserEnabled } from '../api/users';
import { Card, EmptyState } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import './UsersPage.css';
import './DashboardPage.css';

const ROLES = ['ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE'];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  function load() {
    setLoading(true);
    getAllUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleRoleChange(id, newRole) {
    setError('');
    setSavingId(id);
    try {
      const updated = await updateUserRole(id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggleEnabled(u) {
    setError('');
    setSavingId(u.id);
    try {
      const updated = await setUserEnabled(u.id, !u.enabled);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <div>Loading users…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p className="page-subtitle">Manage roles and account access. {users.length} user{users.length !== 1 ? 's' : ''} total.</p>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {users.length === 0 ? (
        <EmptyState title="No users yet" body="Users will appear here once people register." />
      ) : (
        <Card>
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="users-table__name">
                        <span className="users-table__avatar">{u.fullName?.[0]?.toUpperCase() || '?'}</span>
                        <span>{u.fullName}</span>
                        {isSelf && <span className="users-table__self-tag">(you)</span>}
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-ink-muted)' }}>{u.email}</td>
                    <td>
                      <select
                        className="users-table__role-select"
                        value={u.role}
                        disabled={isSelf || savingId === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        title={isSelf ? "You can't change your own role" : undefined}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className={`users-table__toggle ${u.enabled ? 'users-table__toggle--enabled' : 'users-table__toggle--disabled'}`}
                        onClick={() => handleToggleEnabled(u)}
                        disabled={isSelf || savingId === u.id}
                        title={isSelf ? "You can't disable your own account" : undefined}
                      >
                        {u.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
