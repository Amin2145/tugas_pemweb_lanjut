import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiCoffee, FiMail, FiLock, FiAlertCircle } from 'react-icons/fi'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)

    if (result.success) {
      const r = result.user.role
      navigate(r === 'owner' ? '/dashboard/owner' : r === 'admin' ? '/dashboard/admin' : '/dashboard/kasir')
    } else {
      setError(result.error)
    }
  }

  const quickLogin = (email) => {
    setEmail(email)
    setPassword('123456')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-coffee-900 px-4 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-coffee-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-coffee-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-accent/10 text-accent mb-3 ring-4 ring-accent/5">
            <FiCoffee size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white font-[Outfit]">CoffeeSync</h2>
          <p className="text-coffee-400 text-sm mt-1">Sistem POS & Inventaris Terdistribusi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              <FiAlertCircle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-coffee-300 uppercase tracking-wider">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-3.5 text-coffee-500" size={16} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="email@coffeesync.id"
                className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 text-sm
                  focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none placeholder-coffee-600" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-coffee-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-3.5 text-coffee-500" size={16} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 text-sm
                  focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none placeholder-coffee-600" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accent-light text-coffee-900 font-bold py-3 rounded-xl shadow-lg
              shadow-accent/20 hover:shadow-accent/40 transition-all disabled:opacity-50 active:scale-[0.98]">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* Quick Login */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-[10px] font-bold text-coffee-500 uppercase tracking-widest text-center mb-3">Quick Login (Demo)</p>
          <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
            {[
              { label: 'Owner', email: 'owner@coffeesync.id' },
              { label: 'Admin BDG', email: 'admin.bdg@coffeesync.id' },
              { label: 'Kasir BDG', email: 'kasir.bdg@coffeesync.id' },
              { label: 'Admin JKT', email: 'admin.jkt@coffeesync.id' },
              { label: 'Kasir JKT', email: 'kasir.jkt@coffeesync.id' },
              { label: 'Admin SBY', email: 'admin.sby@coffeesync.id' },
              { label: 'Kasir SBY', email: 'kasir.sby@coffeesync.id' },
              { label: 'Admin YOG', email: 'admin.yog@coffeesync.id' },
              { label: 'Kasir YOG', email: 'kasir.yog@coffeesync.id' },
              { label: 'Admin MDN', email: 'admin.mdn@coffeesync.id' },
              { label: 'Kasir MDN', email: 'kasir.mdn@coffeesync.id' },
            ].map(q => (
              <button key={q.email} onClick={() => quickLogin(q.email)}
                className={`py-2 text-center border border-white/5 rounded-lg text-[9px] font-bold transition-all active:scale-95
                  ${q.label === 'Owner' 
                    ? 'bg-accent/20 hover:bg-accent/30 text-accent col-span-3 mb-1' 
                    : q.label.includes('Admin')
                      ? 'bg-coffee-700/50 hover:bg-coffee-700 text-coffee-200' 
                      : 'bg-coffee-700/25 hover:bg-coffee-700/60 text-coffee-300'}`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
