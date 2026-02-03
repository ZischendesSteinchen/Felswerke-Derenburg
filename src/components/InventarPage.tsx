import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from '@phosphor-icons/react'

export function InventarPage() {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package size={24} weight="bold" className="text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Inventar</CardTitle>
                <CardDescription>Verwalten Sie Ihr Inventar und Equipment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package size={64} weight="light" className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Inventar-Verwaltung</h3>
              <p className="text-muted-foreground max-w-md">
                Diese Seite wird in Kürze verfügbar sein. Hier können Sie Ihr Inventar und Equipment verwalten.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
