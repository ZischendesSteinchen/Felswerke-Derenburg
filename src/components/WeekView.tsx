import { useState, useRef, useEffect } from 'react'
import { Appointment } from '@/lib/types'
import { getWeekDays, formatDate, isToday } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { MultiDaySelectionDialog } from '@/components/MultiDaySelectionDialog'
import { VehicleLegend } from '@/components/VehicleLegend'

interface WeekViewProps {
  currentDate: Date
  appointments: Appointment[]
  onAppointmentClick: (appointment: Appointment) => void
  isAdmin?: boolean
}

interface MultiDaySpan {
  groupId: string
  appointments: Appointment[]
  startCol: number
  endCol: number
  color: string
  title: string
}

export function WeekView({
  currentDate,
  appointments,
  onAppointmentClick,
  isAdmin = false,
}: WeekViewProps) {
  const weekDays = getWeekDays(currentDate)

  const [isDragging, setIsDragging] = useState(false)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging && selectedDates.length > 0) {
        setIsDragging(false)
        setShowDialog(true)
      } else {
        setIsDragging(false)
        setSelectedDates([])
        setDragStartDate(null)
      }
    }

    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp)
      return () => document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, selectedDates])

  const handleMouseDown = (date: Date, e: React.MouseEvent) => {
    if (!isAdmin) return
    
    const target = e.target as HTMLElement
    if (target.closest('[data-appointment]')) {
      return
    }

    e.preventDefault()
    setIsDragging(true)
    setDragStartDate(date)
    setSelectedDates([date])
  }

  const handleMouseEnter = (date: Date) => {
    if (!isDragging || !dragStartDate) return

    const startTime = dragStartDate.getTime()
    const currentTime = date.getTime()
    const minTime = Math.min(startTime, currentTime)
    const maxTime = Math.max(startTime, currentTime)

    const newSelectedDates = weekDays.filter(day => {
      const dayTime = day.getTime()
      return dayTime >= minTime && dayTime <= maxTime
    })

    setSelectedDates(newSelectedDates)
  }

  const handleDialogClose = () => {
    setShowDialog(false)
    setSelectedDates([])
    setDragStartDate(null)
  }

  const isDateSelected = (date: Date) => {
    return selectedDates.some(
      selectedDate =>
        selectedDate.getDate() === date.getDate() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getFullYear() === date.getFullYear()
    )
  }

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startDate)
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getMultiDaySpans = (): MultiDaySpan[] => {
    const spans: MultiDaySpan[] = []
    const processedGroups = new Set<string>()

    appointments.forEach(apt => {
      if (apt.multiDayGroupId && !processedGroups.has(apt.multiDayGroupId)) {
        processedGroups.add(apt.multiDayGroupId)
        
        const groupAppointments = appointments.filter(
          a => a.multiDayGroupId === apt.multiDayGroupId
        ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

        const firstApt = groupAppointments[0]
        const lastApt = groupAppointments[groupAppointments.length - 1]
        
        const startDate = new Date(firstApt.startDate)
        const endDate = new Date(lastApt.startDate)
        
        const startIdx = weekDays.findIndex(day => 
          day.getDate() === startDate.getDate() &&
          day.getMonth() === startDate.getMonth() &&
          day.getFullYear() === startDate.getFullYear()
        )
        
        const endIdx = weekDays.findIndex(day => 
          day.getDate() === endDate.getDate() &&
          day.getMonth() === endDate.getMonth() &&
          day.getFullYear() === endDate.getFullYear()
        )

        if (startIdx !== -1 && endIdx !== -1 && startIdx !== endIdx) {
          spans.push({
            groupId: apt.multiDayGroupId,
            appointments: groupAppointments,
            startCol: startIdx,
            endCol: endIdx,
            color: apt.color,
            title: apt.location || apt.title
          })
        }
      }
    })

    return spans
  }

  const multiDaySpans = getMultiDaySpans()

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-6 overflow-x-auto" ref={containerRef}>
        <div className="bg-card rounded-lg border border-border overflow-hidden min-w-[800px] select-none">
          <div className="grid grid-cols-7 gap-px bg-border">
            {weekDays.map((day) => {
              const isTodayDate = isToday(day)
              const isSelected = isDateSelected(day)
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'bg-card px-3 py-3 text-center transition-colors',
                    isTodayDate && 'bg-accent/10',
                    isSelected && 'bg-accent/30 ring-2 ring-accent ring-inset'
                  )}
                >
                  <div className="text-sm font-medium text-muted-foreground">
                    {formatDate(day, 'EEE')}
                  </div>
                  <div
                    className={cn(
                      'text-2xl font-semibold mt-1',
                      isTodayDate && 'text-accent',
                      isSelected && 'text-accent-foreground'
                    )}
                  >
                    {formatDate(day, 'd')}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="relative">
            <div className="grid grid-cols-7 gap-px bg-border min-h-[500px]">
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDate(day)
                const singleDayAppointments = dayAppointments.filter(apt => !apt.multiDayGroupId)
                const isSelected = isDateSelected(day)
                return (
                  <div
                    key={day.toISOString()}
                    onMouseDown={(e) => handleMouseDown(day, e)}
                    onMouseEnter={() => handleMouseEnter(day)}
                    className={cn(
                      'bg-card p-2 cursor-pointer transition-colors relative',
                      isSelected && 'bg-accent/30',
                      !isSelected && 'hover:bg-muted/50'
                    )}
                  >
                    <div className="space-y-0 mt-8">
                      {singleDayAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          data-appointment
                          onClick={() => onAppointmentClick(apt)}
                          className="text-xs px-2 py-1 rounded text-white font-medium cursor-pointer hover:scale-105 transition-transform"
                          style={{ backgroundColor: apt.color.startsWith('#') ? apt.color : undefined }}
                        >
                          <div className="font-semibold mb-0.5">
                            {apt.location || apt.title}
                          </div>
                          {!apt.allDay && (
                            <div className="text-[10px] opacity-90">
                              {formatDate(new Date(apt.startDate), 'HH:mm')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 bg-accent/10 pointer-events-none" />
                    )}
                  </div>
                )
              })}
            </div>

            {multiDaySpans.map((span, spanIdx) => {
              const startCol = span.startCol
              const endCol = span.endCol
              const spanWidth = endCol - startCol + 1
              
              return (
                <div
                  key={span.groupId}
                  data-appointment
                  onClick={(e) => {
                    e.stopPropagation()
                    onAppointmentClick(span.appointments[0])
                  }}
                  className="absolute text-xs px-2 py-1 text-white font-medium cursor-pointer hover:scale-[1.02] transition-transform z-10 rounded-md"
                  style={{
                    backgroundColor: span.color.startsWith('#') ? span.color : undefined,
                    left: `calc(${(startCol / 7) * 100}%)`,
                    width: `calc(${(spanWidth / 7) * 100}% - 2px)`,
                    top: `${8 + spanIdx * 24}px`,
                    height: '20px',
                  }}
                >
                  <div className="truncate">{span.title}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <VehicleLegend />

      <MultiDaySelectionDialog
        open={showDialog}
        onClose={handleDialogClose}
        selectedDates={selectedDates}
      />
    </div>
  )
}
