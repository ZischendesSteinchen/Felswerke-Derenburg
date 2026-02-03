import { Button } from '@/components/ui/button'
import { House, Users, Truck, ClipboardText, UserCircle, Package, ChartBar } from '@phosphor-icons/react'

interface NavigationProps {
  currentPage: 'uebersicht' | 'home' | 'auftraege' | 'mitarbeiter' | 'inventar' | 'kunden' | 'fahrzeuge'
  onNavigate: (page: 'uebersicht' | 'home' | 'auftraege' | 'mitarbeiter' | 'inventar' | 'kunden' | 'fahrzeuge') => void
  hasPendingAbsenceRequests?: boolean
}

export function Navigation({ currentPage, onNavigate, hasPendingAbsenceRequests = false }: NavigationProps) {
  return (
    <nav className="flex gap-1 bg-muted rounded-lg p-1">
      <Button
        onClick={() => onNavigate('uebersicht')}
        variant={currentPage === 'uebersicht' ? 'default' : 'ghost'}
        size="sm"
        className={`gap-2 ${hasPendingAbsenceRequests ? 'border-destructive border-2' : ''}`}
      >
        <ChartBar size={16} weight="bold" />
        Übersicht
      </Button>
      <Button
        onClick={() => onNavigate('home')}
        variant={currentPage === 'home' ? 'default' : 'ghost'}
        size="sm"
        className="gap-2"
      >
        <House size={16} weight="bold" />
        Home
      </Button>
      <Button
        onClick={() => onNavigate('auftraege')}
        variant={currentPage === 'auftraege' ? 'default' : 'ghost'}
        size="sm"
        className="gap-2"
      >
        <ClipboardText size={16} weight="bold" />
        Aufträge
      </Button>
      <Button
        onClick={() => onNavigate('mitarbeiter')}
        variant={currentPage === 'mitarbeiter' ? 'default' : 'ghost'}
        size="sm"
        className="gap-2"
      >
        <Users size={16} weight="bold" />
        Mitarbeiter
      </Button>
      <Button
        onClick={() => onNavigate('fahrzeuge')}
        variant={currentPage === 'fahrzeuge' ? 'default' : 'ghost'}
        size="sm"
        className="gap-2"
      >
        <Truck size={16} weight="bold" />
        Fahrzeuge
      </Button>
      <Button
        onClick={() => onNavigate('kunden')}
        variant={currentPage === 'kunden' ? 'default' : 'ghost'}
        size="sm"
        className="gap-2"
      >
        <UserCircle size={16} weight="bold" />
        Kunden
      </Button>
    </nav>
  )
}
