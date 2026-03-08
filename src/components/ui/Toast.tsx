"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Info, X, ShieldAlert } from "lucide-react"

export type ToastType = "success" | "error" | "info" | "warning"

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: ShieldAlert,
}

const colorMap = {
  success: {
    bg: "bg-green-50 border-green-200",
    icon: "text-green-500",
    text: "text-green-800",
    close: "text-green-400 hover:text-green-600",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    icon: "text-red-500",
    text: "text-red-800",
    close: "text-red-400 hover:text-red-600",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: "text-blue-500",
    text: "text-blue-800",
    close: "text-blue-400 hover:text-blue-600",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    icon: "text-amber-500",
    text: "text-amber-800",
    close: "text-amber-400 hover:text-amber-600",
  },
}

function ToastItem({ message, type = "info", duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true))

    const timer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const Icon = iconMap[type]
  const colors = colorMap[type]

  return (
    <div
      className={`flex items-start gap-3 w-full max-w-sm p-4 border rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 ${colors.bg} ${
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${colors.icon}`} />
      <p className={`text-sm font-medium flex-1 ${colors.text}`}>{message}</p>
      <button
        onClick={() => {
          setIsLeaving(true)
          setTimeout(onClose, 300)
        }}
        className={`flex-shrink-0 ${colors.close} transition-colors`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// ── Global toast state (lightweight, no external deps) ───────────────────────

type ToastEntry = {
  id: number
  message: string
  type: ToastType
  duration?: number
}

let toastListeners: Array<(toasts: ToastEntry[]) => void> = []
let toasts: ToastEntry[] = []
let nextId = 0

function emit() {
  toastListeners.forEach((fn) => fn([...toasts]))
}

export function toast(message: string, type: ToastType = "info", duration?: number) {
  const id = nextId++
  toasts = [...toasts, { id, message, type, duration }]
  emit()
}

export function toast_success(message: string) {
  toast(message, "success")
}

export function toast_error(message: string) {
  toast(message, "error", 5000)
}

export function toast_warning(message: string) {
  toast(message, "warning", 5000)
}

function removeToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

// ── Toast Container (mount once in layout) ───────────────────────────────────

export function ToastContainer() {
  const [items, setItems] = useState<ToastEntry[]>([])

  useEffect(() => {
    toastListeners.push(setItems)
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setItems)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-auto">
      {items.map((t) => (
        <ToastItem
          key={t.id}
          message={t.message}
          type={t.type}
          duration={t.duration}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </div>
  )
}
