"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  createdAt?: string
}

interface StoredUser {
  id: string
  email: string
  password: string
  name: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Debe contener al menos una letra mayúscula")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Debe contener al menos una letra minúscula")
  }
  if (!/\d/.test(password)) {
    errors.push("Debe contener al menos un número")
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Debe contener al menos un carácter especial")
  }

  return { isValid: errors.length === 0, errors }
}

const hashPassword = (password: string): string => {
  return btoa(password + "salt_demo_2024")
}

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] Verificando sesión guardada...")

    console.log("[v0] Contenido completo de localStorage:")
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        console.log(`[v0] ${key}:`, localStorage.getItem(key))
      }
    }

    const savedUser = localStorage.getItem("auth_user")
    const authToken = localStorage.getItem("auth_token")
    const registeredUsers = localStorage.getItem("registered_users")

    console.log("[v0] Datos específicos en localStorage:")
    console.log("[v0] auth_user:", savedUser)
    console.log("[v0] auth_token:", authToken)
    console.log("[v0] registered_users:", registeredUsers)

    if (savedUser && authToken) {
      try {
        const userData = JSON.parse(savedUser)
        const tokenData = JSON.parse(atob(authToken.split(".")[1] || "{}"))
        const now = Date.now()

        console.log("[v0] Token data:", tokenData, "Current time:", now)

        if (tokenData.exp && now < tokenData.exp) {
          console.log("[v0] Token válido, restaurando sesión")
          setUser(userData)
        } else {
          console.log("[v0] Token expirado, limpiando sesión")
          localStorage.removeItem("auth_user")
          localStorage.removeItem("auth_token")
        }
      } catch (error) {
        console.log("[v0] Error al parsear datos guardados:", error)
        localStorage.removeItem("auth_user")
        localStorage.removeItem("auth_token")
      }
    } else {
      console.log("[v0] No hay sesión guardada")
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!email.trim() || !password.trim()) {
        return { success: false, error: "Por favor completa todos los campos" }
      }

      if (!validateEmail(email)) {
        return { success: false, error: "Por favor ingresa un email válido" }
      }

      const users: StoredUser[] = JSON.parse(localStorage.getItem("registered_users") || "[]")
      console.log("[v0] Usuarios registrados encontrados:", users.length)
      console.log(
        "[v0] Lista de usuarios:",
        users.map((u: StoredUser) => ({ email: u.email, name: u.name })),
      )

      const foundUser = users.find((u: StoredUser) => u.email.toLowerCase() === email.toLowerCase())

      if (!foundUser) {
        console.log("[v0] Usuario no encontrado para email:", email)
        console.log(
          "[v0] Emails disponibles:",
          users.map((u) => u.email),
        )
        return { success: false, error: "No existe una cuenta con este email" }
      }

      if (!verifyPassword(password, foundUser.password)) {
        console.log("[v0] Contraseña incorrecta para usuario:", email)
        return { success: false, error: "Credenciales inválidas" }
      }

      const tokenPayload = {
        userId: foundUser.id,
        email: foundUser.email,
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000,
      }
      const token = btoa(JSON.stringify({ header: "demo" })) + "." + btoa(JSON.stringify(tokenPayload)) + ".signature"

      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        createdAt: foundUser.createdAt,
      }
      console.log("[v0] Guardando sesión:", userData)

      localStorage.setItem("auth_user", JSON.stringify(userData))
      localStorage.setItem("auth_token", token)

      const savedCheck = localStorage.getItem("auth_user")
      const tokenCheck = localStorage.getItem("auth_token")
      console.log("[v0] Verificación de guardado:")
      console.log("[v0] Usuario guardado:", savedCheck ? "✓ Sí" : "✗ No")
      console.log("[v0] Token guardado:", tokenCheck ? "✓ Sí" : "✗ No")
      console.log("[v0] Contenido guardado:", savedCheck)

      setUser(userData)
      return { success: true }
    } catch (error) {
      console.log("[v0] Error en login:", error)
      return { success: false, error: "Error interno del servidor. Intenta nuevamente." }
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!name.trim() || !email.trim() || !password.trim()) {
        return { success: false, error: "Por favor completa todos los campos" }
      }

      if (name.trim().length < 2) {
        return { success: false, error: "El nombre debe tener al menos 2 caracteres" }
      }

      if (!validateEmail(email)) {
        return { success: false, error: "Por favor ingresa un email válido" }
      }

      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors[0] }
      }

      const users: StoredUser[] = JSON.parse(localStorage.getItem("registered_users") || "[]")
      console.log("[v0] Usuarios existentes antes del registro:", users.length)

      if (users.some((u: StoredUser) => u.email.toLowerCase() === email.toLowerCase())) {
        console.log("[v0] Email ya existe:", email)
        return { success: false, error: "Ya existe una cuenta con este email" }
      }

      const newUser: StoredUser = {
        id: Date.now().toString(),
        email: email.toLowerCase().trim(),
        password: hashPassword(password),
        name: name.trim(),
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      console.log("[v0] Guardando nuevo usuario:", { email: newUser.email, name: newUser.name })

      localStorage.setItem("registered_users", JSON.stringify(users))

      const savedUsers = JSON.parse(localStorage.getItem("registered_users") || "[]")
      console.log("[v0] Verificación de registro:")
      console.log("[v0] Usuarios después del registro:", savedUsers.length)
      console.log(
        "[v0] Usuario recién registrado encontrado:",
        savedUsers.find((u: StoredUser) => u.email === newUser.email) ? "✓ Sí" : "✗ No",
      )
      console.log(
        "[v0] Lista actualizada:",
        savedUsers.map((u: StoredUser) => ({ email: u.email, name: u.name })),
      )

      return { success: true }
    } catch (error) {
      console.log("[v0] Error en registro:", error)
      return { success: false, error: "Error interno del servidor. Intenta nuevamente." }
    }
  }

  const logout = () => {
    console.log("[v0] Cerrando sesión...")
    localStorage.removeItem("auth_user")
    localStorage.removeItem("auth_token")
    setUser(null)
    console.log("[v0] Sesión cerrada exitosamente")
  }

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (!user) {
        console.log("[v0] No hay usuario logueado")
        return false
      }

      const passwordValidation = validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        console.log("[v0] Nueva contraseña no válida:", passwordValidation.errors)
        return false
      }

      const users: StoredUser[] = JSON.parse(localStorage.getItem("registered_users") || "[]")
      const userIndex = users.findIndex((u: StoredUser) => u.id === user.id)

      if (userIndex === -1) {
        console.log("[v0] Usuario no encontrado en localStorage")
        return false
      }

      if (!verifyPassword(currentPassword, users[userIndex].password)) {
        console.log("[v0] Contraseña actual incorrecta")
        return false
      }
      users[userIndex].password = hashPassword(newPassword)
      localStorage.setItem("registered_users", JSON.stringify(users))

      console.log("[v0] Contraseña actualizada exitosamente para usuario:", user.email)
      return true
    } catch (error) {
      console.log("[v0] Error al actualizar contraseña:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
