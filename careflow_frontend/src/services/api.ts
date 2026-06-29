import type {
  Appointment,
  BookAppointmentPayload,
  BookAppointmentResponse,
  Doctor,
  LoginResponse,
  UpdateStatusPayload,
} from '../types';

const BASE_URL = '/api/v1';

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  let data: any;

  try {
    data = await res.json();
  } catch {
    const text = await res.text().catch(() => '');
    throw new Error(
      text
        ? `Server returned non-JSON: ${text.slice(0, 200)}`
        : `Request failed (${res.status} ${res.statusText})`,
    );
  }

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
}

export function login(email: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  email: string,
  password: string,
  fullName: string,
  role: 'patient' | 'doctor',
  specialty?: string,
  roomNumber?: string,
) {
  return request<{ message: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
      role,
      ...(role === 'doctor' ? { specialty, room_number: roomNumber } : {}),
    }),
  });
}

export function getDoctors() {
  return request<{ doctors: Doctor[] }>('/doctors');
}

export function bookAppointment(payload: BookAppointmentPayload) {
  return request<BookAppointmentResponse>('/appointments/book', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMyAppointments() {
  return request<{ appointments: Appointment[] }>('/appointments/my');
}

export function getDoctorTodayAppointments() {
  return request<{ appointments: Appointment[] }>(
    '/appointments/doctor/today',
  );
}

export function updateAppointmentStatus(
  appointmentId: number,
  payload: UpdateStatusPayload,
) {
  return request<{ message: string; appointment_id: number; status: string }>(
    `/appointments/${appointmentId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}
