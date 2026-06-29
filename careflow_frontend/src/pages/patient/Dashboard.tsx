import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { QueueBadge } from '../../components/ui/QueueBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { getMyAppointments } from '../../services/api';
import type { Appointment } from '../../types';

const STATUS_COLORS: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
  scheduled: 'info',
  serving: 'warning',
  completed: 'success',
  absent: 'danger',
};

export function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await getMyAppointments();
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

  const today = new Date().toISOString().slice(0, 10);
  const todayAppts = appointments.filter((a) => a.appointment_date === today);
  const upcomingAppts = appointments.filter((a) => a.appointment_date > today);
  const myAppointment = todayAppts[0];

  if (loading) return <DashboardLayout title="My Dashboard"><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout title="My Dashboard">
      {error && <div className="alert alert--error">{error}</div>}

      {myAppointment ? (
        <div className="patient-status-card">
          <div className="patient-status-info">
            <h3>Your Appointment Today</h3>
            {myAppointment.doctor_name && (
              <p className="patient-doctor">{myAppointment.doctor_name}</p>
            )}
            {myAppointment.specialty && (
              <p className="patient-slot">{myAppointment.specialty}</p>
            )}
            {myAppointment.room_number && (
              <p className="patient-slot">Room {myAppointment.room_number}</p>
            )}
            <p className="patient-slot">{myAppointment.time_slot.slice(0, 5)}</p>
            <Badge variant={STATUS_COLORS[myAppointment.status] || 'info'}>
              {myAppointment.status}
            </Badge>
          </div>
          <QueueBadge number={myAppointment.queue_number} />
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Appointment Today</h3>
          <p>Book an appointment to see your queue position.</p>
          <Button onClick={() => navigate('/patient/book')} style={{ marginTop: 16 }}>
            Book Appointment
          </Button>
        </div>
      )}

      {todayAppts.length > 0 && (
        <div className="patient-queue-list">
          <h3>Today's Appointments</h3>
          <div className="queue-table-wrap">
            <table className="queue-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAppts.map((a) => (
                  <tr key={a.appointment_id}>
                    <td>{a.queue_number}</td>
                    <td>{a.doctor_name || 'N/A'}</td>
                    <td>{a.time_slot.slice(0, 5)}</td>
                    <td>
                      <Badge variant={STATUS_COLORS[a.status] || 'info'}>
                        {a.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {upcomingAppts.length > 0 && (
        <div className="patient-queue-list">
          <h3>Upcoming Appointments</h3>
          <div className="queue-table-wrap">
            <table className="queue-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppts.map((a) => (
                  <tr key={a.appointment_id}>
                    <td>{a.queue_number}</td>
                    <td>{a.doctor_name || 'N/A'}</td>
                    <td>{a.appointment_date}</td>
                    <td>{a.time_slot.slice(0, 5)}</td>
                    <td>
                      <Badge variant={STATUS_COLORS[a.status] || 'info'}>
                        {a.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!myAppointment && appointments.length === 0 && (
        <div className="patient-queue-list" style={{ marginTop: 16 }}>
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button onClick={() => navigate('/patient/book')}>
              Book New Appointment
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
