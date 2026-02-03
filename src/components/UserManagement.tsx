import { useState } from 'react'
import { useUsers } from '@/hooks/use-database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserCircle, Trash, PencilSimple, UserPlus, Users } from '@phosphor-icons/react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { User, UserRole } from '@/lib/types'
import { toast } from 'sonner'

interface UserManagementProps {
  standalone?: boolean
}

export function UserManagement({ standalone = false }: UserManagementProps) {
  const { users, createUser, updateUser, deleteUser: removeUser } = useUsers()
  const [isOpen, setIsOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'Mitarbeiter' as UserRole
  })

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      fullName: '',
      role: 'Mitarbeiter'
    })
    setEditingUser(null)
    setIsOpen(false)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: user.password,
      fullName: user.fullName,
      role: user.role
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username.trim() || !formData.password.trim() || !formData.fullName.trim()) {
      toast.error('Bitte füllen Sie alle Felder aus')
      return
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role
        })
        toast.success('Benutzer erfolgreich aktualisiert')
      } else {
        const existingUser = (users || []).find((u) => u.username === formData.username)
        if (existingUser) {
          toast.error('Benutzername existiert bereits')
          return
        }

        await createUser({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role
        })
        toast.success('Benutzer erfolgreich erstellt')
      }
      resetForm()
    } catch (error) {
      toast.error('Fehler beim Speichern des Benutzers')
    }
  }

  const handleDelete = async () => {
    if (!deleteUser) return

    try {
      await removeUser(deleteUser.id)
      toast.success('Benutzer erfolgreich gelöscht')
      setDeleteUser(null)
    } catch (error) {
      toast.error('Fehler beim Löschen des Benutzers')
    }
  }

  const userManagementContent = (
    <div className="grid md:grid-cols-2 gap-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {editingUser ? <PencilSimple size={20} weight="bold" /> : <UserPlus size={20} weight="bold" />}
            {editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
          </CardTitle>
          <CardDescription>
            {editingUser ? 'Ändern Sie die Benutzerdaten' : 'Erstellen Sie einen neuen Benutzer'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Vollständiger Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Vollständigen Namen eingeben"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Benutzername</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Benutzername eingeben"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Passwort eingeben"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rolle</Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mitarbeiter">Mitarbeiter</SelectItem>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                {editingUser ? 'Aktualisieren' : 'Erstellen'}
              </Button>
              {editingUser && (
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
            <Users size={20} weight="bold" />
            Benutzerliste
          </CardTitle>
          <CardDescription>
            Verwalten Sie alle Benutzer des Systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(!users || users.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Keine Benutzer vorhanden
              </p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserCircle size={32} weight="duotone" className="text-primary" />
                    <div>
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-muted-foreground">{user.username}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === 'Administrator' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(user)}
                    >
                      <PencilSimple size={18} weight="bold" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteUser(user)}
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
  )

  if (standalone) {
    return (
      <>
        {userManagementContent}
        
        <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Benutzer löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie den Benutzer "{deleteUser?.fullName}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Users size={18} weight="bold" />
            Benutzerverwaltung
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Benutzerverwaltung</DialogTitle>
            <DialogDescription>
              Verwalten Sie alle Benutzer und deren Zugriffsrechte
            </DialogDescription>
          </DialogHeader>
          {userManagementContent}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Benutzer löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie den Benutzer "{deleteUser?.fullName}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
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
