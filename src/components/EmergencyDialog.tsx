import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useEmergencies } from '@/hooks/use-database'
import { toast } from 'sonner'

interface EmergencyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: { fullName: string }
}

interface Emergency {
  id: string
  createdBy: string
  createdAt: string
  information: string
}

export function EmergencyDialog({ open, onOpenChange, currentUser }: EmergencyDialogProps) {
  const { emergencies, createEmergency } = useEmergencies()
  const [information, setInformation] = useState('')

  const handleSave = async () => {
    if (!information.trim()) {
      toast.error('Bitte geben Sie Informationen ein')
      return
    }

    try {
      await createEmergency({
        title: 'Notfall',
        description: information.trim(),
        priority: 'high',
        status: 'open'
      })
      toast.success('Notfall gespeichert')
      setInformation('')
      onOpenChange(false)
    } catch (error) {
      toast.error('Fehler beim Speichern des Notfalls')
    }
  }

  const handleCancel = () => {
    setInformation('')
    onOpenChange(false)
  }

  const currentDate = new Date().toLocaleDateString('de-DE')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Einsatz</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Notfall</h2>
            <p className="text-sm text-foreground">
              Angelegt von: {currentUser.fullName} Datum: {currentDate}
            </p>
            <p className="text-sm text-foreground mt-1">
              Geben Sie hier schnell die wichtigsten Daten zum Notfall an und dann los!
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Informationen:
            </label>
            <Textarea
              value={information}
              onChange={(e) => setInformation(e.target.value)}
              placeholder=""
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              Speichern
            </Button>
            <Button onClick={handleCancel} variant="secondary">
              Abbruch
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
