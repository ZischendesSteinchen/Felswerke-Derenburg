import { api } from './supabase'
import type { User, Vehicle, Appointment, Customer, ContactPerson, Job, Absence } from './types'

// Type aliases für DB-Rows (snake_case aus Backend)
interface DbUser {
  id: string
  username: string
  password: string
  full_name: string
  role: 'Administrator' | 'Mitarbeiter'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface DbVehicle {
  id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

interface DbAppointment {
  id: string
  title: string
  location: string
  address: string
  customer: string
  workers: string[]
  equipment: string
  notes: string
  start_date: string
  end_date: string
  color: string
  all_day: boolean
  multi_day_group_id: string | null
  is_first_day: boolean | null
  is_last_day: boolean | null
  job_group_id: string | null
  created_at: string
  updated_at: string
}

interface DbCustomer {
  id: string
  name: string
  street: string | null
  postal_code: string | null
  report_form: 'Tagesbericht' | 'Leistungsbericht' | null
  contact_persons: DbContactPerson[]
  created_at: string
  updated_at: string
}

interface DbContactPerson {
  id: string
  customer_id: string
  name: string
  phone: string | null
  email: string | null
}

interface DbJob {
  id: string
  job_number: string
  customer_id: string
  contact_person_id: string
  street: string
  postal_code: string
  description: string
  status: 'offen' | 'in_bearbeitung' | 'abgeschlossen'
  created_at: string
}

interface DbAbsence {
  id: string
  user_id: string
  start_date: string
  end_date: string
  reason: string
  absence_type: 'urlaub' | 'sonstige'
  custom_reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  requires_approval: boolean | null
  created_at: string
}

interface DbEmergency {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
}

// Mapper-Funktionen: DB -> App-Typen
function mapDbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    username: dbUser.username,
    password: dbUser.password,
    fullName: dbUser.full_name,
    role: dbUser.role,
    avatarUrl: dbUser.avatar_url || undefined,
  }
}

function mapDbVehicleToVehicle(dbVehicle: DbVehicle): Vehicle {
  return {
    id: dbVehicle.id,
    name: dbVehicle.name,
    color: dbVehicle.color,
  }
}

function mapDbAppointmentToAppointment(dbAppointment: DbAppointment): Appointment {
  return {
    id: dbAppointment.id,
    title: dbAppointment.title,
    location: dbAppointment.location,
    address: dbAppointment.address,
    customer: dbAppointment.customer,
    workers: dbAppointment.workers,
    equipment: dbAppointment.equipment,
    notes: dbAppointment.notes,
    startDate: dbAppointment.start_date,
    endDate: dbAppointment.end_date,
    color: dbAppointment.color,
    allDay: dbAppointment.all_day,
    multiDayGroupId: dbAppointment.multi_day_group_id || undefined,
    isFirstDay: dbAppointment.is_first_day || undefined,
    isLastDay: dbAppointment.is_last_day || undefined,
    jobGroupId: dbAppointment.job_group_id || undefined,
  }
}

function mapDbCustomerToCustomer(dbCustomer: DbCustomer): Customer {
  return {
    id: dbCustomer.id,
    name: dbCustomer.name,
    street: dbCustomer.street || undefined,
    postalCode: dbCustomer.postal_code || undefined,
    reportForm: dbCustomer.report_form || undefined,
    contactPersons: (dbCustomer.contact_persons || []).map(cp => ({
      id: cp.id,
      name: cp.name,
      phone: cp.phone || undefined,
      email: cp.email || undefined,
    })),
    createdAt: dbCustomer.created_at,
  }
}

function mapDbJobToJob(dbJob: DbJob): Job {
  return {
    id: dbJob.id,
    jobNumber: dbJob.job_number,
    customerId: dbJob.customer_id,
    contactPersonId: dbJob.contact_person_id,
    street: dbJob.street,
    postalCode: dbJob.postal_code,
    description: dbJob.description,
    status: dbJob.status,
    createdAt: dbJob.created_at,
  }
}

function mapDbAbsenceToAbsence(dbAbsence: DbAbsence): Absence {
  return {
    id: dbAbsence.id,
    userId: dbAbsence.user_id,
    startDate: dbAbsence.start_date,
    endDate: dbAbsence.end_date,
    reason: dbAbsence.reason,
    absenceType: dbAbsence.absence_type,
    customReason: dbAbsence.custom_reason || undefined,
    status: dbAbsence.status,
    requiresApproval: dbAbsence.requires_approval || undefined,
    createdAt: dbAbsence.created_at,
  }
}

