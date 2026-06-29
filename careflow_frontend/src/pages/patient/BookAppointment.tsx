import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { getDoctors, bookAppointment } from '../../services/api';
import type { Doctor } from '../../types';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
];

function todayString() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function BookAppointment() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayString());
  const [timeSlot, setTimeSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    getDoctors()
      .then((data) => setDoctors(data.doctors))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !date || !timeSlot) {
      setError('Please fill all fields');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await bookAppointment({
        doctor_id: Number(doctorId),
        appointment_date: date,
        time_slot: timeSlot,
      });
      setSuccess(
        `Appointment booked! Queue #${res.queue_number}`,
      );
      setTimeout(() => navigate('/patient'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout title="Book Appointment"><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Book Appointment">
      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="booking-section">
          <h3>Select Doctor</h3>
          <div className="doctor-grid">
            {doctors.map((doc) => (
              <label
                key={doc.doctor_id}
                className={`doctor-card ${Number(doctorId) === doc.doctor_id ? 'doctor-card--selected' : ''}`}
              >
                <input
                  type="radio"
                  name="doctor"
                  value={doc.doctor_id}
                  checked={Number(doctorId) === doc.doctor_id}
                  onChange={() => setDoctorId(String(doc.doctor_id))}
                />
                <span className="doctor-card__name">{doc.doctor_name}</span>
                <span className="doctor-card__specialty">{doc.specialty}</span>
                <span className="doctor-card__room">Room {doc.room_number}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="booking-section">
          <h3>Select Date</h3>
          <input
            type="date"
            className="input"
            value={date}
            min={todayString()}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="booking-section">
          <h3>Select Time Slot</h3>
          <div className="time-grid">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                className={`time-slot ${timeSlot === slot ? 'time-slot--selected' : ''}`}
                onClick={() => setTimeSlot(`${slot}:00`)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          loading={submitting}
          disabled={!doctorId || !date || !timeSlot}
          className="booking-submit"
        >
          Confirm Booking
        </Button>
      </form>
    </DashboardLayout>
  );
}
