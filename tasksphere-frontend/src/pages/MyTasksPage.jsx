import { useEffect, useState } from 'react';
import { getMyTasks } from '../api/tasks';
import { Card, PriorityArc, StatusPill, EmptyState } from '../components/ui';
import TaskDetailModal from '../components/TaskDetailModal';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTask, setActiveTask] = useState(null);

  function load() {
    setLoading(true);
    getMyTasks().then(setTasks).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  const canManage = ['ADMIN', 'PROJECT_MANAGER'].includes(user?.role);

  if (loading) return <div>Loading your tasks…</div>;
  if (error) return <div className="auth-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My tasks</h1>
          <p className="page-subtitle">Everything currently assigned to you, across every project.</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState title="Nothing assigned to you" body="When a project manager assigns you a task, it'll show up here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map((t) => {
            const overdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE';
            return (
              <Card
                key={t.id}
                onClick={() => setActiveTask(t)}
                style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, cursor: 'pointer' }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>{t.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-ink-faint)' }}>{t.projectName}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: overdue ? 'var(--color-danger)' : 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>
                    {t.dueDate ? `Due ${t.dueDate}` : 'No due date'}
                  </span>
                  <PriorityArc priority={t.priority} />
                  <StatusPill status={t.status} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTask && (
        <TaskDetailModal
          task={activeTask}
          canManage={canManage}
          onClose={() => setActiveTask(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}
