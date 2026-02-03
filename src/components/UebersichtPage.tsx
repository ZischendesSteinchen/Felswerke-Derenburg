import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ClipboardText, ChartBar, EnvelopeOpen } from '@phosphor-icons/react'
import { Appointment, User, Absence } from '@/lib/types'
import { formatDate } from '@/lib/date-utils'
import { isSameDay, isAfter, startOfDay } from 'date-fns'
import { useAbsences } from '@/hooks/use-database'
import { AbwesenheitsantraegeDialog } from '@/components/AbwesenheitsantraegeDialog'

interface UebersichtPageProps {
  appointments: Appointment[]
  users: User[]
}

export function UebersichtPage({ appointments, users }: UebersichtPageProps) {
  const { absences, loading: isLoading } = useAbsences()
  const [showAbsenceRequests, setShowAbsenceRequests] = useState(false)
  
  const today = startOfDay(new Date())
  
  const todayAppointments = appointments.filter(apt => {
    const startDate = new Date(apt.startDate)
    return isSameDay(startDate, today)
  })

  const upcomingAppointments = appointments.filter(apt => {
    const startDate = new Date(apt.startDate)
    return isAfter(startDate, today)
  }).sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  }).slice(0, 5)

  const pendingAbsenceRequests = (absences || []).filter(absence => absence.status === 'pending').length

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Lade Daten...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 w-full">
      <div>
        <h2 className="text-3xl font-semibold mb-2">Übersicht</h2>
        <p className="text-muted-foreground">
          Hier sehen Sie eine Zusammenfassung aller wichtigen Informationen
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar size={16} weight="bold" />
              Termine heute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{todayAppointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardText size={16} weight="bold" />
              Termine gesamt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{appointments.length}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:bg-accent/50 transition-colors ${pendingAbsenceRequests > 0 ? 'border-destructive border-2' : ''}`}
          onClick={() => setShowAbsenceRequests(true)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <EnvelopeOpen size={16} weight="bold" />
              Abwesenheitsanträge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${pendingAbsenceRequests > 0 ? 'text-destructive' : 'text-primary'}`}>{pendingAbsenceRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ChartBar size={16} weight="bold" />
              Anstehend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{upcomingAppointments.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} weight="bold" />
              Heutige Termine
            </CardTitle>
            <CardDescription>
              Alle Termine für heute
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Keine Termine für heute
              </p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map(apt => (
                  <div key={apt.id} className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium">{apt.title}</div>
                        <div className="text-sm text-muted-foreground">{apt.location}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDate(new Date(apt.startDate), 'HH:mm')} - {formatDate(new Date(apt.endDate), 'HH:mm')}
                        </div>
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: apt.color.startsWith('#') ? apt.color : undefined }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardText size={20} weight="bold" />
              Kommende Termine
            </CardTitle>
            <CardDescription>
              Die nächsten 5 Termine
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Keine kommenden Termine
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map(apt => (
                  <div key={apt.id} className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium">{apt.title}</div>
                        <div className="text-sm text-muted-foreground">{apt.location}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {apt.allDay 
                            ? `${formatDate(new Date(apt.startDate), 'd. MMM yyyy')}, ganztägig`
                            : formatDate(new Date(apt.startDate), 'd. MMM yyyy, HH:mm')
                          }
                        </div>
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: apt.color.startsWith('#') ? apt.color : undefined }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AbwesenheitsantraegeDialog 
        open={showAbsenceRequests}
        onOpenChange={setShowAbsenceRequests}
      />
    </div>
  )
}
