"use client"

import { AlertTriangle, CheckCircle, Info, X } from "lucide-react"

interface CustomAlertProps {
  isOpen: boolean
  type: "success" | "warning" | "info" | "error"
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function CustomAlert({
  isOpen,
  type,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: CustomAlertProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case "error":
        return <X className="w-6 h-6 text-red-500" />
      default:
        return <Info className="w-6 h-6 text-blue-500" />
    }
  }

  const getButtonColors = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700"
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700"
      case "error":
        return "bg-red-600 hover:bg-red-700"
      default:
        return "bg-blue-600 hover:bg-blue-700"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            {getIcon()}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${getButtonColors()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
