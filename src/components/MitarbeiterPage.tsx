import { UserManagement } from '@/components/UserManagement'

export function MitarbeiterPage() {
  return (
    <div className="p-6 space-y-6 w-full">
      <div>
        <h2 className="text-3xl font-semibold mb-2">Mitarbeiter</h2>
        <p className="text-muted-foreground">
          Verwalten Sie alle Mitarbeiterkonten für die Terminplanung
        </p>
      </div>

      <div className="max-w-7xl">
        <UserManagement standalone={true} />
      </div>
    </div>
  )
}
