import { useAbsences, useUsers } from '@/hooks/use-database'
import { Appointment, CalendarView, Absence } from '@/lib/types'
import { MonthView } from '@/components/MonthView'
import { WeekView } from '@/components/WeekView'
import { DayView } from '@/components/DayView'
import { YearView } from '@/components/YearView'
import { useMemo } from 'react'
import { isSameDay, eachDayOfInterval } from 'date-fns'

interface HomePageProps {
  currentDate: Date
  view: CalendarView
  appointments: Appointment[]
  onAppointmentClick: (appointment: Appointment) => void
  onDateClick: (date: Date) => void
  onMonthClick: (date: Date) => void
  isAdmin: boolean
}

export function HomePage({ 
  currentDate, 
  view, 
  appointments, 
  onAppointmentClick, 
  onDateClick, 
  onMonthClick,
  isAdmin 
}: HomePageProps) {
  const { absences } = useAbsences()
  const { users } = useUsers()

  const absenceAppointments = useMemo(() => {
    const approvedAbsences = (absences || []).filter(abs => abs.status === 'approved')
    const absenceAppts: Appointment[] = []

    approvedAbsences.forEach(absence => {
      const user = (users || []).find(u => u.id === absence.userId)
      const userName = user?.fullName || 'Mitarbeiter'
      
      const startDate = new Date(absence.startDate + 'T00:00:00')
      const endDate = new Date(absence.endDate + 'T00:00:00')
      
      if (isSameDay(startDate, endDate)) {
        absenceAppts.push({
          id: `absence_${absence.id}`,
          title: `${userName} - ${absence.reason}`,
          location: `${userName} - ${absence.reason}`,
          address: '',
          customer: '',
          workers: [absence.userId],
          equipment: '',
          notes: absence.reason,
          startDate: absence.startDate,
          endDate: absence.endDate,
          color: '#9ca3af',
          allDay: true
        })
      } else {
        const daysInRange = eachDayOfInterval({ start: startDate, end: endDate })
        const groupId = `absence_multi_${absence.id}`
        
        daysInRange.forEach((day, index) => {
          const year = day.getFullYear()
          const month = String(day.getMonth() + 1).padStart(2, '0')
          const dayNum = String(day.getDate()).padStart(2, '0')
          const formattedDate = `${year}-${month}-${dayNum}`
          
          absenceAppts.push({
            id: `absence_${absence.id}_${index}`,
            title: `${userName} - ${absence.reason}`,
            location: `${userName} - ${absence.reason}`,
            address: '',
            customer: '',
            workers: [absence.userId],
            equipment: '',
            notes: absence.reason,
            startDate: formattedDate,
            endDate: formattedDate,
            color: '#9ca3af',
            allDay: true,
            multiDayGroupId: groupId,
            isFirstDay: index === 0,
            isLastDay: index === daysInRange.length - 1
          })
        })
      }
    })

    return absenceAppts
  }, [absences, users])

  const allAppointments = useMemo(() => {
    return [...appointments, ...absenceAppointments]
  }, [appointments, absenceAppointments])

  return (
    <>
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          appointments={allAppointments}
          onAppointmentClick={onAppointmentClick}
          onDateClick={onDateClick}
          isAdmin={isAdmin}
        />
      )}
      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          appointments={allAppointments}
          onAppointmentClick={onAppointmentClick}
          isAdmin={isAdmin}
        />
      )}
      {view === 'day' && (
        <DayView
          currentDate={currentDate}
          appointments={allAppointments}
          onAppointmentClick={onAppointmentClick}
          isAdmin={isAdmin}
        />
      )}
      {view === 'year' && (
        <YearView
          currentDate={currentDate}
          appointments={allAppointments}
          onMonthClick={onMonthClick}
        />
      )}
    </>
  )
}
