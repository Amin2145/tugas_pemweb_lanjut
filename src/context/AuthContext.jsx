import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

const AuthContext = createContext(null)

// Seed data for demo/mock mode when Supabase is not connected
const MOCK_USERS = [
  { id: 'a0000000-0000-0000-0000-000000000001', nama: 'Budi Santoso', email: 'owner@coffeesync.id', password: '123456', role: 'owner', cabang_id: null, cabang: null },
  { id: 'a0000000-0000-0000-0000-000000000002', nama: 'Andi Wijaya', email: 'admin.bdg@coffeesync.id', password: '123456', role: 'admin', cabang_id: 1, cabang: { id: 1, nama_cabang: 'CoffeeSync Bandung' } },
  { id: 'a0000000-0000-0000-0000-000000000003', nama: 'Agus Purnomo', email: 'admin.jkt@coffeesync.id', password: '123456', role: 'admin', cabang_id: 2, cabang: { id: 2, nama_cabang: 'CoffeeSync Jakarta' } },
  { id: 'a0000000-0000-0000-0000-000000000004', nama: 'Adit Pratama', email: 'admin.sby@coffeesync.id', password: '123456', role: 'admin', cabang_id: 3, cabang: { id: 3, nama_cabang: 'CoffeeSync Surabaya' } },
  { id: 'a0000000-0000-0000-0000-000000000008', nama: 'Fajar Nugraha', email: 'admin.yog@coffeesync.id', password: '123456', role: 'admin', cabang_id: 4, cabang: { id: 4, nama_cabang: 'CoffeeSync Yogyakarta' } },
  { id: 'a0000000-0000-0000-0000-000000000009', nama: 'Rian Syahputra', email: 'admin.mdn@coffeesync.id', password: '123456', role: 'admin', cabang_id: 5, cabang: { id: 5, nama_cabang: 'CoffeeSync Medan' } },
  { id: 'a0000000-0000-0000-0000-000000000005', nama: 'Kiki Amelia', email: 'kasir.bdg@coffeesync.id', password: '123456', role: 'kasir', cabang_id: 1, cabang: { id: 1, nama_cabang: 'CoffeeSync Bandung' } },
  { id: 'a0000000-0000-0000-0000-000000000006', nama: 'Kevin Saputra', email: 'kasir.jkt@coffeesync.id', password: '123456', role: 'kasir', cabang_id: 2, cabang: { id: 2, nama_cabang: 'CoffeeSync Jakarta' } },
  { id: 'a0000000-0000-0000-0000-000000000007', nama: 'Karin Dewi', email: 'kasir.sby@coffeesync.id', password: '123456', role: 'kasir', cabang_id: 3, cabang: { id: 3, nama_cabang: 'CoffeeSync Surabaya' } },
  { id: 'a0000000-0000-0000-0000-000000000010', nama: 'Indah Lestari', email: 'kasir.yog@coffeesync.id', password: '123456', role: 'kasir', cabang_id: 4, cabang: { id: 4, nama_cabang: 'CoffeeSync Yogyakarta' } },
  { id: 'a0000000-0000-0000-0000-000000000011', nama: 'Putri Siregar', email: 'kasir.mdn@coffeesync.id', password: '123456', role: 'kasir', cabang_id: 5, cabang: { id: 5, nama_cabang: 'CoffeeSync Medan' } },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    // Check if there's a saved session
    const saved = localStorage.getItem('coffeesync_user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
        setIsMock(!!localStorage.getItem('coffeesync_mock'))
      } catch { /* ignore */ }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Try Supabase Auth first
    const sbUrl = import.meta.env.VITE_SUPABASE_URL
    if (sbUrl && !sbUrl.includes('YOUR_PROJECT')) {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*, cabang(*)')
          .eq('email', email)
          .eq('password', password)
          .single()

        if (error || !userData) throw new Error('Invalid credentials')

        const profile = {
          id: userData.id,
          nama: userData.nama,
          email: userData.email,
          role: userData.role,
          cabang_id: userData.cabang_id,
          cabang: userData.cabang
        }
        setUser(profile)
        setIsMock(false)
        localStorage.setItem('coffeesync_user', JSON.stringify(profile))
        localStorage.removeItem('coffeesync_mock')
        return { success: true, user: profile }
      } catch (err) {
        // Fall through to mock
      }
    }

    // Mock login
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (!found) return { success: false, error: 'Email atau password salah' }

    const profile = {
      id: found.id,
      nama: found.nama,
      email: found.email,
      role: found.role,
      cabang_id: found.cabang_id,
      cabang: found.cabang
    }
    setUser(profile)
    setIsMock(true)
    localStorage.setItem('coffeesync_user', JSON.stringify(profile))
    localStorage.setItem('coffeesync_mock', '1')
    return { success: true, user: profile }
  }

  const logout = () => {
    setUser(null)
    setIsMock(false)
    localStorage.removeItem('coffeesync_user')
    localStorage.removeItem('coffeesync_mock')
  }

  // Theme Management
  const [theme, setTheme] = useState(() => localStorage.getItem('coffeesync_theme') || 'light')

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    }
    localStorage.setItem('coffeesync_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  // PWA Install Prompt Management
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      console.log('PWA installation prompt event stashed.')
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      console.log('PWA installed successfully.')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User installation outcome: ${outcome}`)
    setDeferredPrompt(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isMock, login, logout, theme, toggleTheme, deferredPrompt, installApp }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

