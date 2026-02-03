import { Appointment } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Clock, MapPin, User, Wrench, X, Trash } from '@phosphor-icons/react'
import { formatDate, parseDate } from '@/lib/date-utils'
import { motion } from 'framer-motion'
import { useAppointments } from '@/hooks/use-database'
import { toast } from 'sonner'
import { useState } from 'react'

interface AppointmentDetailPanelProps {
  appointment: Appointment | null
  onClose: () => void
}

export function AppointmentDetailPanel({
  appointment,
  onClose,
}: AppointmentDetailPanelProps) {
  const { appointments, deleteAppointment, deleteByMultiDayGroupId } = useAppointments()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  if (!appointment) return null

  const startDate = parseDate(appointment.startDate)
  const endDate = parseDate(appointment.endDate)

  const relatedAppointments = appointment.jobGroupId
    ? (appointments || []).filter(apt => apt.jobGroupId === appointment.jobGroupId)
    : [appointment]

  const uniqueVehiclesMap = new Map<string, { name: string; color: string }>()
  relatedAppointments.forEach(apt => {
    if (!uniqueVehiclesMap.has(apt.equipment)) {
      uniqueVehiclesMap.set(apt.equipment, {
        name: apt.equipment,
        color: apt.color
      })
    }
  })
  const allVehicles = Array.from(uniqueVehiclesMap.values())

  const handleDelete = async () => {
    try {
      if (appointment.jobGroupId) {
        // Delete all appointments with the same jobGroupId
        const aptsToDelete = (appointments || []).filter(apt => apt.jobGroupId === appointment.jobGroupId)
        for (const apt of aptsToDelete) {
          await deleteAppointment(apt.id)
        }
        toast.success('Auftrag mit allen Fahrzeugen gelöscht')
      } else if (appointment.multiDayGroupId) {
        await deleteByMultiDayGroupId(appointment.multiDayGroupId)
        toast.success('Mehrtägiger Termin gelöscht')
      } else {
        await deleteAppointment(appointment.id)
        toast.success('Termin gelöscht')
      }
      setShowDeleteConfirm(false)
      setTimeout(() => {
        onClose()
      }, 100)
    } catch (error) {
      toast.error('Fehler beim Löschen des Termins')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed right-0 top-0 h-full w-full sm:w-96 bg-card border-l border-border shadow-2xl z-20 overflow-y-auto"
    >
      <Card className="border-0 rounded-none h-full">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-2xl">Überblick</CardTitle>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X size={20} weight="bold" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Wann?
            </div>
            <div className="flex items-start gap-3">
              <Clock size={20} weight="bold" className="text-primary mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">
                  {formatDate(startDate, 'EEEE, d. MMMM yyyy')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {appointment.allDay
                    ? 'Ganztägig'
                    : `${formatDate(startDate, 'HH:mm')} - ${formatDate(endDate, 'HH:mm')}`}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Wo?
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={20} weight="bold" className="text-primary mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">{appointment.location}</div>
                {appointment.address && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {appointment.address}
                  </div>
                )}
                {appointment.customer && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Kunde: {appointment.customer}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Was?
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="font-medium">{appointment.title || 'Keine Beschreibung'}</div>
                {appointment.notes && (
                  <div className="text-sm text-muted-foreground mt-2">
                    {appointment.notes}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Wer?
            </div>
            <div className="flex items-start gap-3">
              <User size={20} weight="bold" className="text-primary mt-0.5" />
              <div className="flex-1 flex flex-wrap gap-2">
                {appointment.workers.length > 0 ? (
                  appointment.workers.map((worker) => (
                    <Badge key={worker} variant="secondary">
                      {worker}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Keine Mitarbeiter zugewiesen
                  </span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Womit?
            </div>
            <div className="flex items-start gap-3">
              <Wrench size={20} weight="bold" className="text-primary mt-0.5" />
              <div className="flex-1 flex flex-wrap gap-2">
                {allVehicles.map((vehicle, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="font-mono text-white border-0"
                    style={{ backgroundColor: vehicle.color }}
                  >
                    {vehicle.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="pt-2">
            <Button className="w-full" size="lg">
              Anschauen
            </Button>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash size={16} weight="bold" className="mr-1.5" />
            Termin löschen
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Termin löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diesen Termin löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
