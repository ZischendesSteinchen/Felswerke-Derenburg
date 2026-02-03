import { Appointment } from '@/lib/types'
import { getYearMonths, formatDate } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import { VehicleLegend } from '@/components/VehicleLegend'

interface YearViewProps {
  currentDate: Date
  appointments: Appointment[]
  onMonthClick: (date: Date) => void
}

export function YearView({
  currentDate,
  appointments,
  onMonthClick,
}: YearViewProps) {
  const months = getYearMonths(currentDate)

  const getAppointmentsForMonth = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startDate)
      return (
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      )
    }).length
  }

  return (
    <>
      <div className="flex-1 p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {months.map((month) => {
            const appointmentCount = getAppointmentsForMonth(month)
            return (
              <div
                key={month.toISOString()}
                onClick={() => onMonthClick(month)}
                className="bg-card rounded-lg border border-border p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
              >
                <div className="text-lg font-semibold mb-2">
                  {formatDate(month, 'MMMM')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {appointmentCount} {appointmentCount === 1 ? 'Termin' : 'Termine'}
                </div>
                {appointmentCount > 0 && (
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full bg-primary transition-all',
                        appointmentCount > 10 && 'bg-accent'
                      )}
                      style={{ width: `${Math.min((appointmentCount / 20) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <VehicleLegend />
    </>
  )
}
