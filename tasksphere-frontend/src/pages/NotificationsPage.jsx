import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../api/notifications';
import { Card, EmptyState } from '../components/ui';
import './DashboardPage.css';

const TYPE_ICONS = {
  TASK_ASSIGNED: '📌',
  DEADLINE_REMINDER: '⏰',
  STATUS_UPDATE: '🔄',
  PROJECT_UPDATE: '📋',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    getNotifications().then(setNotifications).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleRead(id) {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // no-op, non-critical
    }
  }

  if (loading) return <div>Loading notifications…</div>;
  if (error) return <div className="auth-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="page-subtitle">Task assignments, status changes, and deadline reminders.</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="You're all caught up" body="New notifications will appear here as things happen across your projects." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => !n.isRead && handleRead(n.id)}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                cursor: n.isRead ? 'default' : 'pointer',
                background: n.isRead ? 'var(--color-surface)' : 'var(--color-primary-tint)',
                borderColor: n.isRead ? 'var(--color-border)' : 'var(--color-primary)',
              }}
            >
              <span style={{ fontSize: 16 }}>{TYPE_ICONS[n.type] || '🔔'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: 'var(--color-ink)' }}>{n.message}</p>
                <span style={{ fontSize: 10.5, color: 'var(--color-ink-faint)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--color-primary)', flexShrink: 0, marginTop: 4 }} />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
