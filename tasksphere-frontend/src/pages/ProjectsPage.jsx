import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProjects, createProject } from '../api/projects';
import { getAllUsers } from '../api/users';
import { Card, Button, OrbitRing, EmptyState } from '../components/ui';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import './Projects.css';
import './DashboardPage.css';

const CAN_MANAGE = ['ADMIN', 'PROJECT_MANAGER'];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  function load() {
    setLoading(true);
    getAllProjects()
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const canManage = CAN_MANAGE.includes(user?.role);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} in flight.</p>
        </div>
        {canManage && <Button onClick={() => setShowCreate(true)}>+ New project</Button>}
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="auth-error">{error}</div>}

      {!loading && !error && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          body={canManage ? "Create your first project to start assigning tasks." : "No projects have been created yet. Check back soon."}
          action={canManage && <Button onClick={() => setShowCreate(true)}>+ New project</Button>}
        />
      )}

      <div className="project-grid">
        {projects.map((p) => {
          const pct = p.totalTasks > 0 ? (p.completedTasks / p.totalTasks) * 100 : 0;
          return (
            <Link key={p.id} to={`/projects/${p.id}`} style={{ display: 'block' }}>
              <Card className="project-card">
                <div className="project-card__top">
                  <div style={{ minWidth: 0 }}>
                    <div className="project-card__name">{p.name}</div>
                    <p className="project-card__desc">{p.description || 'No description provided.'}</p>
                  </div>
                  <OrbitRing percent={pct} size={44} />
                </div>
                <div className="project-card__footer">
                  <span>{p.totalTasks} task{p.totalTasks !== 1 ? 's' : ''}</span>
                  <span className="project-card__members">{p.memberNames?.length || 0} member{p.memberNames?.length !== 1 ? 's' : ''}</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '' });
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createProject({
        name: form.name,
        description: form.description || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        memberIds: selectedMembers,
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMember(id) {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  return (
    <Modal onClose={onClose}>
      <h2>New project</h2>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="pname">Project name</label>
          <input id="pname" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="pdesc">Description</label>
          <textarea id="pdesc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="pstart">Start date</label>
            <input id="pstart" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="pend">End date</label>
            <input id="pend" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
        </div>

        {users.length > 0 && (
          <div className="form-field">
            <label>Members</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {users.map((u) => (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => toggleMember(u.id)}
                  className="ui-button ui-button--secondary"
                  style={{
                    padding: '6px 10px',
                    fontSize: 12,
                    background: selectedMembers.includes(u.id) ? 'var(--color-primary-tint)' : undefined,
                    borderColor: selectedMembers.includes(u.id) ? 'var(--color-primary)' : undefined,
                    color: selectedMembers.includes(u.id) ? 'var(--color-primary-dark)' : undefined,
                  }}
                >
                  {u.fullName}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create project'}</Button>
        </div>
      </form>
    </Modal>
  );
}
