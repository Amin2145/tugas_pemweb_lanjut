import { useState, useEffect } from 'react'
import { FiCheck, FiX, FiInfo, FiRefreshCw, FiArrowRight } from 'react-icons/fi'
import { db } from '../../utils/db'
import { formatDate } from '../../utils/formatDate'

export default function MutasiApprovalPage() {
  const [mutations, setMutations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeFilter, setActiveFilter] = useState('pending')

  useEffect(() => {
    loadMutations()
  }, [])

  const loadMutations = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await db.mutasi.list()
      setMutations(data)
    } catch (err) {
      console.error(err)
      setError('Gagal memuat data mutasi stok')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    if (!window.confirm('Setujui mutasi ini? Stok cabang asal akan dikurangi dan cabang tujuan akan ditambahkan.')) return
    setError('')
    setSuccess('')
    try {
      await db.mutasi.approve(id)
      setSuccess('Mutasi berhasil disetujui dan stok telah diperbarui!')
      loadMutations()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gagal menyetujui mutasi')
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Tolak pengajuan mutasi ini?')) return
    setError('')
    setSuccess('')
    try {
      await db.mutasi.reject(id)
      setSuccess('Pengajuan mutasi berhasil ditolak.')
      loadMutations()
    } catch (err) {
      console.error(err)
      setError('Gagal menolak mutasi')
    }
  }

  const filteredMutations = mutations.filter(m => {
    if (activeFilter === 'all') return true
    return m.status === activeFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white font-[Outfit]">Persetujuan Mutasi Stok</h2>
          <p className="text-xs text-coffee-400 font-medium">Setujui atau tolak transfer produk antar-cabang</p>
        </div>
        <button onClick={loadMutations} disabled={loading}
          className="bg-coffee-800 hover:bg-coffee-700 text-white font-bold p-2.5 rounded-xl text-xs active:scale-95 transition-all flex items-center gap-1.5 border border-white/5">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-3">
        {['pending', 'approved', 'rejected', 'all'].map(status => (
          <button key={status} onClick={() => setActiveFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all
              ${activeFilter === status
                ? 'bg-accent text-coffee-900 shadow-md shadow-accent/20'
                : 'bg-coffee-800/40 text-coffee-300 border border-white/5 hover:bg-white/5'}`}>
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs p-3.5 rounded-xl">
          {success}
        </div>
      )}

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
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold">Produk</th>
                  <th className="pb-3 font-semibold">Mutasi Cabang</th>
                  <th className="pb-3 font-semibold text-center">Jumlah</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  {activeFilter === 'pending' && <th className="pb-3 font-semibold text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filteredMutations.map(m => (
                  <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4 text-coffee-300 text-xs">{formatDate(m.tanggal)}</td>
                    <td className="py-4 font-bold text-white font-[Outfit]">{m.produk?.nama_produk}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="text-red-400">{m.asal?.nama_cabang || `Cabang Asal #${m.cabang_asal}`}</span>
                        <FiArrowRight className="text-coffee-500" />
                        <span className="text-green-400">{m.tujuan?.nama_cabang || `Cabang Tujuan #${m.cabang_tujuan}`}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center font-extrabold text-white">{m.qty}</td>
                    <td className="py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase
                        ${m.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 
                          m.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {m.status}
                      </span>
                    </td>
                    {activeFilter === 'pending' && (
                      <td className="py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleApprove(m.id)} title="Setujui"
                            className="p-2 text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors">
                            <FiCheck size={14} />
                          </button>
                          <button onClick={() => handleReject(m.id)} title="Tolak"
                            className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                            <FiX size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {filteredMutations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-coffee-500">
                      <FiInfo size={32} className="mx-auto mb-3 text-coffee-600" />
                      <p className="text-sm font-semibold">Tidak ada pengajuan mutasi dengan status ini</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
