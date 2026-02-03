import { useAbsences, useUsers } from '@/hooks/use-database'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Check, X } from '@phosphor-icons/react'
import { Absence, User } from '@/lib/types'
import { toast } from 'sonner'
import { format, differenceInDays } from 'date-fns'
import { de } from 'date-fns/locale'

interface AbwesenheitsantraegeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AbwesenheitsantraegeDialog({ open, onOpenChange }: AbwesenheitsantraegeDialogProps) {
  const { absences, approveAbsence, rejectAbsence } = useAbsences()
  const { users } = useUsers()

  const pendingRequests = (absences || [])
    .filter(absence => absence.status === 'pending')
    .sort((a, b) => {
      if (a.requiresApproval && !b.requiresApproval) return -1
      if (!a.requiresApproval && b.requiresApproval) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const getUserName = (userId: string) => {
    const user = (users || []).find(u => u.id === userId)
    return user?.fullName || 'Unbekannt'
  }

  const handleApprove = async (absenceId: string) => {
    try {
      await approveAbsence(absenceId)
      toast.success('Abwesenheit genehmigt')
    } catch (error) {
      toast.error('Fehler beim Genehmigen der Abwesenheit')
    }
  }

  const handleReject = async (absenceId: string) => {
    try {
      await rejectAbsence(absenceId)
      toast.info('Abwesenheit abgelehnt')
    } catch (error) {
      toast.error('Fehler beim Ablehnen der Abwesenheit')
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Abwesenheitsanträge</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Keine offenen Anträge vorhanden</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">MITARBEITER</TableHead>
                    <TableHead className="font-semibold">GRUND</TableHead>
                    <TableHead className="font-semibold">DAUER</TableHead>
                    <TableHead className="font-semibold">STATUS</TableHead>
                    <TableHead className="font-semibold text-right">AKTIONEN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((absence) => (
                    <TableRow key={absence.id}>
                      <TableCell className="font-medium">
                        {getUserName(absence.userId)}
                      </TableCell>
                      <TableCell>
                        {absence.reason}
                      </TableCell>
                      <TableCell>
                        {formatDateRange(absence.startDate, absence.endDate)}
                        <span className="text-muted-foreground ml-2">
                          ({calculateDuration(absence.startDate, absence.endDate)})
                        </span>
                      </TableCell>
                      <TableCell>
                        {absence.requiresApproval ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            Genehmigung erforderlich
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            Ausstehend
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 border-green-300 text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(absence.id)}
                          >
                            <Check size={16} weight="bold" />
                            Genehmigen
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 border-red-300 text-red-700 hover:bg-red-50"
                            onClick={() => handleReject(absence.id)}
                          >
                            <X size={16} weight="bold" />
                            Ablehnen
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
