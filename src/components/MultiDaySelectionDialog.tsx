import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { useAppointments, useUsers, useVehicles } from '@/hooks/use-database'
import { Appointment, User, Vehicle } from '@/lib/types'
import { formatDate } from '@/lib/date-utils'
import { toast } from 'sonner'
import { CaretDown, CaretRight, User as UserIcon, Truck, Check, Note } from '@phosphor-icons/react'

interface MultiDaySelectionDialogProps {
  open: boolean
  onClose: () => void
  selectedDates: Date[]
}

interface DayConfig {
  date: Date
  dateString: string
  allDay: boolean
  startTime: string
  endTime: string
}

interface DateRange {
  startDate: Date
  endDate: Date
  days: DayConfig[]
}

export function MultiDaySelectionDialog({
  open,
  onClose,
  selectedDates,
}: MultiDaySelectionDialogProps) {
  const { appointments, createManyAppointments } = useAppointments()
  const { users } = useUsers()
  const { vehicles } = useVehicles()

  const [selectedAuftrag, setSelectedAuftrag] = useState<string>('')
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [notes, setNotes] = useState<string>('')
  const [showWarning, setShowWarning] = useState(false)
  const [dayConfigs, setDayConfigs] = useState<DayConfig[]>(
    selectedDates.map(date => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return {
        date,
        dateString: `${year}-${month}-${day}`,
        allDay: true,
        startTime: '08:00',
        endTime: '16:00'
      }
    })
  )
  const [openRanges, setOpenRanges] = useState<number[]>([])
  const [openWorkersDropdown, setOpenWorkersDropdown] = useState(false)
  const [openVehiclesDropdown, setOpenVehiclesDropdown] = useState(false)

  const dateRanges = useMemo(() => {
    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime())
    const ranges: DateRange[] = []
    
    if (sortedDates.length === 0) return ranges
    
    let currentRange: DateRange = {
      startDate: sortedDates[0],
      endDate: sortedDates[0],
      days: [dayConfigs.find(c => c.date.getTime() === sortedDates[0].getTime()) || {
        date: sortedDates[0],
        dateString: sortedDates[0].toISOString().split('T')[0],
        allDay: true,
        startTime: '08:00',
        endTime: '16:00'
      }]
    }
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1]
      const currDate = sortedDates[i]
      const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (dayDiff === 1) {
        currentRange.endDate = currDate
        const dayConfig = dayConfigs.find(c => c.date.getTime() === currDate.getTime()) || {
          date: currDate,
          dateString: currDate.toISOString().split('T')[0],
          allDay: true,
          startTime: '08:00',
          endTime: '16:00'
        }
        currentRange.days.push(dayConfig)
      } else {
        ranges.push(currentRange)
        currentRange = {
          startDate: currDate,
          endDate: currDate,
          days: [dayConfigs.find(c => c.date.getTime() === currDate.getTime()) || {
            date: currDate,
            dateString: currDate.toISOString().split('T')[0],
            allDay: true,
            startTime: '08:00',
            endTime: '16:00'
          }]
        }
      }
    }
    
    ranges.push(currentRange)
    return ranges
  }, [selectedDates, dayConfigs])

  useEffect(() => {
    if (open) {
      const newDayConfigs = selectedDates.map(date => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return {
          date,
          dateString: `${year}-${month}-${day}`,
          allDay: true,
          startTime: '08:00',
          endTime: '16:00'
        }
      })
      setDayConfigs(newDayConfigs)
      
      if (selectedDates.length > 1) {
        setOpenRanges([])
      }
    }
  }, [open, selectedDates])

  const handleWorkerToggle = (workerId: string) => {
    setSelectedWorkers(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    )
  }

  const handleVehicleToggle = (vehicleId: string) => {
    setSelectedVehicles(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    )
  }

  const handleRangeToggle = (index: number) => {
    setOpenRanges(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const handleDateChange = (dateToUpdate: Date, newDateString: string) => {
    setDayConfigs(prev =>
      prev.map(config =>
        config.date.getTime() === dateToUpdate.getTime()
          ? { ...config, dateString: newDateString }
          : config
      )
    )
  }

  const handleAllDayToggle = (dateToUpdate: Date, checked: boolean) => {
    setDayConfigs(prev =>
      prev.map(config =>
        config.date.getTime() === dateToUpdate.getTime()
          ? { ...config, allDay: checked }
          : config
      )
    )
  }

  const handleTimeChange = (dateToUpdate: Date, field: 'startTime' | 'endTime', value: string) => {
    setDayConfigs(prev =>
      prev.map(config =>
        config.date.getTime() === dateToUpdate.getTime()
          ? { ...config, [field]: value }
          : config
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const hasEmptyFields = !selectedAuftrag || selectedWorkers.length === 0 || selectedVehicles.length === 0

    if (hasEmptyFields) {
      setShowWarning(true)
      return
    }

    createAppointments()
  }

  const createAppointments = async () => {
    const baseTimestamp = Date.now()
    const jobGroupId = `job-${baseTimestamp}-${Math.random().toString(36).substr(2, 9)}`
    const newAppointments: Omit<Appointment, 'id'>[] = []
    
    selectedVehicles.forEach((vehicleId, vehicleIndex) => {
      const vehicle = (vehicles || []).find(v => v.id === vehicleId)
      const vehicleColor = vehicle?.color || '#3b82f6'
      
      const groupId = `group-${baseTimestamp}-${vehicleIndex}-${Math.random().toString(36).substr(2, 9)}`
      const isMultiDay = dayConfigs.length > 1
      
      dayConfigs.forEach((config, dayIndex) => {
        const [year, month, day] = config.dateString.split('-').map(Number)
        
        let startDateStr: string
        let endDateStr: string

        if (config.allDay) {
          // Für ganztägige Termine: nur das Datum ohne Zeit
          startDateStr = config.dateString
          endDateStr = config.dateString
        } else {
          // Für Termine mit Zeit: ISO String mit Zeit
          const [startHour, startMinute] = config.startTime.split(':').map(Number)
          const [endHour, endMinute] = config.endTime.split(':').map(Number)
          const startDate = new Date(year, month - 1, day, startHour, startMinute)
          const endDate = new Date(year, month - 1, day, endHour, endMinute)
          startDateStr = startDate.toISOString()
          endDateStr = endDate.toISOString()
        }

        newAppointments.push({
          title: selectedAuftrag || 'Ohne Auftrag',
          location: selectedAuftrag || 'Ohne Auftrag',
          address: '',
          customer: '',
          workers: selectedWorkers,
          equipment: vehicle?.name || 'Unbekanntes Fahrzeug',
          notes: notes,
          startDate: startDateStr,
          endDate: endDateStr,
          color: vehicleColor,
          allDay: config.allDay,
          multiDayGroupId: isMultiDay ? groupId : undefined,
          isFirstDay: isMultiDay && dayIndex === 0,
          isLastDay: isMultiDay && dayIndex === dayConfigs.length - 1,
          jobGroupId: jobGroupId,
        })
      })
    })

    try {
      await createManyAppointments(newAppointments)
      
      const totalTermine = newAppointments.length
      const fahrzeugCount = selectedVehicles.length
      toast.success(`${totalTermine} Termin${totalTermine > 1 ? 'e' : ''} für ${fahrzeugCount} Fahrzeug${fahrzeugCount > 1 ? 'e' : ''} erstellt`)
      
      setTimeout(() => {
        handleClose()
      }, 100)
    } catch (error) {
      console.error('Fehler beim Erstellen der Termine:', error)
      toast.error('Fehler beim Erstellen der Termine')
    }
  }

  const handleClose = () => {
    setSelectedAuftrag('')
    setSelectedWorkers([])
    setSelectedVehicles([])
    setNotes('')
    setShowWarning(false)
    setDayConfigs(
      selectedDates.map(date => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return {
          date,
          dateString: `${year}-${month}-${day}`,
          allDay: true,
          startTime: '08:00',
          endTime: '16:00'
        }
      })
    )
    setOpenRanges([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Neuer Termin</DialogTitle>
          <DialogDescription>
            Termin für {selectedDates.length} ausgewählte{selectedDates.length > 1 ? ' Tage' : 'n Tag'} erstellen
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Button type="button" className="w-full" variant="default">
              + Auftrag hinzufügen
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <UserIcon weight="bold" />
              Mitarbeiter
            </Label>
            <Popover open={openWorkersDropdown} onOpenChange={setOpenWorkersDropdown}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  <span className="truncate">
                    {selectedWorkers.length === 0
                      ? 'Mitarbeiter auswählen'
                      : (users || [])
                          .filter(u => selectedWorkers.includes(u.id))
                          .map(u => u.fullName)
                          .join(', ')}
                  </span>
                  <CaretDown size={16} weight="bold" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="max-h-60 overflow-y-auto p-2">
                  {(users || []).map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleWorkerToggle(user.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                        selectedWorkers.includes(user.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-blue-100'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedWorkers.includes(user.id)
                            ? 'border-primary-foreground bg-primary-foreground'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedWorkers.includes(user.id) && (
                          <Check size={12} weight="bold" className="text-primary" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{user.fullName}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Truck weight="bold" />
              Fahrzeug
            </Label>
            <Popover open={openVehiclesDropdown} onOpenChange={setOpenVehiclesDropdown}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  <span className="truncate">
                    {selectedVehicles.length === 0
                      ? 'Fahrzeuge auswählen'
                      : (vehicles || [])
                          .filter(v => selectedVehicles.includes(v.id))
                          .map(v => v.name)
                          .join(', ')}
                  </span>
                  <CaretDown size={16} weight="bold" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="max-h-60 overflow-y-auto p-2">
                  {(vehicles || []).map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => handleVehicleToggle(vehicle.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                        selectedVehicles.includes(vehicle.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-blue-100'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedVehicles.includes(vehicle.id)
                            ? 'border-primary-foreground bg-primary-foreground'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedVehicles.includes(vehicle.id) && (
                          <Check size={12} weight="bold" className="text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: vehicle.color }}
                        />
                        <span className="text-sm font-medium">{vehicle.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="notes">
              <Note weight="bold" />
              Notizen
            </Label>
            <Textarea
              id="notes"
              placeholder="Notizen eingeben..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Tage</Label>
            <div className="space-y-2">
              {dateRanges.map((range, rangeIndex) => {
                const isOpen = openRanges.includes(rangeIndex)
                const isSingleDay = range.startDate.getTime() === range.endDate.getTime()
                
                return (
                  <Collapsible
                    key={rangeIndex}
                    open={isOpen}
                    onOpenChange={() => handleRangeToggle(rangeIndex)}
                  >
                    <div className="border border-border rounded-lg overflow-hidden">
                      <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between bg-muted hover:bg-blue-100 transition-colors">
                        <div className="flex items-center gap-3">
                          {isOpen ? (
                            <CaretDown weight="bold" size={16} />
                          ) : (
                            <CaretRight weight="bold" size={16} />
                          )}
                          <span className="font-medium text-sm">
                            {isSingleDay
                              ? formatDate(range.startDate, 'dd.MM.yyyy EEEE')
                              : `${formatDate(range.startDate, 'dd.MM.yyyy')} - ${formatDate(range.endDate, 'dd.MM.yyyy')}`}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {range.days.every(d => d.allDay)
                            ? 'Ganztägig'
                            : range.days.some(d => !d.allDay)
                            ? 'Zeitangaben'
                            : 'Ganztägig'}
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 space-y-3 bg-card">
                          {range.days.map((config) => (
                            <div key={config.date.getTime()} className="space-y-3 pb-3 border-b last:border-b-0 last:pb-0">
                              <div className="font-medium text-sm text-muted-foreground">
                                {formatDate(config.date, 'EEEE, dd.MM.yyyy')}
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`date-${config.date.getTime()}`} className="text-sm">Datum</Label>
                                <Input
                                  id={`date-${config.date.getTime()}`}
                                  type="date"
                                  value={config.dateString}
                                  onChange={(e) => handleDateChange(config.date, e.target.value)}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between border border-border rounded-lg p-3">
                                <Label htmlFor={`all-day-${config.date.getTime()}`} className="cursor-pointer text-sm">
                                  Ganztägig
                                </Label>
                                <Switch
                                  id={`all-day-${config.date.getTime()}`}
                                  checked={config.allDay}
                                  onCheckedChange={(checked) => handleAllDayToggle(config.date, checked)}
                                />
                              </div>

                              {!config.allDay && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`start-time-${config.date.getTime()}`} className="text-sm">
                                      Startzeit
                                    </Label>
                                    <Input
                                      id={`start-time-${config.date.getTime()}`}
                                      type="time"
                                      value={config.startTime}
                                      onChange={(e) => handleTimeChange(config.date, 'startTime', e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`end-time-${config.date.getTime()}`} className="text-sm">
                                      Endzeit
                                    </Label>
                                    <Input
                                      id={`end-time-${config.date.getTime()}`}
                                      type="time"
                                      value={config.endTime}
                                      onChange={(e) => handleTimeChange(config.date, 'endTime', e.target.value)}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" className="flex-1">
              {selectedDates.length} Termin{selectedDates.length > 1 ? 'e' : ''} erstellen
            </Button>
          </div>
        </form>
      </DialogContent>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unvollständige Angaben</AlertDialogTitle>
            <AlertDialogDescription>
              Mindestens ein Feld ist nicht ausgefüllt. Möchten Sie trotzdem fortfahren?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={createAppointments}>
              Trotzdem erstellen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
