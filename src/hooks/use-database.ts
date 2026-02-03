import { useState, useEffect, useCallback, useRef } from 'react'
import {
  usersService,
  vehiclesService,
  appointmentsService,
  customersService,
  jobsService,
  absencesService,
  emergenciesService,
  settingsService,
  type Emergency
} from '@/lib/database'
import type { User, Vehicle, Appointment, Customer, Job, Absence } from '@/lib/types'

// Polling-Intervall in ms (optional, 0 = kein Polling)
const POLLING_INTERVAL = 0 // Auf z.B. 5000 setzen für 5-Sekunden-Polling

// Generic hook für Daten mit optionalem Polling
function useDataFetching<T>(
  fetchData: () => Promise<T[]>,
  pollingInterval: number = POLLING_INTERVAL
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchData()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [fetchData])

  useEffect(() => {
    refresh()

    // Optional: Polling für Auto-Refresh
    if (pollingInterval > 0) {
      intervalRef.current = setInterval(refresh, pollingInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [refresh, pollingInterval])

  return { data, loading, error, refresh, setData }
}

// ============ USERS HOOKS ============
export function useUsers() {
  const { data, loading, error, refresh, setData } = useDataFetching<User>(
    usersService.getAll
  )

  const createUser = useCallback(async (user: Omit<User, 'id'>) => {
    const newUser = await usersService.create(user)
    setData(prev => [...prev, newUser])
    return newUser
  }, [setData])

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    const updated = await usersService.update(id, updates)
    setData(prev => prev.map(u => u.id === id ? updated : u))
    return updated
  }, [setData])

  const deleteUser = useCallback(async (id: string) => {
    await usersService.delete(id)
    setData(prev => prev.filter(u => u.id !== id))
  }, [setData])

  return {
    users: data,
    loading,
    error,
    refresh,
    createUser,
    updateUser,
    deleteUser
  }
}

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored))
      } catch (e) {
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<User | null> => {
    const user = await usersService.authenticate(username, password)
    if (user) {
      setCurrentUser(user)
      localStorage.setItem('currentUser', JSON.stringify(user))
    }
    return user
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }, [])

  const updateCurrentUser = useCallback((user: User) => {
    setCurrentUser(user)
    localStorage.setItem('currentUser', JSON.stringify(user))
  }, [])

  return {
    currentUser,
    loading,
    login,
    logout,
    updateCurrentUser,
    setCurrentUser: updateCurrentUser
  }
}

// ============ VEHICLES HOOKS ============
export function useVehicles() {
  const { data, loading, error, refresh, setData } = useDataFetching<Vehicle>(
    vehiclesService.getAll
  )

  const createVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = await vehiclesService.create(vehicle)
    setData(prev => [...prev, newVehicle])
    return newVehicle
  }, [setData])

  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
    const updated = await vehiclesService.update(id, updates)
    setData(prev => prev.map(v => v.id === id ? updated : v))
    return updated
  }, [setData])

  const deleteVehicle = useCallback(async (id: string) => {
    await vehiclesService.delete(id)
    setData(prev => prev.filter(v => v.id !== id))
  }, [setData])

  return {
    vehicles: data,
    loading,
    error,
    refresh,
    createVehicle,
    updateVehicle,
    deleteVehicle
  }
}

// ============ APPOINTMENTS HOOKS ============
export function useAppointments() {
  const { data, loading, error, refresh, setData } = useDataFetching<Appointment>(
    appointmentsService.getAll
  )

  const createAppointment = useCallback(async (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment = await appointmentsService.create(appointment)
    setData(prev => [...prev, newAppointment])
    return newAppointment
  }, [setData])

  const createManyAppointments = useCallback(async (appointments: Omit<Appointment, 'id'>[]) => {
    const newAppointments = await appointmentsService.createMany(appointments)
    setData(prev => [...prev, ...newAppointments])
    return newAppointments
  }, [setData])

  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    const updated = await appointmentsService.update(id, updates)
    setData(prev => prev.map(a => a.id === id ? updated : a))
    return updated
  }, [setData])

  const deleteAppointment = useCallback(async (id: string) => {
    await appointmentsService.delete(id)
    setData(prev => prev.filter(a => a.id !== id))
  }, [setData])

  const deleteByMultiDayGroupId = useCallback(async (groupId: string) => {
    await appointmentsService.deleteByMultiDayGroupId(groupId)
    setData(prev => prev.filter(a => a.multiDayGroupId !== groupId))
  }, [setData])

  return {
    appointments: data,
    loading,
    error,
    refresh,
    createAppointment,
    createManyAppointments,
    updateAppointment,
    deleteAppointment,
    deleteByMultiDayGroupId,
    setAppointments: setData
  }
}

