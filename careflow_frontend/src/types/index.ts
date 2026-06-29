export interface Doctor {
  doctor_id: number;
  doctor_name: string;
  specialty: string;
  room_number: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'patient' | 'doctor';
}

export interface Appointment {
  appointment_id: number;
  patient_id: number;
  patient_name: string;
  doctor_id?: number;
  doctor_name?: string;
  specialty?: string;
  room_number?: string;
  appointment_date: string;
  time_slot: string;
  queue_number: number;
  status: 'scheduled' | 'serving' | 'completed' | 'absent';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface BookAppointmentPayload {
  doctor_id: number;
  appointment_date: string;
  time_slot: string;
}

export interface BookAppointmentResponse {
  message: string;
  appointment_id: number;
  queue_number: number;
  status: string;
}

export interface UpdateStatusPayload {
  status: 'serving' | 'completed' | 'absent';
}
