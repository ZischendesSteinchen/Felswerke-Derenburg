import { useState, useRef, useEffect } from 'react'
import { Appointment } from '@/lib/types'
import { getMonthDays, formatDate, isToday, isSameMonthAs } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { MultiDaySelectionDialog } from '@/components/MultiDaySelectionDialog'
import { VehicleLegend } from '@/components/VehicleLegend'

interface MonthViewProps {
  currentDate: Date
  appointments: Appointment[]
  onAppointmentClick: (appointment: Appointment) => void
  onDateClick: (date: Date) => void
  isAdmin?: boolean
}

interface MultiDaySpan {
  groupId: string
  appointments: Appointment[]
  startCol: number
  endCol: number
  color: string
  title: string
  week: number
  isFirstWeek: boolean
  isLastWeek: boolean
}

export function MonthView({
  currentDate,
  appointments,
  onAppointmentClick,
  onDateClick,
  isAdmin = false,
}: MonthViewProps) {
  const days = getMonthDays(currentDate)
  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

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

    const newSelectedDates = days.filter(day => {
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
        
        const startIdx = days.findIndex(day => 
          day.getDate() === startDate.getDate() &&
          day.getMonth() === startDate.getMonth() &&
          day.getFullYear() === startDate.getFullYear()
        )
        
        const endIdx = days.findIndex(day => 
          day.getDate() === endDate.getDate() &&
          day.getMonth() === endDate.getMonth() &&
          day.getFullYear() === endDate.getFullYear()
        )

        if (startIdx !== -1 && endIdx !== -1) {
          // Teile den Span auf, wenn er über mehrere Wochen geht
          const startWeek = Math.floor(startIdx / 7)
          const endWeek = Math.floor(endIdx / 7)
          
          for (let week = startWeek; week <= endWeek; week++) {
            const weekStartIdx = week * 7
            const weekEndIdx = weekStartIdx + 6
            
            const spanStartInWeek = Math.max(startIdx, weekStartIdx)
            const spanEndInWeek = Math.min(endIdx, weekEndIdx)
            
            spans.push({
              groupId: `${apt.multiDayGroupId}-week-${week}`,
              appointments: groupAppointments,
              startCol: spanStartInWeek % 7,
              endCol: spanEndInWeek % 7,
              color: apt.color,
              title: apt.equipment || apt.title,
              week: week,
              isFirstWeek: week === startWeek,
              isLastWeek: week === endWeek,
            } as MultiDaySpan & { week: number; isFirstWeek: boolean; isLastWeek: boolean })
          }
        }
      }
    })

    return spans
  }

  const multiDaySpans = getMultiDaySpans()

  const getWeekRows = () => {
    const rows: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7))
    }
    return rows
  }

  const weekRows = getWeekRows()

  const getMaxAppointmentsInWeek = (weekDays: Date[]) => {
    let maxCount = 0
    weekDays.forEach(day => {
      const dayAppointments = getAppointmentsForDate(day)
      const singleDayAppointments = dayAppointments.filter(apt => !apt.multiDayGroupId)
      if (singleDayAppointments.length > maxCount) {
        maxCount = singleDayAppointments.length
      }
    })
    return maxCount
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-6" ref={containerRef}>
        <div className="border border-border rounded-lg overflow-hidden select-none">
          <div className="grid grid-cols-7 w-full">
            {weekDays.map((day, idx) => (
              <div
                key={`weekday-${idx}`}
                className="bg-muted px-3 py-2 text-center text-sm font-medium text-muted-foreground border-b border-r border-border last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {weekRows.map((weekDays, weekIdx) => {
            const maxAppointments = getMaxAppointmentsInWeek(weekDays)
            const minHeight = maxAppointments > 3 ? 120 + (maxAppointments - 3) * 24 : 120

            return (
              <div key={weekIdx} className="relative">
                <div className="grid grid-cols-7 w-full">
                  {weekDays.map((day, dayIdx) => {
                    const globalIdx = weekIdx * 7 + dayIdx
                    const dayAppointments = getAppointmentsForDate(day)
                    const singleDayAppointments = dayAppointments.filter(apt => !apt.multiDayGroupId)
                    const isCurrentMonth = isSameMonthAs(day, currentDate)
                    const isTodayDate = isToday(day)
                    const isSelected = isDateSelected(day)

                    return (
                      <div
                        key={`day-${weekIdx}-${dayIdx}`}
                        onMouseDown={(e) => handleMouseDown(day, e)}
                        onMouseEnter={() => handleMouseEnter(day)}
                        onClick={(e) => {
                          if (!isDragging && !isSelected) {
                            onDateClick(day)
                          }
                        }}
                        className={cn(
                          'bg-card p-2 cursor-pointer transition-colors relative border-b border-r border-border last:border-r-0',
                          !isCurrentMonth && 'bg-muted/30',
                          isSelected && 'bg-primary/20 ring-2 ring-primary ring-inset',
                          !isSelected && 'hover:bg-accent/10'
                        )}
                        style={{ minHeight: `${minHeight}px` }}
                      >
                        <div
                          className={cn(
                            'text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full',
                            isTodayDate && 'bg-accent text-accent-foreground',
                            !isCurrentMonth && 'text-muted-foreground',
                            isSelected && !isTodayDate && 'bg-primary text-primary-foreground'
                          )}
                        >
                          {formatDate(day, 'd')}
                        </div>

                        <div className="space-y-0.5 mt-8">
                          {singleDayAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              data-appointment
                              onClick={(e) => {
                                e.stopPropagation()
                                onAppointmentClick(apt)
                              }}
                              className="text-xs px-2 py-0.5 rounded text-white font-medium truncate cursor-pointer hover:scale-105 transition-transform"
                              style={{ backgroundColor: apt.color.startsWith('#') ? apt.color : undefined }}
                            >
                              {apt.equipment || apt.title}
                            </div>
                          ))}
                        </div>

                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                        )}
                      </div>
                    )
                  })}
                </div>

                {multiDaySpans
                  .filter(span => span.week === weekIdx)
                  .map((span, spanIdx) => {
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
                        className={cn(
                          'absolute text-xs px-2 py-1 text-white font-medium cursor-pointer hover:scale-[1.02] transition-transform z-10',
                          span.isFirstWeek ? 'rounded-l-md' : '',
                          span.isLastWeek ? 'rounded-r-md' : ''
                        )}
                        style={{
                          backgroundColor: span.color.startsWith('#') ? span.color : undefined,
                          left: `calc(${(startCol / 7) * 100}%)`,
                          width: `calc(${(spanWidth / 7) * 100}%)`,
                          top: `${36 + spanIdx * 24}px`,
                          height: '20px',
                        }}
                      >
                        <div className="truncate">{span.title}</div>
                      </div>
                    )
                  })}
              </div>
            )
          })}
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
