import { Button } from '@/components/ui/button'
import { CalendarView, User, Absence } from '@/lib/types'
import { ArrowLeft, ArrowRight, SignOut, ArrowsClockwise, SquaresFour, Moon, Sun, Gear, UserCircle, Flame } from '@phosphor-icons/react'
import { formatDate } from '@/lib/date-utils'
import { useState, useEffect } from 'react'
import { useDarkMode, useAbsences } from '@/hooks/use-database'
import { Navigation } from '@/components/Navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SettingsDialog } from '@/components/SettingsDialog'
import { EmergencyDialog } from '@/components/EmergencyDialog'
import { AbwesenheitenDialog } from '@/components/AbwesenheitenDialog'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  currentPage: 'uebersicht' | 'home' | 'auftraege' | 'mitarbeiter' | 'inventar' | 'kunden' | 'fahrzeuge'
  currentUser: User
  onPageChange: (page: 'uebersicht' | 'home' | 'auftraege' | 'mitarbeiter' | 'inventar' | 'kunden' | 'fahrzeuge') => void
  onViewChange: (view: CalendarView) => void
  onNavigate: (direction: 'prev' | 'next') => void
  onToday: () => void
  onRefresh: () => void
  onLogout: () => void
  onUserUpdate: (user: User) => void
  showCalendarControls?: boolean
}

export function CalendarHeader({
  currentDate,
  view,
  currentPage,
  currentUser,
  onPageChange,
  onViewChange,
  onNavigate,
  onToday,
  onRefresh,
  onLogout,
  onUserUpdate,
  showCalendarControls = true,
}: CalendarHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useDarkMode()
  const { absences } = useAbsences()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const [absenceOpen, setAbsenceOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const pendingAbsenceRequests = (absences || []).filter(absence => absence.status === 'pending').length

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode((current) => !current)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    onRefresh()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  const getUserInitials = (fullName: string) => {
    const parts = fullName.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return fullName.substring(0, 2).toUpperCase()
  }

  const getDateDisplay = () => {
    switch (view) {
      case 'day':
        return formatDate(currentDate, 'EEEE, d. MMMM yyyy')
      case 'week':
        return `Woche ${formatDate(currentDate, 'w, MMMM yyyy')}`
      case 'month':
        return formatDate(currentDate, 'MMMM yyyy')
      case 'year':
        return formatDate(currentDate, 'yyyy')
    }
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <SquaresFour size={24} weight="fill" className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Fels-Servicebetrieb</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setEmergencyOpen(true)} 
              size="sm" 
              className="h-9 w-9 p-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              title="Notfall"
            >
              <Flame size={20} weight="fill" />
            </Button>
            
            <Button 
              onClick={handleRefresh} 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0"
              title="Aktualisieren"
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <ArrowsClockwise size={20} weight="bold" />
              </motion.div>
            </Button>
            
            <Button 
              onClick={toggleDarkMode} 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 relative"
              title={isDarkMode ? 'Hell-Modus' : 'Dunkel-Modus'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDarkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ scale: 0, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Sun size={20} weight="bold" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ scale: 0, rotate: 90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Moon size={20} weight="bold" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.fullName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {getUserInitials(currentUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{currentUser.fullName}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Gear size={16} weight="bold" className="mr-2" />
                  Einstellungen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAbsenceOpen(true)}>
                  <UserCircle size={16} weight="bold" className="mr-2" />
                  Abwesenheiten
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <SignOut size={16} weight="bold" className="mr-2" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="px-6 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold mb-1">Willkommen {currentUser.fullName},</h2>
            <p className="text-muted-foreground">
              In dem Kalender können Sie alle aktuellen Termine und Einsätze verwalten.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-4">
        <Navigation currentPage={currentPage} onNavigate={onPageChange} hasPendingAbsenceRequests={pendingAbsenceRequests > 0} />
      </div>

      {showCalendarControls && (
        <div className="px-6 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button onClick={() => onNavigate('prev')} variant="outline" size="icon">
              <ArrowLeft size={18} weight="bold" />
            </Button>
            <Button onClick={() => onNavigate('next')} variant="outline" size="icon">
              <ArrowRight size={18} weight="bold" />
            </Button>
            <Button onClick={onToday} variant="outline" size="sm" className="ml-1">
              Heute
            </Button>
            <div className="ml-4 text-lg font-semibold">
              {getDateDisplay()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1 gap-1">
              <Button
                onClick={() => onViewChange('day')}
                variant={view === 'day' ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
              >
                Tag
              </Button>
              <Button
                onClick={() => onViewChange('week')}
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
              >
                Woche
              </Button>
              <Button
                onClick={() => onViewChange('month')}
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
              >
                Monat
              </Button>
              <Button
                onClick={() => onViewChange('year')}
                variant={view === 'year' ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
              >
                Jahr
              </Button>
            </div>
          </div>
        </div>
      )}

      <SettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
        user={currentUser}
        onUserUpdate={onUserUpdate}
      />
      
      <EmergencyDialog
        open={emergencyOpen}
        onOpenChange={setEmergencyOpen}
        currentUser={currentUser}
      />

      <AbwesenheitenDialog
        open={absenceOpen}
        onOpenChange={setAbsenceOpen}
        currentUser={currentUser}
      />
    </header>
  )
}
