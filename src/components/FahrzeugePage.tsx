import { useState } from 'react'
import { useVehicles } from '@/hooks/use-database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Vehicle } from '@/lib/types'
import { Truck, Plus, Trash, PencilSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ColorPicker } from '@/components/ColorPicker'

export function FahrzeugePage() {
  const { vehicles, createVehicle, updateVehicle, deleteVehicle: removeVehicle } = useVehicles()
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6'
  })

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3b82f6'
    })
    setEditingVehicle(null)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      name: vehicle.name,
      color: vehicle.color
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein')
      return
    }

    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, {
          name: formData.name,
          color: formData.color
        })
        toast.success('Fahrzeug erfolgreich aktualisiert')
      } else {
        await createVehicle({
          name: formData.name,
          color: formData.color
        })
        toast.success('Fahrzeug erfolgreich erstellt')
      }
      resetForm()
    } catch (error) {
      toast.error('Fehler beim Speichern des Fahrzeugs')
    }
  }

  const handleDelete = async () => {
    if (!deleteVehicle) return

    try {
      await removeVehicle(deleteVehicle.id)
      toast.success('Fahrzeug erfolgreich gelöscht')
      setDeleteVehicle(null)
    } catch (error) {
      toast.error('Fehler beim Löschen des Fahrzeugs')
    }
  }

  return (
    <>
      <div className="p-6 space-y-6 w-full">
        <div>
          <h2 className="text-3xl font-semibold mb-2">Fahrzeuge</h2>
          <p className="text-muted-foreground">
            Verwalten Sie alle Fahrzeuge für die Terminplanung
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-7xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {editingVehicle ? <PencilSimple size={20} weight="bold" /> : <Plus size={20} weight="bold" />}
                {editingVehicle ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug'}
              </CardTitle>
              <CardDescription>
                {editingVehicle ? 'Ändern Sie die Fahrzeugdaten' : 'Fügen Sie ein neues Fahrzeug hinzu'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Kennzeichen</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Kennzeichen eingeben"
                  />
                </div>
                
                <ColorPicker
                  value={formData.color}
                  onChange={(color) => setFormData({ ...formData, color })}
                  label="Farbe"
                />

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">
                    {editingVehicle ? 'Aktualisieren' : 'Erstellen'}
                  </Button>
                  {editingVehicle && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Abbrechen
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck size={20} weight="bold" />
                Fahrzeugliste
              </CardTitle>
              <CardDescription>
                Alle registrierten Fahrzeuge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(!vehicles || vehicles.length === 0) ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Keine Fahrzeuge vorhanden
                  </p>
                ) : (
                  vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg border-2 border-border flex items-center justify-center"
                          style={{ backgroundColor: vehicle.color }}
                        >
                          <Truck size={24} weight="bold" className="text-white drop-shadow-md" />
                        </div>
                        <div>
                          <div className="font-medium">{vehicle.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {vehicle.color.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(vehicle)}
                        >
                          <PencilSimple size={18} weight="bold" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteVehicle(vehicle)}
                        >
                          <Trash size={18} weight="bold" className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!deleteVehicle} onOpenChange={() => setDeleteVehicle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fahrzeug löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie das Fahrzeug "{deleteVehicle?.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
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
    </>
  )
}
