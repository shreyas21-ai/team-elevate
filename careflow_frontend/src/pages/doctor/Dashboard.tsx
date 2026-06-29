import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { getDoctorTodayAppointments, updateAppointmentStatus } from '../../services/api';
import type { Appointment } from '../../types';

const STATUS_COLORS: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
  scheduled: 'info',
  serving: 'warning',
  completed: 'success',
  absent: 'danger',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateWeekChartData(appointments: Appointment[]) {
  const dayCounts: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayCounts[key] = 0;
  }
  for (const a of appointments) {
    if (dayCounts[a.appointment_date] !== undefined) {
      dayCounts[a.appointment_date]++;
    }
  }
  return Object.entries(dayCounts).map(([date, count]) => {
    const d = new Date(date);
    return {
      day: DAY_NAMES[d.getDay()],
      patients: count,
    };
  });
}

export function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await getDoctorTodayAppointments();
      setAppointments(data.appointments);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 10000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const handleStatusUpdate = async (
    appointmentId: number,
    status: 'serving' | 'completed' | 'absent',
  ) => {
    setUpdatingId(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, { status });
      await fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const nowServing = appointments.find((a) => a.status === 'serving');

  if (loading) return <DashboardLayout title="Doctor Dashboard"><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Doctor Dashboard">
      {error && <div className="alert alert--error">{error}</div>}

      {nowServing && (
        <div className="now-serving-card">
          <h3>Now Serving</h3>
          <div className="now-serving-patient">
            <span className="now-serving__name">{nowServing.patient_name}</span>
            <QueueBadgeSmall number={nowServing.queue_number} />
          </div>
          <div className="now-serving-actions">
            <Button
              variant="primary"
              loading={updatingId === nowServing.appointment_id}
              onClick={() => handleStatusUpdate(nowServing.appointment_id, 'completed')}
            >
              Conclude Visit
            </Button>
            <Button
              variant="danger"
              loading={updatingId === nowServing.appointment_id}
              onClick={() => handleStatusUpdate(nowServing.appointment_id, 'absent')}
            >
              Mark No-Show
            </Button>
          </div>
        </div>
      )}

      <div className="doctor-table-section">
        <h3>Today's Appointments</h3>
        <div className="queue-table-wrap">
          <table className="queue-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-row">No appointments today</td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr
                    key={a.appointment_id}
                    className={
                      a.status === 'serving'
                        ? 'row--serving'
                        : a.status === 'completed'
                          ? 'row--completed'
                          : ''
                    }
                  >
                    <td>{a.queue_number}</td>
                    <td>{a.patient_name}</td>
                    <td>{a.time_slot.slice(0, 5)}</td>
                    <td>
                      <Badge variant={STATUS_COLORS[a.status] || 'info'}>
                        {a.status}
                      </Badge>
                    </td>
                    <td>
                      {a.status === 'scheduled' && (
                        <Button
                          variant="primary"
                          size="sm"
                          loading={updatingId === a.appointment_id}
                          onClick={() => handleStatusUpdate(a.appointment_id, 'serving')}
                          className="action-btn"
                        >
                          Begin Consultation
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="chart-section">
        <h3>Weekly Throughput</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={generateWeekChartData(appointments)}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" stroke="var(--text)" />
            <YAxis stroke="var(--text)" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
              }}
            />
            <Bar dataKey="patients" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardLayout>
  );
}

function QueueBadgeSmall({ number }: { number: number }) {
  return (
    <span className="queue-badge-sm">
      Queue <strong>#{number}</strong>
    </span>
  );
}
