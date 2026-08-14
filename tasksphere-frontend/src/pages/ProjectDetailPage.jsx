import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject, updateProjectStatus } from '../api/projects';
import { getTasksForProject } from '../api/tasks';
import { getAllUsers } from '../api/users';
import { Card, Button, OrbitRing, PriorityArc, EmptyState } from '../components/ui';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import { useAuth } from '../context/AuthContext';
import './ProjectDetail.css';
import './DashboardPage.css';

const COLUMNS = [
  { key: 'TODO', label: 'To do' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'IN_REVIEW', label: 'In review' },
  { key: 'DONE', label: 'Done' },
];

const CAN_MANAGE = ['ADMIN', 'PROJECT_MANAGER'];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  function load() {
    setLoading(true);
    Promise.all([getProject(id), getTasksForProject(id), getAllUsers().catch(() => [])])
      .then(([p, t, u]) => {
        setProject(p);
        setTasks(t);
        setUsers(u);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  const canManage = CAN_MANAGE.includes(user?.role);

  async function handleStatusChange(status) {
    try {
      const updated = await updateProjectStatus(id, status);
      setProject(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div>Loading project…</div>;
  if (error) return <div className="auth-error">{error}</div>;
  if (!project) return null;

  const pct = project.totalTasks > 0 ? (project.completedTasks / project.totalTasks) * 100 : 0;
  const memberOptions = project.memberNames?.length
    ? users.filter((u) => project.memberNames.includes(u.fullName))
    : users;

  return (
    <div>
      <Link to="/projects" style={{ fontSize: 12.5, color: 'var(--color-ink-muted)' }}>← All projects</Link>

      <div className="project-detail-header" style={{ marginTop: 10 }}>
        <div>
          <h1>{project.name}</h1>
          {project.description && (
            <p className="page-subtitle" style={{ maxWidth: 560 }}>{project.description}</p>
          )}
          <div className="project-detail-header__meta">
            <span className="project-detail-header__meta-item">
              Manager: <strong>{project.managerName || '—'}</strong>
            </span>
            <span className="project-detail-header__meta-item">
              Members: <strong>{project.memberNames?.length || 0}</strong>
            </span>
            {project.startDate && (
              <span className="project-detail-header__meta-item">
                Timeline: <strong>{project.startDate} → {project.endDate || 'open'}</strong>
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <OrbitRing percent={pct} size={56} label="done" />
          {canManage && (
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--color-border)' }}
            >
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="ON_HOLD">On hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <Button onClick={() => setShowCreateTask(true)}>+ New task</Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          body="Break this project down into tasks so work can be assigned and tracked."
          action={<Button onClick={() => setShowCreateTask(true)}>+ New task</Button>}
        />
      ) : (
        <div className="kanban-board">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div className="kanban-column" key={col.key}>
                <div className="kanban-column__header">
                  <span>{col.label}</span>
                  <span className="kanban-column__count">{colTasks.length}</span>
                </div>
                {colTasks.map((t) => {
                  const overdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE';
                  return (
                    <Card key={t.id} className="task-card" onClick={() => setActiveTask(t)}>
                      <div className="task-card__title">{t.title}</div>
                      <PriorityArc priority={t.priority} showLabel={false} />
                      {t.aiSuggestedCategory && (
                        <div className="task-card__ai">✦ {t.aiSuggestedCategory}</div>
                      )}
                      <div className="task-card__footer">
                        <span className={`task-card__due ${overdue ? 'is-overdue' : ''}`}>
                          {t.dueDate ? `Due ${t.dueDate}` : 'No due date'}
                        </span>
                        {t.assigneeName && (
                          <span className="task-card__assignee" title={t.assigneeName}>
                            {t.assigneeName[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {showCreateTask && (
        <CreateTaskModal
          projectId={Number(id)}
          members={memberOptions}
          onClose={() => setShowCreateTask(false)}
          onCreated={() => { setShowCreateTask(false); load(); }}
        />
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