// ============ CUSTOMERS HOOKS ============
export function useCustomers() {
  const { data, loading, error, refresh, setData } = useDataFetching<Customer>(
    customersService.getAll
  )

  const createCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer = await customersService.create(customer)
    setData(prev => [...prev, newCustomer])
    return newCustomer
  }, [setData])

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    const updated = await customersService.update(id, updates)
    setData(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }, [setData])

  const deleteCustomer = useCallback(async (id: string) => {
    await customersService.delete(id)
    setData(prev => prev.filter(c => c.id !== id))
  }, [setData])

  return {
    customers: data,
    loading,
    error,
    refresh,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    setCustomers: setData
  }
}

// ============ JOBS HOOKS ============
export function useJobs() {
  const { data, loading, error, refresh, setData } = useDataFetching<Job>(
    jobsService.getAll
  )

  const createJob = useCallback(async (job: Omit<Job, 'id' | 'createdAt'>) => {
    const newJob = await jobsService.create(job)
    setData(prev => [...prev, newJob])
    return newJob
  }, [setData])

  const updateJob = useCallback(async (id: string, updates: Partial<Job>) => {
    const updated = await jobsService.update(id, updates)
    setData(prev => prev.map(j => j.id === id ? updated : j))
    return updated
  }, [setData])

  const deleteJob = useCallback(async (id: string) => {
    await jobsService.delete(id)
    setData(prev => prev.filter(j => j.id !== id))
  }, [setData])

  return {
    jobs: data,
    loading,
    error,
    refresh,
    createJob,
    updateJob,
    deleteJob,
    setJobs: setData
  }
}

// ============ ABSENCES HOOKS ============
export function useAbsences() {
  const { data, loading, error, refresh, setData } = useDataFetching<Absence>(
    absencesService.getAll
  )

  const createAbsence = useCallback(async (absence: Omit<Absence, 'id' | 'createdAt'>) => {
    const newAbsence = await absencesService.create(absence)
    setData(prev => [...prev, newAbsence])
    return newAbsence
  }, [setData])

  const updateAbsence = useCallback(async (id: string, updates: Partial<Absence>) => {
    const updated = await absencesService.update(id, updates)
    setData(prev => prev.map(a => a.id === id ? updated : a))
    return updated
  }, [setData])

  const deleteAbsence = useCallback(async (id: string) => {
    await absencesService.delete(id)
    setData(prev => prev.filter(a => a.id !== id))
  }, [setData])

  const approveAbsence = useCallback(async (id: string) => {
    const updated = await absencesService.approve(id)
    setData(prev => prev.map(a => a.id === id ? updated : a))
    return updated
  }, [setData])

  const rejectAbsence = useCallback(async (id: string) => {
    const updated = await absencesService.reject(id)
    setData(prev => prev.map(a => a.id === id ? updated : a))
    return updated
  }, [setData])

  return {
    absences: data,
    loading,
    error,
    refresh,
    createAbsence,
    updateAbsence,
    deleteAbsence,
    approveAbsence,
    rejectAbsence,
    setAbsences: setData
  }
}

// ============ EMERGENCIES HOOKS ============
export function useEmergencies() {
  const { data, loading, error, refresh, setData } = useDataFetching<Emergency>(
    emergenciesService.getAll
  )

  const createEmergency = useCallback(async (emergency: Omit<Emergency, 'id' | 'createdAt'>) => {
    const newEmergency = await emergenciesService.create(emergency)
    setData(prev => [...prev, newEmergency])
    return newEmergency
  }, [setData])

  const updateEmergency = useCallback(async (id: string, updates: Partial<Emergency>) => {
    const updated = await emergenciesService.update(id, updates)
    setData(prev => prev.map(e => e.id === id ? updated : e))
    return updated
  }, [setData])

  const deleteEmergency = useCallback(async (id: string) => {
    await emergenciesService.delete(id)
    setData(prev => prev.filter(e => e.id !== id))
  }, [setData])

  return {
    emergencies: data,
    loading,
    error,
    refresh,
    createEmergency,
    updateEmergency,
    deleteEmergency,
    setEmergencies: setData
  }
}

// ============ SETTINGS HOOKS ============
export function useSetting<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)
  const { currentUser } = useCurrentUser()

  useEffect(() => {
    if (!currentUser) {
      setValue(defaultValue)
      setLoading(false)
      return
    }

    settingsService.get(currentUser.id, key, defaultValue)
      .then(result => {
        setValue(result)
      })
      .catch(err => {
        console.error('Error loading setting:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [currentUser, key, defaultValue])

  const updateValue = useCallback(async (newValue: T) => {
    if (!currentUser) return
    
    setValue(newValue)
    await settingsService.set(currentUser.id, key, newValue)
  }, [currentUser, key])

  return [value, updateValue, loading] as const
}

// Dark mode hook
export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('dark-mode')
    return stored ? JSON.parse(stored) : false
  })

  useEffect(() => {
    localStorage.setItem('dark-mode', JSON.stringify(isDarkMode))
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return [isDarkMode, setIsDarkMode] as const
}
