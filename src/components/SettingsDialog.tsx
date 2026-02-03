import { useState, useRef } from 'react'
import { useUsers } from '@/hooks/use-database'
import { User } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserCircle, Key, Camera } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onUserUpdate: (updatedUser: User) => void
}

export function SettingsDialog({ open, onOpenChange, user, onUserUpdate }: SettingsDialogProps) {
  const { users, updateUser } = useUsers()
  const [fullName, setFullName] = useState(user.fullName)
  const [username, setUsername] = useState(user.username)
  const [password, setPassword] = useState(user.password)
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Bild zu groß. Maximale Größe: 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarUrl(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!fullName.trim() || !username.trim() || !password.trim()) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    try {
      await updateUser(user.id, { fullName, username, password, avatarUrl })
      const updatedUser = { ...user, fullName, username, password, avatarUrl }
      onUserUpdate(updatedUser)
      toast.success('Einstellungen gespeichert')
      onOpenChange(false)
    } catch (error) {
      toast.error('Fehler beim Speichern der Einstellungen')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            <UserCircle size={28} weight="bold" className="text-primary" />
            Account-Einstellungen
          </DialogTitle>
          <DialogDescription>
            Hier können Sie Ihre Kontoinformationen bearbeiten.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera size={32} weight="bold" className="text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground">Klicken Sie auf das Bild, um es zu ändern</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
              <UserCircle size={16} weight="bold" />
              Vollständiger Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Max Mustermann"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
              <Key size={16} weight="bold" />
              Benutzername
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="benutzername"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
              <Key size={16} weight="bold" />
              Passwort
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              Speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
