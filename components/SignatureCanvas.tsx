'use client'
import React, { useRef, useState, useEffect, useCallback } from 'react'

interface Props {
  onSignatureChange: (dataUrl: string | null) => void
  width?: number
  height?: number
}

export function SignatureCanvas({ onSignatureChange, width = 400, height = 150 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas resolution for retina
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#000000'
  }, [width, height])

  const getCoords = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()

      if ('touches' in e) {
        const touch = e.touches[0]
        if (!touch) return null
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        }
      }

      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      }
    },
    []
  )

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      const coords = getCoords(e)
      if (!coords) return

      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return

      ctx.beginPath()
      ctx.moveTo(coords.x, coords.y)
      setIsDrawing(true)
    },
    [getCoords]
  )

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!isDrawing) return

      const coords = getCoords(e)
      if (!coords) return

      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return

      ctx.lineTo(coords.x, coords.y)
      ctx.stroke()
    },
    [isDrawing, getCoords]
  )

  const stopDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!isDrawing) return
      setIsDrawing(false)
      setHasSignature(true)

      const canvas = canvasRef.current
      if (canvas) {
        onSignatureChange(canvas.toDataURL('image/png'))
      }
    },
    [isDrawing, onSignatureChange]
  )

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    setHasSignature(false)
    onSignatureChange(null)
  }, [onSignatureChange])

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="border border-neutral-300 rounded-[9px] bg-white cursor-crosshair touch-none"
        style={{ width, height }}
      />
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-[12px] text-neutral-400">Draw your signature above</span>
        {hasSignature && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[13px] text-neutral-500 hover:text-neutral-700 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
