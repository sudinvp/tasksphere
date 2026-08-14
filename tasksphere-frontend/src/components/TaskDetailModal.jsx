import { useEffect, useState } from 'react';
import { getComments, addComment, updateTaskStatus, deleteTask } from '../api/tasks';
import { Button, PriorityArc } from './ui';
import Modal from './Modal';

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export default function TaskDetailModal({ task, onClose, onChanged, canManage }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [status, setStatus] = useState(task.status);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getComments(task.id)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoadingComments(false));
  }, [task.id]);

  async function handleStatusChange(next) {
    setStatus(next);
    try {
      await updateTaskStatus(task.id, next);
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const created = await addComment(task.id, newComment.trim());
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
      await deleteTask(task.id);
      onChanged();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <h2 style={{ marginBottom: 4 }}>{task.title}</h2>
        {canManage && (
          <button
            onClick={handleDelete}
            title="Delete task"
            style={{ background: 'none', border: 'none', color: 'var(--color-ink-faint)', fontSize: 18, lineHeight: 1, padding: 4 }}
          >
            ×
          </button>
        )}
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '10px 0 16px', flexWrap: 'wrap' }}>
        <PriorityArc priority={task.priority} />
        {task.dueDate && (
          <span style={{ fontSize: 11.5, color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>
            Due {task.dueDate}
          </span>
        )}
        {task.assigneeName && (
          <span style={{ fontSize: 11.5, color: 'var(--color-ink-muted)' }}>
            Assigned to <strong>{task.assigneeName}</strong>
          </span>
        )}
      </div>

      {task.description && (
        <p style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          {task.description}
        </p>
      )}

      {(task.aiSuggestedCategory || task.aiPriorityScore != null) && (
        <div style={{
          fontSize: 11.5, color: 'var(--color-violet)', background: '#F2EFFF',
          padding: '8px 10px', borderRadius: 8, marginBottom: 16,
        }}>
          ✦ AI suggests: {task.aiSuggestedCategory || '—'}
          {task.aiPriorityScore != null && ` · urgency score ${task.aiPriorityScore.toFixed(2)}`}
        </div>
      )}

      <div className="form-field">
        <label>Status</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => handleStatusChange(s)}
              className="ui-button ui-button--secondary"
              style={{
                padding: '6px 10px', fontSize: 11.5,
                background: status === s ? 'var(--color-primary-tint)' : undefined,
                borderColor: status === s ? 'var(--color-primary)' : undefined,
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-ink-muted)', display: 'block', marginBottom: 10 }}>
          Comments {comments.length > 0 && `(${comments.length})`}
        </label>

        {loadingComments && <p style={{ fontSize: 12.5, color: 'var(--color-ink-faint)' }}>Loading…</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 180, overflowY: 'auto', marginBottom: 12 }}>
          {comments.map((c) => (
            <div key={c.id} style={{ fontSize: 12.5 }}>
              <strong>{c.authorName}</strong>{' '}
              <span style={{ color: 'var(--color-ink-faint)', fontSize: 10.5 }}>
                {new Date(c.createdAt).toLocaleString()}
              </span>
              <p style={{ marginTop: 2, color: 'var(--color-ink-muted)' }}>{c.content}</p>
            </div>
          ))}
          {!loadingComments && comments.length === 0 && (
            <p style={{ fontSize: 12.5, color: 'var(--color-ink-faint)' }}>No comments yet.</p>
          )}
        </div>

        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8 }}>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment…"
            style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 8 }}
          />
          <Button type="submit" disabled={submitting}>Post</Button>
        </form>
      </div>
    </Modal>
  );
}