// ============ USERS SERVICE ============
export const usersService = {
  async getAll(): Promise<User[]> {
    const data = await api.get<DbUser[]>('/users')
    return data.map(mapDbUserToUser)
  },

  async getById(id: string): Promise<User | null> {
    try {
      const data = await api.get<DbUser>(`/users/${id}`)
      return mapDbUserToUser(data)
    } catch {
      return null
    }
  },

  async create(user: Omit<User, 'id'>): Promise<User> {
    const data = await api.post<DbUser>('/users', {
      username: user.username,
      password: user.password,
      full_name: user.fullName,
      role: user.role,
      avatar_url: user.avatarUrl,
    })
    return mapDbUserToUser(data)
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    const data = await api.put<DbUser>(`/users/${id}`, {
      username: updates.username,
      password: updates.password,
      full_name: updates.fullName,
      role: updates.role,
      avatar_url: updates.avatarUrl,
    })
    return mapDbUserToUser(data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },

  async authenticate(username: string, password: string): Promise<User | null> {
    try {
      const data = await api.post<DbUser>('/users/authenticate', { username, password })
      return mapDbUserToUser(data)
    } catch {
      return null
    }
  }
}

// ============ VEHICLES SERVICE ============
export const vehiclesService = {
  async getAll(): Promise<Vehicle[]> {
    const data = await api.get<DbVehicle[]>('/vehicles')
    return data.map(mapDbVehicleToVehicle)
  },

  async create(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const data = await api.post<DbVehicle>('/vehicles', vehicle)
    return mapDbVehicleToVehicle(data)
  },

  async update(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const data = await api.put<DbVehicle>(`/vehicles/${id}`, updates)
    return mapDbVehicleToVehicle(data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`)
  }
}

// ============ APPOINTMENTS SERVICE ============
export const appointmentsService = {
  async getAll(): Promise<Appointment[]> {
    const data = await api.get<DbAppointment[]>('/appointments')
    return data.map(mapDbAppointmentToAppointment)
  },

  async create(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    const data = await api.post<DbAppointment>('/appointments', {
      title: appointment.title,
      location: appointment.location,
      address: appointment.address,
      customer: appointment.customer,
      workers: appointment.workers,
      equipment: appointment.equipment,
      notes: appointment.notes,
      start_date: appointment.startDate,
      end_date: appointment.endDate,
      color: appointment.color,
      all_day: appointment.allDay,
      multi_day_group_id: appointment.multiDayGroupId,
      is_first_day: appointment.isFirstDay,
      is_last_day: appointment.isLastDay,
      job_group_id: appointment.jobGroupId,
    })
    return mapDbAppointmentToAppointment(data)
  },

  async createMany(appointments: Omit<Appointment, 'id'>[]): Promise<Appointment[]> {
    const inserts = appointments.map(a => ({
      title: a.title,
      location: a.location,
      address: a.address,
      customer: a.customer,
      workers: a.workers,
      equipment: a.equipment,
      notes: a.notes,
      start_date: a.startDate,
      end_date: a.endDate,
      color: a.color,
      all_day: a.allDay,
      multi_day_group_id: a.multiDayGroupId,
      is_first_day: a.isFirstDay,
      is_last_day: a.isLastDay,
      job_group_id: a.jobGroupId,
    }))
    const data = await api.post<DbAppointment[]>('/appointments/bulk', inserts)
    return data.map(mapDbAppointmentToAppointment)
  },

  async update(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const data = await api.put<DbAppointment>(`/appointments/${id}`, {
      title: updates.title,
      location: updates.location,
      address: updates.address,
      customer: updates.customer,
      workers: updates.workers,
      equipment: updates.equipment,
      notes: updates.notes,
      start_date: updates.startDate,
      end_date: updates.endDate,
      color: updates.color,
      all_day: updates.allDay,
      multi_day_group_id: updates.multiDayGroupId,
      is_first_day: updates.isFirstDay,
      is_last_day: updates.isLastDay,
      job_group_id: updates.jobGroupId,
    })
    return mapDbAppointmentToAppointment(data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`)
  },

  async deleteByMultiDayGroupId(groupId: string): Promise<void> {
    await api.delete(`/appointments/group/${groupId}`)
  }
}

// ============ CUSTOMERS SERVICE ============
export const customersService = {
  async getAll(): Promise<Customer[]> {
    const data = await api.get<DbCustomer[]>('/customers')
    return data.map(mapDbCustomerToCustomer)
  },

  async create(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const data = await api.post<DbCustomer>('/customers', {
      name: customer.name,
      street: customer.street,
      postal_code: customer.postalCode,
      report_form: customer.reportForm,
      contact_persons: customer.contactPersons?.map(cp => ({
        name: cp.name,
        phone: cp.phone,
        email: cp.email,
      })),
    })
    return mapDbCustomerToCustomer(data)
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    const data = await api.put<DbCustomer>(`/customers/${id}`, {
      name: updates.name,
      street: updates.street,
      postal_code: updates.postalCode,
      report_form: updates.reportForm,
    })
    return mapDbCustomerToCustomer(data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/customers/${id}`)
  },

  async addContactPerson(customerId: string, contactPerson: Omit<ContactPerson, 'id'>): Promise<ContactPerson> {
    const data = await api.post<DbContactPerson>('/contact-persons', {
      customer_id: customerId,
      name: contactPerson.name,
      phone: contactPerson.phone,
      email: contactPerson.email,
    })
    return {
      id: data.id,
      name: data.name,
      phone: data.phone || undefined,
      email: data.email || undefined,
    }
  },

  async updateContactPerson(id: string, updates: Partial<ContactPerson>): Promise<ContactPerson> {
    const data = await api.put<DbContactPerson>(`/contact-persons/${id}`, updates)
    return {
      id: data.id,
      name: data.name,
      phone: data.phone || undefined,
      email: data.email || undefined,
    }
  },

  async deleteContactPerson(id: string): Promise<void> {
    await api.delete(`/contact-persons/${id}`)
  }
}

// ============ JOBS SERVICE ============
export const jobsService = {
  async getAll(): Promise<Job[]> {
    const data = await api.get<DbJob[]>('/jobs')
    return data.map(mapDbJobToJob)
  },

  async create(job: Omit<Job, 'id' | 'createdAt'>): Promise<Job> {
    const data = await api.post<DbJob>('/jobs', {
      job_number: job.jobNumber,
      customer_id: job.customerId,
      contact_person_id: job.contactPersonId,
      street: job.street,
      postal_code: job.postalCode,
      description: job.description,
      status: job.status,
    })
    return mapDbJobToJob(data)
  },

  async update(id: string, updates: Partial<Job>): Promise<Job> {
    const data = await api.put<DbJob>(`/jobs/${id}`, {
      job_number: updates.jobNumber,
      customer_id: updates.customerId,
      contact_person_id: updates.contactPersonId,
      street: updates.street,
      postal_code: updates.postalCode,
      description: updates.description,
      status: updates.status,
    })
    return mapDbJobToJob(data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`)
  }
}

// ============ ABSENCES SERVICE ============
export const absencesService = {
  async getAll(): Promise<Absence[]> {
    const data = await api.get<DbAbsence[]>('/absences')
    return data.map(mapDbAbsenceToAbsence)
  },

  async create(absence: Omit<Absence, 'id' | 'createdAt'>): Promise<Absence> {
    const data = await api.post<DbAbsence>('/absences', {
      user_id: absence.userId,
      start_date: absence.startDate,
      end_date: absence.endDate,
      reason: absence.reason,
      absence_type: absence.absenceType,
      custom_reason: absence.customReason,
      status: absence.status,
      requires_approval: absence.requiresApproval,
    })
    return mapDbAbsenceToAbsence(data)
  },

  async update(id: string, updates: Partial<Absence>): Promise<Absence> {
    const data = await api.put<DbAbsence>(`/absences/${id}`, {
      user_id: updates.userId,
      start_date: updates.startDate,
      end_date: updates.endDate,
      reason: updates.reason,
      absence_type: updates.absenceType,
      custom_reason: updates.customReason,
      status: updates.status,
      requires_approval: updates.requiresApproval,
    })
    return mapDbAbsenceToAbsence(data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/absences/${id}`)
  },

  async approve(id: string): Promise<Absence> {
    return this.update(id, { status: 'approved' })
  },

  async reject(id: string): Promise<Absence> {
    return this.update(id, { status: 'rejected' })
  }
}

// ============ EMERGENCIES SERVICE ============
export interface Emergency {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'resolved'
  createdAt: string
}

function mapDbEmergencyToEmergency(dbEmergency: DbEmergency): Emergency {
  return {
    id: dbEmergency.id,
    title: dbEmergency.title,
    description: dbEmergency.description,
    priority: dbEmergency.priority,
    status: dbEmergency.status,
    createdAt: dbEmergency.created_at,
  }
}

export const emergenciesService = {
  async getAll(): Promise<Emergency[]> {
    const data = await api.get<DbEmergency[]>('/emergencies')
    return data.map(mapDbEmergencyToEmergency)
  },

  async create(emergency: Omit<Emergency, 'id' | 'createdAt'>): Promise<Emergency> {
    const data = await api.post<DbEmergency>('/emergencies', emergency)
    return mapDbEmergencyToEmergency(data)
  },

  async update(id: string, updates: Partial<Emergency>): Promise<Emergency> {
    const data = await api.put<DbEmergency>(`/emergencies/${id}`, updates)
    return mapDbEmergencyToEmergency(data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/emergencies/${id}`)
  }
}

// ============ SETTINGS SERVICE ============
export const settingsService = {
  async get<T>(userId: string, key: string, defaultValue: T): Promise<T> {
    try {
      const data = await api.get<T>(`/settings/${userId}/${key}`)
      return data
    } catch {
      return defaultValue
    }
  },

  async set<T>(userId: string, key: string, value: T): Promise<void> {
    await api.put(`/settings/${userId}/${key}`, { value })
  }
}
