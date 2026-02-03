import { useState, useRef, useEffect } from 'react'
import { Appointment } from '@/lib/types'
import { formatDate } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MultiDaySelectionDialog } from '@/components/MultiDaySelectionDialog'
import { VehicleLegend } from '@/components/VehicleLegend'

interface DayViewProps {
  currentDate: Date
  appointments: Appointment[]
  onAppointmentClick: (appointment: Appointment) => void
  isAdmin?: boolean
}

export function DayView({
  currentDate,
  appointments,
  onAppointmentClick,
  isAdmin = false,
}: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const [isDragging, setIsDragging] = useState(false)
  const [selectedDates] = useState<Date[]>([currentDate])
  const [showDialog, setShowDialog] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        setShowDialog(true)
      }
    }

    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp)
      return () => document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isAdmin) return
    
    const target = e.target as HTMLElement
    if (target.closest('[data-appointment]')) {
      return
    }

    e.preventDefault()
    setIsDragging(true)
  }

  const handleDialogClose = () => {
    setShowDialog(false)
    setIsDragging(false)
  }

  const dayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.startDate)
    return (
      aptDate.getDate() === currentDate.getDate() &&
      aptDate.getMonth() === currentDate.getMonth() &&
      aptDate.getFullYear() === currentDate.getFullYear()
    )
  })

  const allDayAppointments = dayAppointments.filter((apt) => apt.allDay)
  const timedAppointments = dayAppointments.filter((apt) => !apt.allDay)

  return (
    <>
      <div className="flex-1 p-6 flex flex-col gap-4" ref={containerRef}>
        <div className="bg-card rounded-lg border border-border overflow-hidden select-none">
          <div className="border-b border-border px-4 py-3 bg-muted">
            <h3 className="font-semibold text-lg">
              {formatDate(currentDate, 'EEEE, d. MMMM yyyy')}
            </h3>
          </div>

          {allDayAppointments.length > 0 && (
            <div className="border-b border-border px-4 py-3 space-y-0.5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Ganztägig
              </div>
              {allDayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  data-appointment
                  onClick={() => onAppointmentClick(apt)}
                  className="text-sm px-3 py-1.5 rounded text-white font-medium cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{ backgroundColor: apt.color.startsWith('#') ? apt.color : undefined }}
                >
                  {apt.location || apt.title}
                </div>
              ))}
            </div>
          )}

          <ScrollArea className="h-[600px]">
            <div className="relative">
              {hours.map((hour) => {
                const hourAppointments = timedAppointments.filter((apt) => {
                  const aptHour = new Date(apt.startDate).getHours()
                  return aptHour === hour
                })

                return (
                  <div
                    key={hour}
                    onMouseDown={handleMouseDown}
                    className={cn(
                      'flex border-b border-border transition-colors',
                      isDragging && 'bg-accent/20',
                      !isDragging && 'hover:bg-muted/50 cursor-pointer'
                    )}
                  >
                    <div className="w-20 flex-shrink-0 px-3 py-2 text-sm text-muted-foreground font-medium border-r border-border">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 p-2 space-y-0 min-h-[60px]">
                      {hourAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          data-appointment
                          onClick={() => onAppointmentClick(apt)}
                          className="text-sm px-3 py-1.5 rounded text-white font-medium cursor-pointer hover:scale-[1.02] transition-transform"
                          style={{ backgroundColor: apt.color.startsWith('#') ? apt.color : undefined }}
                        >
                          <div className="font-semibold">
                            {apt.location || apt.title}
                          </div>
                          <div className="text-xs opacity-90 mt-0.5">
                            {formatDate(new Date(apt.startDate), 'HH:mm')} -{' '}
                            {formatDate(new Date(apt.endDate), 'HH:mm')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <VehicleLegend />
      </div>

      <MultiDaySelectionDialog
        open={showDialog}
        onClose={handleDialogClose}
        selectedDates={selectedDates}
      />
    </>
  )
}
