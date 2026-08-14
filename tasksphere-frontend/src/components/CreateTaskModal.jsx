import { useState } from 'react';
import { createTask } from '../api/tasks';
import { Button } from './ui';
import Modal from './Modal';

export default function CreateTaskModal({ projectId, members, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', assigneeId: '', dueDate: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createTask({
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        projectId,
        assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
        dueDate: form.dueDate || null,
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2>New task</h2>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="ttitle">Title</label>
          <input id="ttitle" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="tdesc">Description</label>
          <textarea id="tdesc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="tpriority">Priority</label>
            <select id="tpriority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="tdue">Due date</label>
            <input id="tdue" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="tassignee">Assignee</label>
          <select id="tassignee" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.fullName}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create task'}</Button>
        </div>
      </form>
    </Modal>
  );
}
