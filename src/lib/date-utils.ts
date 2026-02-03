import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear,
  endOfYear,
  eachDayOfInterval, 
  isSameDay,
  isSameMonth,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfDay,
  parseISO
} from 'date-fns'
import { de } from 'date-fns/locale'

export const formatDate = (date: Date, formatStr: string) => {
  return format(date, formatStr, { locale: de })
}

export const getWeekDays = (date: Date) => {
  const start = startOfWeek(date, { locale: de, weekStartsOn: 1 })
  const end = endOfWeek(date, { locale: de, weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export const getMonthDays = (date: Date) => {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  const firstDay = startOfWeek(start, { locale: de, weekStartsOn: 1 })
  const lastDay = endOfWeek(end, { locale: de, weekStartsOn: 1 })
  return eachDayOfInterval({ start: firstDay, end: lastDay })
}

export const getYearMonths = (date: Date) => {
  const months: Date[] = []
  for (let i = 0; i < 12; i++) {
    months.push(addMonths(startOfYear(date), i))
  }
  return months
}

export const navigateDate = (date: Date, direction: 'prev' | 'next', view: 'day' | 'week' | 'month' | 'year'): Date => {
  const multiplier = direction === 'prev' ? -1 : 1
  
  switch (view) {
    case 'day':
      return addDays(date, multiplier)
    case 'week':
      return addWeeks(date, multiplier)
    case 'month':
      return addMonths(date, multiplier)
    case 'year':
      return addYears(date, multiplier)
    default:
      return date
  }
}

export const isToday = (date: Date) => {
  return isSameDay(date, new Date())
}

export const isSameMonthAs = (date: Date, compareDate: Date) => {
  return isSameMonth(date, compareDate)
}

export const parseDate = (dateStr: string) => {
  return parseISO(dateStr)
}

export const toISODate = (date: Date) => {
  return startOfDay(date).toISOString()
}
