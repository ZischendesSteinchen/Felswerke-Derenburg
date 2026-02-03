import { useState, useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#dc2626', '#ea580c', '#d97706',
]

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export function ColorPicker({ value, onChange, label = 'Farbe' }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value.replace('#', '').toUpperCase())
  const [rgb, setRgb] = useState({ r: 255, g: 0, b: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sliderRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const color = hexToRgb(value)
    if (color) {
      setRgb(color)
      setHexInput(value.replace('#', '').toUpperCase())
    }
  }, [value])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 2

    ctx.clearRect(0, 0, width, height)

    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = (angle - 90) * Math.PI / 180
      const endAngle = (angle + 1 - 90) * Math.PI / 180

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      
      const hue = angle
      gradient.addColorStop(0, '#ffffff')
      gradient.addColorStop(0.5, `hsl(${hue}, 100%, 50%)`)
      gradient.addColorStop(1, '#000000')

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const dx = x - centerX
    const dy = y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const radius = Math.min(canvas.width, canvas.height) / 2

    if (distance > radius) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const imageData = ctx.getImageData(x, y, 1, 1)
    const pixel = imageData.data

    const r = pixel[0]
    const g = pixel[1]
    const b = pixel[2]

    const hexColor = rgbToHex(r, g, b)
    onChange(hexColor)
    setRgb({ r, g, b })
    setHexInput(hexColor.replace('#', '').toUpperCase())
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)
    setHexInput(input)

    if (input.length === 6) {
      const fullHex = `#${input}`
      const color = hexToRgb(fullHex)
      if (color) {
        setRgb(color)
        onChange(fullHex)
      }
    }
  }

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    const numValue = Math.min(255, Math.max(0, parseInt(value) || 0))
    const newRgb = { ...rgb, [channel]: numValue }
    setRgb(newRgb)
    
    const hexColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    onChange(hexColor)
    setHexInput(hexColor.replace('#', '').toUpperCase())
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-3 h-10"
          >
            <div
              className="w-6 h-6 rounded border-2 border-border"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm">{value.toUpperCase()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-4" align="start">
          <div className="space-y-4">
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={240}
                height={240}
                className="cursor-crosshair rounded-lg border border-border"
                onClick={handleCanvasClick}
                style={{ display: 'block' }}
              />
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="hex" className="text-xs">Hex</Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-foreground">#</span>
                  <Input
                    id="hex"
                    value={hexInput}
                    onChange={handleHexChange}
                    className="h-8 text-xs font-mono uppercase text-foreground"
                    style={{ color: 'oklch(0.2 0.01 250)' }}
                    maxLength={6}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="r" className="text-xs">R</Label>
                  <Input
                    id="r"
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.r}
                    onChange={(e) => handleRgbChange('r', e.target.value)}
                    className="h-8 text-xs text-foreground"
                    style={{ color: 'oklch(0.2 0.01 250)' }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="g" className="text-xs">G</Label>
                  <Input
                    id="g"
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.g}
                    onChange={(e) => handleRgbChange('g', e.target.value)}
                    className="h-8 text-xs text-foreground"
                    style={{ color: 'oklch(0.2 0.01 250)' }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="b" className="text-xs">B</Label>
                  <Input
                    id="b"
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.b}
                    onChange={(e) => handleRgbChange('b', e.target.value)}
                    className="h-8 text-xs text-foreground"
                    style={{ color: 'oklch(0.2 0.01 250)' }}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs mb-2 block">Voreinstellungen</Label>
                <div className="grid grid-cols-10 gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        onChange(color)
                        const rgbColor = hexToRgb(color)
                        if (rgbColor) {
                          setRgb(rgbColor)
                          setHexInput(color.replace('#', '').toUpperCase())
                        }
                      }}
                      className="w-full aspect-square rounded border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
