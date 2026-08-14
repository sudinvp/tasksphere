import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getDashboardSummary } from '../api/dashboard';
import { Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

const STATUS_COLORS = {
  TODO: '#8A93A3',
  IN_PROGRESS: '#3454D1',
  IN_REVIEW: '#F2A93B',
  DONE: '#2F9E68',
};

const PRIORITY_COLORS = {
  LOW: '#8A93A3',
  MEDIUM: '#3454D1',
  HIGH: '#F2A93B',
  URGENT: '#D64545',
};

function StatCard({ value, label, icon }) {
  return (
    <Card className="stat-card">
      <div className="stat-card__meta">
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">{label}</div>
      </div>
      {icon}
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.fullName?.split(' ')[0];

  if (loading) return <div>Loading dashboard…</div>;
  if (error) return <div className="auth-error">{error}</div>;
  if (!summary) return null;

  const statusData = Object.entries(summary.tasksByStatus || {})
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ name: status.replace('_', ' '), value: count, key: status }));

  const maxPriorityCount = Math.max(1, ...Object.values(summary.tasksByPriority || {}));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome back{firstName ? `, ${firstName}` : ''}</h1>
          <p className="page-subtitle">Here's how work is moving across TaskSphere right now.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard value={summary.totalProjects} label="Total projects" />
        <StatCard value={summary.totalTasks} label="Total tasks" />
        <StatCard value={summary.completedTasks} label="Completed" />
        <StatCard value={summary.pendingTasks} label="Pending" />
        <StatCard
          value={summary.overdueTasks}
          label="Overdue"
          icon={summary.overdueTasks > 0 ? (
            <span style={{ color: 'var(--color-danger)', fontSize: 20 }}>⚠</span>
          ) : null}
        />
      </div>

      <div className="dashboard-grid">
        <Card className="panel">
          <h2>Tasks by status</h2>
          {statusData.length === 0 ? (
            <p style={{ color: 'var(--color-ink-muted)', fontSize: 13 }}>No tasks yet — create a project and add your first task.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 160, height: 160 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || '#8A93A3'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {statusData.map((entry) => (
                  <div key={entry.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: STATUS_COLORS[entry.key] || '#8A93A3' }} />
                    <span style={{ color: 'var(--color-ink-muted)' }}>{entry.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', marginLeft: 4 }}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="panel">
          <h2>Tasks by priority</h2>
          <div className="priority-breakdown">
            {Object.entries(summary.tasksByPriority || {}).map(([priority, count]) => (
              <div className="priority-row" key={priority}>
                <span className="priority-row__label" style={{ color: PRIORITY_COLORS[priority] }}>
                  {priority}
                </span>
                <div className="priority-row__bar-track">
                  <div
                    className="priority-row__bar-fill"
                    style={{
                      width: `${(count / maxPriorityCount) * 100}%`,
                      background: PRIORITY_COLORS[priority],
                    }}
                  />
                </div>
                <span className="priority-row__count">{count}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
            <h2 style={{ marginBottom: 12 }}>Overall progress</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <svg width="0" height="0" />
              <OverallOrbit percent={summary.overallProgressPercent} />
              <p style={{ fontSize: 12.5, color: 'var(--color-ink-muted)' }}>
                {summary.completedTasks} of {summary.totalTasks} tasks completed across all projects.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function OverallOrbit({ percent }) {
  const size = 72;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent || 0));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-sunken)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-success)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
        {Math.round(clamped)}%
      </div>
    </div>
  );
}
