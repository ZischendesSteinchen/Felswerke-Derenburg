import { useVehicles } from '@/hooks/use-database'
import { Vehicle } from '@/lib/types'

export function VehicleLegend() {
  const { vehicles } = useVehicles()

  if (!vehicles || vehicles.length === 0) {
    return null
  }

  return (
    <div className="px-6 pb-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground">Legende:</span>
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="px-3 py-1 rounded-md text-sm font-medium text-white"
            style={{ backgroundColor: vehicle.color }}
          >
            {vehicle.name}
          </div>
        ))}
      </div>
    </div>
  )
}
