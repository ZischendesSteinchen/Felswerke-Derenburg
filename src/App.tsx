import { useState } from 'react'
import { LoginScreen } from '@/components/LoginScreen'
import { CalendarHeader } from '@/components/CalendarHeader'
import { UebersichtPage } from '@/components/UebersichtPage'
import { HomePage } from '@/components/HomePage'
import { AppointmentDetailPanel } from '@/components/AppointmentDetailPanel'
import { MitarbeiterPage } from '@/components/MitarbeiterPage'
import { FahrzeugePage } from '@/components/FahrzeugePage'
import { AuftraegePage } from '@/components/AuftraegePage'
import { InventarPage } from '@/components/InventarPage'
import { KundenPage } from '@/components/KundenPage'
import { User, Appointment, CalendarView } from '@/lib/types'
import { navigateDate } from '@/lib/date-utils'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { useUsers, useAppointments, useCurrentUser } from '@/hooks/use-database'

type PageView = 'uebersicht' | 'home' | 'auftraege' | 'mitarbeiter' | 'inventar' | 'kunden' | 'fahrzeuge'

function App() {
  const { users } = useUsers()
  const { appointments, refresh: refreshAppointments } = useAppointments()
  const { currentUser, updateCurrentUser, logout: logoutUser } = useCurrentUser()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('month')
  const [currentPage, setCurrentPage] = useState<PageView>('uebersicht')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const handleLogin = (user: User) => {
    updateCurrentUser(user)
    toast.success(`Willkommen, ${user.fullName}!`)
  }

  const handleLogout = () => {
    logoutUser()
    setSelectedAppointment(null)
    setCurrentPage('uebersicht')
    toast.info('Erfolgreich abgemeldet')
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    setCurrentDate(navigateDate(currentDate, direction, view))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleRefresh = async () => {
    await refreshAppointments()
    toast.success('Kalender aktualisiert')
  }

  const handleViewChange = (newView: CalendarView) => {
    setView(newView)
    setSelectedAppointment(null)
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
  }

  const handleDateClick = (date: Date) => {
    setCurrentDate(date)
    setView('day')
  }

  const handleMonthClick = (date: Date) => {
    setCurrentDate(date)
    setView('month')
  }

  const handlePageChange = (page: PageView) => {
    setCurrentPage(page)
    setSelectedAppointment(null)
  }

  const handleUserUpdate = (updatedUser: User) => {
    updateCurrentUser(updatedUser)
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} users={users || []} />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        currentPage={currentPage}
        currentUser={currentUser}
        onPageChange={handlePageChange}
        onViewChange={handleViewChange}
        onNavigate={handleNavigate}
        onToday={handleToday}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
        showCalendarControls={currentPage === 'home'}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex relative">
          {currentPage === 'uebersicht' && (
            <UebersichtPage 
              key={`uebersicht-${appointments?.length || 0}`}
              appointments={appointments || []} 
              users={users || []} 
            />
          )}
          
          {currentPage === 'home' && (
            <>
              <HomePage
                key={`home-${appointments?.length || 0}`}
                currentDate={currentDate}
                view={view}
                appointments={appointments || []}
                onAppointmentClick={handleAppointmentClick}
                onDateClick={handleDateClick}
                onMonthClick={handleMonthClick}
                isAdmin={currentUser?.role === 'Administrator'}
              />

              <AnimatePresence>
                {selectedAppointment && (
                  <AppointmentDetailPanel
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                  />
                )}
              </AnimatePresence>
            </>
          )}

          {currentPage === 'auftraege' && (
            <AuftraegePage />
          )}

          {currentPage === 'mitarbeiter' && (
            <MitarbeiterPage />
          )}

          {currentPage === 'inventar' && (
            <InventarPage />
          )}

          {currentPage === 'kunden' && (
            <KundenPage />
          )}

          {currentPage === 'fahrzeuge' && (
            <FahrzeugePage />
          )}
        </div>
      </div>

      <Toaster />
    </div>
  )
}

export default App