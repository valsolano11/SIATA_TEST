"use client"

import { useState, useEffect } from "react"
import { X, Clock, Thermometer, Save, AlertCircle } from "lucide-react"
import type { Station } from "@/types/station"

interface StationModalProps {
  station: Station | null
  isOpen: boolean
  mode: "view" | "edit" | "create"
  onClose: () => void
  onSave: (stationData: Omit<Station, "id">) => Promise<boolean>
}

export default function StationModal({ station, isOpen, mode, onClose, onSave }: StationModalProps) {
  const [formData, setFormData] = useState<Omit<Station, "id">>({
    name: "",
    location: "",
    status: "active",
    latitude: 0,
    longitude: 0,
    type: "Principal",
    lastReading: new Date().toISOString(),
    currentTemperature: 20,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (station && (mode === "edit" || mode === "view")) {
      const currentTemp =
        typeof station.currentTemperature === "string"
          ? Number.parseFloat(station.currentTemperature) || 0
          : station.currentTemperature

      setFormData({
        name: station.name,
        location: station.location,
        status: station.status,
        latitude: station.latitude,
        longitude: station.longitude,
        type: station.type,
        lastReading: station.lastReading,
        currentTemperature: currentTemp,
      })
    } else if (mode === "create") {
      setFormData({
        name: "",
        location: "",
        status: "active",
        latitude: 0,
        longitude: 0,
        type: "Principal",
        lastReading: new Date().toISOString(),
        currentTemperature: 20,
      })
    }
    setErrors({})
  }, [station, mode, isOpen])

  const validateForm = () => {
  const newErrors: Record<string, string> = {}

  const latitude = Number(formData.latitude)
  const longitude = Number(formData.longitude)
  const currentTemperature = Number(formData.currentTemperature)

  if (!formData.name.trim()) {
    newErrors.name = "El nombre es requerido"
  }
  if (!formData.location.trim()) {
    newErrors.location = "La ubicación es requerida"
  }
  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    newErrors.latitude = "La latitud debe estar entre -90 y 90"
  }
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    newErrors.longitude = "La longitud debe estar entre -180 y 180"
  }
  if (isNaN(currentTemperature) || currentTemperature < -50 || currentTemperature > 60) {
    newErrors.currentTemperature = "La temperatura debe estar entre -50°C y 60°C"
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const success = await onSave(formData)
      if (!success) {
        setErrors({ general: "Error al guardar la estación. Inténtalo de nuevo." })
      }
    } catch {
      setErrors({ general: "Error inesperado. Inténtalo de nuevo." })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleNumberInputChange = (field: keyof typeof formData, value: string) => {
    // Permitir campo vacío o valores numéricos válidos
    if (value === "" || value === "-" || !isNaN(Number(value))) {
      setFormData((prev) => ({ ...prev, [field]: value === "" ? "" : Number(value) }))
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }))
      }
    }
  }

  if (!isOpen) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100"
      case "inactive":
        return "text-red-600 bg-red-100"
      case "maintenance":
        return "text-yellow-600 bg-yellow-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activa"
      case "inactive":
        return "Inactiva"
      case "maintenance":
        return "Mantenimiento"
      default:
        return "Desconocido"
    }
  }

  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Nueva Estación"
      case "edit":
        return `Editar ${station?.name || "Estación"}`
      default:
        return station?.name || "Detalles de Estación"
    }
  }

  const isReadOnly = mode === "view"

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{getModalTitle()}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {errors.general && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              {isReadOnly ? (
                <p className="text-gray-900 font-medium">{formData.name}</p>
              ) : (
                <>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Nombre de la estación"
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación *</label>
              {isReadOnly ? (
                <p className="text-gray-900">{formData.location}</p>
              ) : (
                <>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.location ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Ubicación de la estación"
                  />
                  {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
                </>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              {isReadOnly ? (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(formData.status)}`}
                >
                  {getStatusText(formData.status)}
                </span>
              ) : (
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value as Station["status"])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="active">Activa</option>
                  <option value="inactive">Inactiva</option>
                  <option value="maintenance">Mantenimiento</option>
                </select>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              {isReadOnly ? (
                <p className="text-gray-900">{formData.type}</p>
              ) : (
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Principal">Principal</option>
                  <option value="Secundaria">Secundaria</option>
                  <option value="Auxiliar">Auxiliar</option>
                </select>
              )}
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Latitud *</label>
              {isReadOnly ? (
                <p className="text-gray-900">{formData.latitude.toFixed(6)}</p>
              ) : (
                <>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => handleNumberInputChange("latitude", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.latitude ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="-34.603722"
                  />
                  {errors.latitude && <p className="text-sm text-red-600 mt-1">{errors.latitude}</p>}
                </>
              )}
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitud *</label>
              {isReadOnly ? (
                <p className="text-gray-900">{formData.longitude.toFixed(6)}</p>
              ) : (
                <>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => handleNumberInputChange("longitude", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.longitude ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="-58.381592"
                  />
                  {errors.longitude && <p className="text-sm text-red-600 mt-1">{errors.longitude}</p>}
                </>
              )}
            </div>

            {/* Current Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura Actual (°C)</label>
              {isReadOnly ? (
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-blue-500" />
                  <p className="text-gray-900">
                    {typeof formData.currentTemperature === "string"
                      ? formData.currentTemperature
                      : formData.currentTemperature.toFixed(1)}
                    °C
                  </p>
                </div>
              ) : (
                <>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.currentTemperature}
                    onChange={(e) => handleNumberInputChange("currentTemperature", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.currentTemperature ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="22.5"
                  />
                  {errors.currentTemperature && (
                    <p className="text-sm text-red-600 mt-1">{errors.currentTemperature}</p>
                  )}
                </>
              )}
            </div>

            {/* Last Reading */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Última Lectura</label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900 text-sm">{new Date(formData.lastReading).toLocaleString("es-ES")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {isReadOnly ? "Cerrar" : "Cancelar"}
          </button>
          {!isReadOnly && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? "Guardando..." : "Guardar"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
