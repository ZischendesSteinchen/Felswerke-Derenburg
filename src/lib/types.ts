export type UserRole = 'Administrator' | 'Mitarbeiter'

export interface User {
  id: string
  username: string
  password: string
  fullName: string
  role: UserRole
  avatarUrl?: string
}

export interface Vehicle {
  id: string
  name: string
  color: string
}

export interface Appointment {
  id: string
  title: string
  location: string
  address: string
  customer: string
  workers: string[]
  equipment: string
  notes: string
  startDate: string
  endDate: string
  color: string
  allDay: boolean
  multiDayGroupId?: string
  isFirstDay?: boolean
  isLastDay?: boolean
  jobGroupId?: string
}

export interface ContactPerson {
  id: string
  name: string
  phone?: string
  email?: string
}

export interface Customer {
  id: string
  name: string
  street?: string
  postalCode?: string
  reportForm?: 'Tagesbericht' | 'Leistungsbericht'
  contactPersons: ContactPerson[]
  createdAt: string
}

export interface Job {
  id: string
  jobNumber: string
  customerId: string
  contactPersonId: string
  street: string
  postalCode: string
  description: string
  status: 'offen' | 'in_bearbeitung' | 'abgeschlossen'
  createdAt: string
}

export interface Absence {
  id: string
  userId: string
  startDate: string
  endDate: string
  reason: string
  absenceType: 'urlaub' | 'sonstige'
  customReason?: string
  status: 'pending' | 'approved' | 'rejected'
  requiresApproval?: boolean
  createdAt: string
}

export type CalendarView = 'day' | 'week' | 'month' | 'year'

export const LOCATION_COLORS: Record<string, string> = {
  'Bernburg': 'bg-orange-500',
  'Wernigerode': 'bg-cyan-500',
  'Büro/Doku': 'bg-red-600',
  'Hetebonn': 'bg-amber-700',
  'Werkstatt Rep.': 'bg-fuchsia-600',
  'Osterweck': 'bg-purple-600',
  'Derenburg': 'bg-lime-600',
  'Heteborn': 'bg-amber-900',
  'Osterwieck': 'bg-blue-600',
  'Oedesleben': 'bg-yellow-600',
  'Altenbrak': 'bg-orange-400',
  'Goeddeckenrode': 'bg-amber-800',
  'Stiestorf': 'bg-teal-600',
  'Dobbeln': 'bg-blue-700',
  'Weggeleben': 'bg-amber-800',
  'OB Uhr Matti': 'bg-gray-600',
  '345sdnq': 'bg-blue-500',
}

export const VEHICLE_COLORS = [
  { value: '#ef4444', label: 'Rot' },
  { value: '#f97316', label: 'Orange' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#eab308', label: 'Gelb' },
  { value: '#84cc16', label: 'Limette' },
  { value: '#22c55e', label: 'Grün' },
  { value: '#10b981', label: 'Smaragd' },
  { value: '#14b8a6', label: 'Türkis' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#0ea5e9', label: 'Himmelblau' },
  { value: '#3b82f6', label: 'Blau' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violett' },
  { value: '#a855f7', label: 'Lila' },
  { value: '#d946ef', label: 'Fuchsia' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f43f5e', label: 'Rose' },
  { value: '#64748b', label: 'Schiefer' },
  { value: '#6b7280', label: 'Grau' },
  { value: '#78716c', label: 'Stein' },
]
