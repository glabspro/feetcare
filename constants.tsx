
import { AppointmentStatus, Service, Professional, Sede, Patient } from './types';

// Arrays vacíos para producción. La información se cargará desde Supabase.
export const MOCK_SERVICES: Service[] = [];

export const MOCK_PROFESSIONALS: Professional[] = [];

export const DEFAULT_AVAILABILITY = {
  'Lunes': { isOpen: true, intervals: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  'Martes': { isOpen: true, intervals: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  'Miércoles': { isOpen: true, intervals: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  'Jueves': { isOpen: true, intervals: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  'Viernes': { isOpen: true, intervals: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  'Sábado': { isOpen: true, intervals: [{ start: '09:00', end: '13:00' }] },
  'Domingo': { isOpen: false, intervals: [] },
};

export const INITIAL_SEDES: Sede[] = [];

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
  [AppointmentStatus.CONFIRMED]: 'bg-teal-100 text-teal-700 border-teal-200',
  [AppointmentStatus.CANCELLED]: 'bg-red-100 text-red-700 border-red-200',
  [AppointmentStatus.COMPLETED]: 'bg-green-100 text-green-700 border-green-200',
  [AppointmentStatus.NO_SHOW]: 'bg-slate-100 text-slate-600 border-slate-200',
  [AppointmentStatus.ATTENDED]: 'bg-brand-lightPrimary text-brand-primary border-brand-primary/20',
};

export const MOCK_PATIENTS: Patient[] = [];
