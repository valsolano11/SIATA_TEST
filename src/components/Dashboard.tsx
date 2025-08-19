"use client"

import type React from "react"
import type { Station } from "@/types/station"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import {
  LogOut,
  Settings,
  Users,
  BarChart3,
  MapPin,
  Plus,
  Search,
  Filter,
  User,
  Home,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import StationModal from "./StationModal"
import ProfileSection from "./ProfileSection"
import CustomAlert from "./CustomAlert"

interface AlertState {
  isOpen: boolean
  type: "success" | "warning" | "info" | "error"
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("inicio")
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">("view")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: () => {},
  })

  const showAlert = (alertData: Omit<AlertState, "isOpen">) => {
    setAlert({
      ...alertData,
      isOpen: true,
    })
  }

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }))
  }

  useEffect(() => {
    fetchStations()
  }, [])

  const fetchStations = async (): Promise<void> => {
    try {
      setLoading(true)
      console.log("[v0] Fetching stations from mockAPI.io...")

      const response = await fetch("https://689e1ef63fed484cf876618e.mockapi.io/stations")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: Station[] = await response.json()
      setStations(data)
      console.log("[v0] Stations loaded successfully:", data.length)
    } catch (error) {
      console.error("[v0] Error fetching stations:", error)
      // Fallback to mock data if API fails
      const mockStations: Station[] = [
        {
          id: "1",
          name: "Estación Central",
          location: "Centro de la Ciudad",
          status: "active",
          latitude: -34.6037,
          longitude: -58.3816,
          type: "Principal",
          lastReading: new Date().toISOString(),
          currentTemperature: 22.5,
        },
        {
          id: "2",
          name: "Estación Norte",
          location: "Zona Norte",
          status: "active",
          latitude: -34.5875,
          longitude: -58.3974,
          type: "Secundaria",
          lastReading: new Date(Date.now() - 300000).toISOString(),
          currentTemperature: 21.8,
        },
      ]
      setStations(mockStations)
    } finally {
      setLoading(false)
    }
  }

  const createStation = async (stationData: Omit<Station, "id">): Promise<boolean> => {
    try {
      const response = await fetch("https://689e1ef63fed484cf876618e.mockapi.io/stations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stationData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newStation: Station = await response.json()
      setStations((prev) => [...prev, newStation])
      console.log("[v0] Station created successfully:", newStation)

      showAlert({
        type: "success",
        title: "Estación Creada",
        message: `La estación "${stationData.name}" ha sido creada exitosamente.`,
        confirmText: "Entendido",
        onConfirm: closeAlert,
      })

      return true
    } catch (error) {
      console.error("[v0] Error creating station:", error)
      return false
    }
  }

  const updateStation = async (id: string, stationData: Partial<Station>): Promise<boolean> => {
    try {
      const response = await fetch(`https://689e1ef63fed484cf876618e.mockapi.io/stations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stationData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedStation: Station = await response.json()
      setStations((prev) => prev.map((station) => (station.id === id ? updatedStation : station)))
      console.log("[v0] Station updated successfully:", updatedStation)

      showAlert({
        type: "success",
        title: "Estación Actualizada",
        message: `La estación "${updatedStation.name}" ha sido actualizada exitosamente.`,
        confirmText: "Entendido",
        onConfirm: closeAlert,
      })

      return true
    } catch (error) {
      console.error("[v0] Error updating station:", error)
      return false
    }
  }

  const deleteStation = async (id: string): Promise<boolean> => {
    const stationToDelete = stations.find((s) => s.id === id)

    showAlert({
      type: "warning",
      title: "Confirmar Eliminación",
      message: `¿Estás seguro de que deseas eliminar la estación "${stationToDelete?.name || "esta estación"}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        closeAlert()
        try {
          const response = await fetch(`https://689e1ef63fed484cf876618e.mockapi.io/stations/${id}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          setStations((prev) => prev.filter((station) => station.id !== id))
          console.log("[v0] Station deleted successfully:", id)

          // Mostrando alerta de éxito después de eliminar
          showAlert({
            type: "success",
            title: "Estación Eliminada",
            message: `La estación "${stationToDelete?.name || "seleccionada"}" ha sido eliminada exitosamente.`,
            confirmText: "Entendido",
            onConfirm: closeAlert,
          })
        } catch (error) {
          console.error("[v0] Error deleting station:", error)
          showAlert({
            type: "error",
            title: "Error al Eliminar",
            message: "No se pudo eliminar la estación. Por favor, inténtalo de nuevo.",
            confirmText: "Entendido",
            onConfirm: closeAlert,
          })
        }
      },
    })

    return false // No ejecutamos la eliminación inmediatamente
  }

  const handleLogout = (): void => {
    showAlert({
      type: "warning",
      title: "Cerrar Sesión",
      message: "¿Estás seguro de que deseas cerrar sesión?",
      confirmText: "Cerrar Sesión",
      cancelText: "Cancelar",
      onConfirm: () => {
        closeAlert()
        logout()
        router.push("/")
      },
    })
  }

  const openStationModal = (station: Station | null, mode: "view" | "edit" | "create" = "view"): void => {
    setSelectedStation(station)
    setModalMode(mode)
    setIsModalOpen(true)
  }

  const closeStationModal = (): void => {
    setSelectedStation(null)
    setIsModalOpen(false)
    setModalMode("view")
  }

  const filteredStations = stations.filter((station) => {
    const matchesSearch =
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || station.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredStations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStations = filteredStations.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const goToPage = (page: number): void => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const getStatusColor = (status: string): string => {
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

  const getStatusText = (status: string): string => {
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

  const activeStations = stations.filter((s) => s.status === "active").length

  const averageTemperature = (() => {
    const validTemperatures = stations
      .map((s) => {
        const temp =
          typeof s.currentTemperature === "string" ? Number.parseFloat(s.currentTemperature) : s.currentTemperature
        return isNaN(temp) ? null : temp
      })
      .filter((temp): temp is number => temp !== null)

    if (validTemperatures.length === 0) return "0"

    const sum = validTemperatures.reduce((acc, temp) => acc + temp, 0)
    return (sum / validTemperatures.length).toFixed(1)
  })()

  const maintenanceCount = stations.filter((s) => s.status === "maintenance").length

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Sin fecha"

    try {
      // Intentar parsear la fecha
      const date = new Date(dateString)

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        // Si no es válida, intentar con diferentes formatos
        const timestamp = Date.parse(dateString)
        if (!isNaN(timestamp)) {
          return new Date(timestamp).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        }
        return "Fecha inválida"
      }

      // Formatear la fecha válida
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("[v0] Error formatting date:", error, "for dateString:", dateString)
      return "Error en fecha"
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "inicio":
        return renderInicioContent()
      case "perfil":
        return <ProfileSection />
      default:
        return renderInicioContent()
    }
  }

  const renderInicioContent = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Estaciones Activas</p>
              <p className="text-2xl font-bold text-gray-900">{activeStations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Temperatura Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{averageTemperature}°C</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Estaciones</p>
              <p className="text-2xl font-bold text-gray-900">{stations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mantenimientos</p>
              <p className="text-2xl font-bold text-gray-900">{maintenanceCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stations Table */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="px-6 py-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-medium text-gray-900">Gestión de Estaciones</h3>
            <button
              onClick={() => openStationModal(null, "create")}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Estación</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar estaciones..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Cargando estaciones...</span>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Latitud
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Longitud
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Lectura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temperatura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStations.map((station) => (
                  <tr key={station.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{station.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{station.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{station.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(station.status)}`}>
                        {getStatusText(station.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof station.latitude === "string"
                        ? Number.parseFloat(station.latitude).toFixed(4)
                        : station.latitude.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof station.longitude === "string"
                        ? Number.parseFloat(station.longitude).toFixed(4)
                        : station.longitude.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{station.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(station.lastReading)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof station.currentTemperature === "string"
                        ? station.currentTemperature
                        : station.currentTemperature.toFixed(1)}
                      °C
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openStationModal(station, "view")}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Ver detalles"
                        >
                          <MapPin className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openStationModal(station, "edit")}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteStation(station.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filteredStations.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron estaciones</p>
            </div>
          )}
        </div>

        {!loading && filteredStations.length > 0 && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredStations.length)} de {filteredStations.length}{" "}
                estaciones
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber: number
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          currentPage === pageNumber ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Estación Central - Sistema activado</p>
                <p className="text-xs text-gray-500">Hace 2 minutos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Nueva estación agregada - Zona Norte</p>
                <p className="text-xs text-gray-500">Hace 15 minutos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Mantenimiento programado - Estación Sur</p>
                <p className="text-xs text-gray-500">Hace 1 hora</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Sistema de Gestión de Estaciones</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bienvenido, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("inicio")}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "inicio"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </button>
            <button
              onClick={() => setActiveTab("perfil")}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "perfil"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {activeTab === "inicio" ? "Panel de Control" : "Mi Perfil"}
          </h2>
          <p className="text-gray-600">
            {activeTab === "inicio"
              ? "Gestiona y monitorea todas las estaciones desde aquí"
              : "Administra tu información personal y configuración de cuenta"}
          </p>
        </div>

        {renderContent()}
      </main>

      <StationModal
        station={selectedStation}
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={closeStationModal}
        onSave={async (stationData: Omit<Station, "id">) => {
          let success = false
          if (modalMode === "create") {
            success = await createStation(stationData)
          } else if (modalMode === "edit" && selectedStation) {
            success = await updateStation(selectedStation.id, stationData)
          }

          if (success) {
            closeStationModal()
          }
          return success
        }}
      />

      <CustomAlert
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        onConfirm={alert.onConfirm}
        onCancel={closeAlert}
      />
    </div>
  )
}
