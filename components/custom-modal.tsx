"use client"

import React, { useEffect } from "react"
import { createPortal } from "react-dom"

interface CustomModalProps {
  open: boolean
  title?: string
  children?: React.ReactNode
  onClose: () => void
}

export default function CustomModal({ open, title, children, onClose }: CustomModalProps) {
  // Ensure document exists (client-only)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  if (!open) return null

  // Create portal to body so modal truly centers on screen
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-card text-card-foreground rounded-xl border p-4 z-10">
          {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
