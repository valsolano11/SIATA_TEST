"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle, XCircle, Key, Eye, EyeOff } from "lucide-react"

interface StoredUser {
  email: string
  password: string
  id: string
  createdAt: string
}

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "code" | "newPassword">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState("")

  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (!email.trim()) {
      setError("Por favor ingresa tu email")
      setLoading(false)
      return
    }

    const users: StoredUser[] = JSON.parse(localStorage.getItem("registered_users") || "[]")
    const userExists = users.find((user: StoredUser) => user.email === email)

    if (!userExists) {
      setError("No existe una cuenta con este email")
      setLoading(false)
      return
    }

    // Generar código de recuperación simulado
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedCode(recoveryCode)

    // Simular envío de email
    setTimeout(() => {
      setSuccess(`Código de recuperación enviado a ${email}. Código: ${recoveryCode}`)
      setStep("code")
      setLoading(false)
    }, 1500)
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!code.trim()) {
      setError("Por favor ingresa el código de recuperación")
      setLoading(false)
      return
    }

    if (code !== generatedCode) {
      setError("Código de recuperación incorrecto")
      setLoading(false)
      return
    }

    setSuccess("Código verificado correctamente")
    setStep("newPassword")
    setLoading(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Por favor completa todos los campos")
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      setLoading(false)
      return
    }

    // Actualizar contraseña en localStorage
    const users: StoredUser[] = JSON.parse(localStorage.getItem("registered_users") || "[]")
    const userIndex = users.findIndex((user: StoredUser) => user.email === email)

    if (userIndex !== -1) {
      // Simular hash de contraseña
      const hashedPassword = btoa(newPassword + "salt")
      users[userIndex].password = hashedPassword
      localStorage.setItem("registered_users", JSON.stringify(users))

      setSuccess("¡Contraseña actualizada exitosamente! Redirigiendo al login...")
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } else {
      setError("Error al actualizar la contraseña")
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {step === "email" && "Recuperar Contraseña"}
              {step === "code" && "Verificar Código"}
              {step === "newPassword" && "Nueva Contraseña"}
            </h1>
            <p className="text-gray-600">
              {step === "email" && "Ingresa tu email para recibir un código de recuperación"}
              {step === "code" && "Ingresa el código que enviamos a tu email"}
              {step === "newPassword" && "Crea una nueva contraseña segura"}
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <XCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Enviando código..." : "Enviar Código de Recuperación"}
              </button>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Código de Recuperación
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value)
                      setError("")
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Verificando..." : "Verificar Código"}
              </button>
            </form>
          )}

          {step === "newPassword" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      setError("")
                    }}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError("")
                    }}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Actualizando..." : "Actualizar Contraseña"}
              </button>
            </form>
          )}

          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 font-medium">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Login
            </Link>
          </div>
        </div>
      </div>

      <div className="auth-right-panel relative bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center">
        <div className="space-y-6">
          <div className="floating-card p-6 rounded-2xl shadow-lg max-w-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Recuperación Segura</h3>
                <p className="text-gray-600 text-sm">Proceso verificado</p>
              </div>
            </div>
          </div>

          <div className="floating-card p-6 rounded-2xl shadow-lg max-w-sm ml-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Código por Email</h3>
                <p className="text-gray-600 text-sm">Verificación rápida</p>
              </div>
            </div>
          </div>

          <div className="floating-card p-6 rounded-2xl shadow-lg max-w-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Acceso Restaurado</h3>
                <p className="text-gray-600 text-sm">Cuenta protegida</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
