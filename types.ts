
export enum AppointmentStatus {
  PENDING = 'POR CONFIRMAR',
  CONFIRMED = 'CONFIRMADO',
  CANCELLED = 'CANCELADO',
  COMPLETED = 'COMPLETADO',
  NO_SHOW = 'NO ASISTIÓ',
  ATTENDED = 'ATENDIDO'
}

export enum UserRole {
  ADMIN = 'ADMINISTRADOR',
  RECEPCIONIST = 'RECEPCIONISTA',
  SPECIALIST = 'ESPECIALISTA',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface User {
  id: string;
  name: string;
  email?: string;
  accessKey?: string; // Campo para la clave de acceso personalizada
  role: UserRole;
  sedeIds?: string[];
  avatar?: string;
  companyId: string;
}

export interface TimeInterval {
  start: string;
  end: string;
}

export interface DayAvailability {
  isOpen: boolean;
  intervals: TimeInterval[];
}

export interface Sede {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  availability?: Record<string, DayAvailability>;
  companyId: string;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  sedeIds: string[];
  userId: string;
  companyId: string;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  documentId: string;
  birthDate: string;
  history: ClinicalHistoryEntry[];
  companyId: string;
}

export interface ClinicalHistoryEntry {
  id: string;
  date: string;
  professionalId: string;
  diagnosis: string;
  notes: string;
  recommendations: string;
  medications?: { name: string; instructions: string }[];
  appointmentId?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail?: string;
  patientPhone: string;
  patientDni?: string;
  patientId?: string;
  serviceId: string;
  sedeId: string;
  professionalId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  bookingCode: string;
  companyId: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  primaryColor: string;
  logo?: string;
  portalHero?: string;
}

export interface ViewState {
  currentView: 'login' | 'dashboard' | 'appointments' | 'patients' | 'schedules' | 'portal' | 'clinical-record' | 'staff-management';
  activeAppointmentId?: string;
  user?: User;
}
