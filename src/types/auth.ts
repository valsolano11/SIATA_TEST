export interface User {
  id: string
  email: string
  name: string
  createdAt?: string
}

export interface StoredUser {
  id: string
  email: string
  password: string
  name: string
  createdAt: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
}
