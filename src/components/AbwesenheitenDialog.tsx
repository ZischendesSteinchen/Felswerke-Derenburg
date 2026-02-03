import { useState } from 'react'
import { useAbsences, useUsers } from '@/hooks/use-database'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Plus, CalendarBlank, Warning } from '@phosphor-icons/react'
import { Absence, User } from '@/lib/types'
import { toast } from 'sonner'
import { format, differenceInDays, parse, isWithinInterval } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface AbwesenheitenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: User
}

export function AbwesenheitenDialog({ open, onOpenChange, currentUser }: AbwesenheitenDialogProps) {
  const { absences, createAbsence, setAbsences } = useAbsences()
  const { users } = useUsers()
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [durationType, setDurationType] = useState<'single' | 'multiple'>('single')
  const [newAbsence, setNewAbsence] = useState({
    startDate: '',
    endDate: '',
    absenceType: 'urlaub' as 'urlaub' | 'sonstige',
    customReason: ''
  })
  const [startDateInput, setStartDateInput] = useState('')
  const [endDateInput, setEndDateInput] = useState('')
  const [overlapWarning, setOverlapWarning] = useState<{ show: boolean; overlappingUsers: string[] }>({ show: false, overlappingUsers: [] })

  const userAbsences = (absences || [])
    .filter(absence => absence.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const checkForOverlaps = (startDate: string, endDate: string): string[] => {
    const newStart = new Date(startDate)
    const newEnd = new Date(endDate)
    const overlappingUsers: string[] = []

    const approvedOrPendingAbsences = (absences || []).filter(a => 
      (a.status === 'approved' || a.status === 'pending') && a.userId !== currentUser.id
    )

    for (const absence of approvedOrPendingAbsences) {
      const existingStart = new Date(absence.startDate)
      const existingEnd = new Date(absence.endDate)

      const overlaps = (
        isWithinInterval(newStart, { start: existingStart, end: existingEnd }) ||
        isWithinInterval(newEnd, { start: existingStart, end: existingEnd }) ||
        isWithinInterval(existingStart, { start: newStart, end: newEnd }) ||
        isWithinInterval(existingEnd, { start: newStart, end: newEnd })
      )

      if (overlaps) {
        const user = (users || []).find(u => u.id === absence.userId)
        if (user && !overlappingUsers.includes(user.fullName)) {
          overlappingUsers.push(user.fullName)
        }
      }
    }

    return overlappingUsers
  }

  const handleRequestAbsence = () => {
    if (!newAbsence.startDate) {
      toast.error('Bitte wählen Sie ein Startdatum')
      return
    }

    if (durationType === 'multiple' && !newAbsence.endDate) {
      toast.error('Bitte wählen Sie ein Enddatum')
      return
    }

    if (newAbsence.absenceType === 'sonstige' && !newAbsence.customReason.trim()) {
      toast.error('Bitte geben Sie einen Grund an')
      return
    }

    const endDate = durationType === 'single' ? newAbsence.startDate : newAbsence.endDate

    const overlappingUsers = checkForOverlaps(newAbsence.startDate, endDate)

    if (overlappingUsers.length > 0) {
      setOverlapWarning({ show: true, overlappingUsers })
      return
    }

    createAbsence(false)
  }

  const createAbsence = (requiresApproval: boolean) => {
    const endDate = durationType === 'single' ? newAbsence.startDate : newAbsence.endDate

    const absence: Absence = {
      id: `absence_${Date.now()}`,
      userId: currentUser.id,
      startDate: newAbsence.startDate,
      endDate: endDate,
      reason: newAbsence.absenceType === 'urlaub' ? 'Urlaub' : newAbsence.customReason,
      absenceType: newAbsence.absenceType,
      customReason: newAbsence.absenceType === 'sonstige' ? newAbsence.customReason : undefined,
      status: requiresApproval ? 'pending' : 'approved',
      requiresApproval,
      createdAt: new Date().toISOString()
    }

    setAbsences(current => [...(current || []), absence])
    
    setNewAbsence({
      startDate: '',
      endDate: '',
      absenceType: 'urlaub',
      customReason: ''
    })
    setStartDateInput('')
    setEndDateInput('')
    setDurationType('single')
    setShowRequestForm(false)
    setOverlapWarning({ show: false, overlappingUsers: [] })
    
    if (requiresApproval) {
      toast.success('Abwesenheit beantragt und an Administratoren zur Genehmigung gesendet')
    } else {
      toast.success('Abwesenheit wurde automatisch genehmigt')
    }
  }

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      const year = localDate.getFullYear()
      const month = String(localDate.getMonth() + 1).padStart(2, '0')
      const day = String(localDate.getDate()).padStart(2, '0')
      const formattedISO = `${year}-${month}-${day}`
      const formattedDisplay = `${day}.${month}.${year}`
      setNewAbsence({ ...newAbsence, startDate: formattedISO })
      setStartDateInput(formattedDisplay)
    } else {
      setNewAbsence({ ...newAbsence, startDate: '' })
      setStartDateInput('')
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      const year = localDate.getFullYear()
      const month = String(localDate.getMonth() + 1).padStart(2, '0')
      const day = String(localDate.getDate()).padStart(2, '0')
      const formattedISO = `${year}-${month}-${day}`
      const formattedDisplay = `${day}.${month}.${year}`
      setNewAbsence({ ...newAbsence, endDate: formattedISO })
      setEndDateInput(formattedDisplay)
    } else {
      setNewAbsence({ ...newAbsence, endDate: '' })
      setEndDateInput('')
    }
  }

  const handleStartDateInputChange = (value: string) => {
    setStartDateInput(value)
    
    if (value.length === 10) {
      try {
        const parts = value.split('.')
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10)
          const month = parseInt(parts[1], 10)
          const year = parseInt(parts[2], 10)
          
          if (!isNaN(day) && !isNaN(month) && !isNaN(year) && 
              day >= 1 && day <= 31 && month >= 1 && month <= 12 && year > 1900) {
            const formattedISO = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            setNewAbsence({ ...newAbsence, startDate: formattedISO })
          }
        }
      } catch (e) {
        // Invalid date format
      }
    }
  }

  const handleEndDateInputChange = (value: string) => {
    setEndDateInput(value)
    
    if (value.length === 10) {
      try {
        const parts = value.split('.')
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10)
          const month = parseInt(parts[1], 10)
          const year = parseInt(parts[2], 10)
          
          if (!isNaN(day) && !isNaN(month) && !isNaN(year) && 
              day >= 1 && day <= 31 && month >= 1 && month <= 12 && year > 1900) {
            const formattedISO = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            setNewAbsence({ ...newAbsence, endDate: formattedISO })
          }
        }
      } catch (e) {
        // Invalid date format
      }
    }
  }

  const getStatusBadge = (status: Absence['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Ausstehend</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Genehmigt</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Abgelehnt</Badge>
    }
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (startDate === endDate) {
      return format(start, 'd. MMMM yyyy', { locale: de })
    }
    
    return `${format(start, 'd. MMM', { locale: de })} - ${format(end, 'd. MMM yyyy', { locale: de })}`
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = differenceInDays(end, start) + 1
    
    if (days === 1) {
      return '1 Tag'
    }
    return `${days} Tage`
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Abwesenheiten</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {!showRequestForm ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => setShowRequestForm(true)} className="gap-2">
                    <Plus size={18} weight="bold" />
                    Abwesenheit beantragen
                  </Button>
                </div>

                {userAbsences.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Keine Abwesenheiten vorhanden</p>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">GRUND</TableHead>
                          <TableHead className="font-semibold">DAUER</TableHead>
                          <TableHead className="font-semibold">GÜLTIGKEIT</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userAbsences.map((absence) => (
                          <TableRow key={absence.id}>
                            <TableCell className="font-medium">
                              {absence.reason}
                              {absence.requiresApproval && (
                                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-300">
                                  Genehmigung erforderlich
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {formatDateRange(absence.startDate, absence.endDate)}
                              <span className="text-muted-foreground ml-2">
                                ({calculateDuration(absence.startDate, absence.endDate)})
                              </span>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(absence.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <h3 className="text-lg font-semibold">Neue Abwesenheit beantragen</h3>
                
                <div className="space-y-2">
                  <Label>Abwesenheitsgrund</Label>
                  <Select
                    value={newAbsence.absenceType}
                    onValueChange={(value: 'urlaub' | 'sonstige') => 
                      setNewAbsence({ ...newAbsence, absenceType: value, customReason: '' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urlaub">Urlaub</SelectItem>
                      <SelectItem value="sonstige">Sonstige</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newAbsence.absenceType === 'sonstige' && (
                  <div className="space-y-2">
                    <Label htmlFor="customReason">Grund angeben *</Label>
                    <Input
                      id="customReason"
                      value={newAbsence.customReason}
                      onChange={(e) => setNewAbsence({ ...newAbsence, customReason: e.target.value })}
                      placeholder="Bitte geben Sie den Grund an..."
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Dauer</Label>
                  <RadioGroup value={durationType} onValueChange={(value) => setDurationType(value as 'single' | 'multiple')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single" className="font-normal cursor-pointer">1 Tag</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multiple" id="multiple" />
                      <Label htmlFor="multiple" className="font-normal cursor-pointer">Länger als 1 Tag</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">{durationType === 'single' ? 'Datum' : 'Von'} *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Input
                            id="startDate"
                            value={startDateInput}
                            onChange={(e) => handleStartDateInputChange(e.target.value)}
                            placeholder="TT.MM.JJJJ"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          >
                            <CalendarBlank className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newAbsence.startDate ? new Date(newAbsence.startDate) : undefined}
                          onSelect={handleStartDateChange}
                          locale={de}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {durationType === 'multiple' && (
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Bis *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="relative">
                            <Input
                              id="endDate"
                              value={endDateInput}
                              onChange={(e) => handleEndDateInputChange(e.target.value)}
                              placeholder="TT.MM.JJJJ"
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            >
                              <CalendarBlank className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newAbsence.endDate ? new Date(newAbsence.endDate) : undefined}
                            onSelect={handleEndDateChange}
                            disabled={(date) => {
                              if (!newAbsence.startDate) return false
                              return date < new Date(newAbsence.startDate)
                            }}
                            locale={de}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRequestForm(false)
                      setNewAbsence({ startDate: '', endDate: '', absenceType: 'urlaub', customReason: '' })
                      setStartDateInput('')
                      setEndDateInput('')
                      setDurationType('single')
                    }}
                  >
                    Abbrechen
                  </Button>
                  <Button onClick={handleRequestAbsence}>
                    Beantragen
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={overlapWarning.show} onOpenChange={(open) => !open && setOverlapWarning({ show: false, overlappingUsers: [] })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Warning size={24} weight="fill" className="text-amber-500" />
              Überschneidung erkannt
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Die beantragte Abwesenheit überschneidet sich mit folgenden Mitarbeitern:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {overlapWarning.overlappingUsers.map((userName, index) => (
                  <li key={index} className="font-medium text-foreground">{userName}</li>
                ))}
              </ul>
              <p className="pt-2">
                Wenn Sie fortfahren, wird diese Abwesenheit zur Genehmigung an die Administratoren gesendet.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOverlapWarning({ show: false, overlappingUsers: [] })}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => createAbsence(true)}>
              Fortfahren und Genehmigung anfordern
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
