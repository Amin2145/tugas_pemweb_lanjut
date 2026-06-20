import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiInfo } from 'react-icons/fi'
import { db } from '../../utils/db'

export default function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [cabangs, setCabangs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Form State
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('kasir')
  const [cabangId, setCabangId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [uData, cData] = await Promise.all([
        db.users.list(),
        db.cabang.list()
      ])
      setUsers(uData)
      setCabangs(cData)
    } catch (err) {
      console.error(err)
      setError('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setCurrentUser(null)
    setNama('')
    setEmail('')
    setPassword('')
    setRole('kasir')
    setCabangId(cabangs[0]?.id || '')
    setError('')
    setModalOpen(true)
  }

  const openEditModal = (user) => {
    setCurrentUser(user)
    setNama(user.nama)
    setEmail(user.email)
    setPassword(user.password || '') // in mockup it's readable
    setRole(user.role)
    setCabangId(user.cabang_id || '')
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nama.trim()) return setError('Nama wajib diisi')
    if (!email.trim()) return setError('Email wajib diisi')
    if (!password.trim()) return setError('Password wajib diisi')

    setError('')
    try {
      const payload = {
        nama,
        email,
        password,
        role,
        cabang_id: role === 'owner' ? null : Number(cabangId) || null
      }

      if (currentUser) {
        await db.users.update(currentUser.id, payload)
      } else {
        await db.users.create(payload)
      }
      setModalOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan user')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini?')) return
    try {
      await db.users.delete(id)
      loadData()
    } catch (err) {
      console.error(err)
      alert('Gagal menghapus user')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white font-[Outfit]">Kelola User</h2>
          <p className="text-xs text-coffee-400">Atur akses pengguna, role, dan cabang terkait</p>
        </div>
        <button onClick={openAddModal}
          className="bg-accent hover:bg-accent-light text-coffee-900 font-bold px-4 py-2.5 rounded-xl text-xs
            flex items-center gap-2 shadow-lg shadow-accent/20 active:scale-95 transition-all">
          <FiPlus size={16} /> Tambah User
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-6 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 text-coffee-400">
                  <th className="pb-3 font-semibold">Nama</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Cabang</th>
                  <th className="pb-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3.5 font-bold text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-coffee-900 flex items-center justify-center text-accent">
                        <FiUser size={16} />
                      </div>
                      {user.nama}
                    </td>
                    <td className="py-3.5 text-coffee-300">{user.email}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase
                        ${user.role === 'owner' ? 'bg-purple-500/10 text-purple-400' : 
                          user.role === 'admin' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 text-white">
                      {user.role === 'owner' ? (
                        <span className="text-coffee-500 italic">Pusat</span>
                      ) : (
                        user.cabang?.nama_cabang || <span className="text-red-400 italic">Belum di-assign</span>
                      )}
                    </td>
                    <td className="py-3.5 text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => openEditModal(user)}
                          className="p-2 text-coffee-300 hover:text-accent bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                          <FiEdit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-400 hover:text-red-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-coffee-500">
                      <FiInfo size={32} className="mx-auto mb-3 text-coffee-600" />
                      <p className="text-sm font-semibold">Belum ada user terdaftar</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-coffee-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-[Outfit] font-extrabold text-white text-base mb-4">
              {currentUser ? 'Edit User' : 'Tambah User Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Nama Lengkap</label>
                <input type="text" value={nama} onChange={e => setNama(e.target.value)} placeholder="Contoh: Andi Wijaya"
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none" />
              </div>

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Contoh: andi@coffeesync.id"
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none" />
              </div>

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password..."
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none" />
              </div>

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)}
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none">
                  <option value="owner">Owner</option>
                  <option value="admin">Admin Cabang</option>
                  <option value="kasir">Kasir</option>
                </select>
              </div>

              {role !== 'owner' && (
                <div>
                  <label className="text-xs text-coffee-300 font-semibold mb-1 block">Cabang</label>
                  <select value={cabangId} onChange={e => setCabangId(e.target.value)}
                    className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none">
                    <option value="" disabled>Pilih cabang...</option>
                    {cabangs.map(c => (
                      <option key={c.id} value={c.id}>{c.nama_cabang}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-xl text-xs active:scale-95 transition-all">
                  Batal
                </button>
                <button type="submit"
                  className="flex-1 bg-accent hover:bg-accent-light text-coffee-900 font-bold py-2 rounded-xl text-xs active:scale-95 transition-all">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
