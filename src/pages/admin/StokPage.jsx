import { useState, useEffect } from 'react'
import { FiEdit2, FiInfo, FiSearch, FiAlertTriangle, FiCheck } from 'react-icons/fi'
import { db } from '../../utils/db'
import { useAuth } from '../../context/AuthContext'

export default function StokPage() {
  const { user } = useAuth()
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentStok, setCurrentStok] = useState(null)
  
  // Search
  const [search, setSearch] = useState('')

  // Form State
  const [jumlah, setJumlah] = useState('')
  const [minStok, setMinStok] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadStok()
  }, [user])

  const loadStok = async () => {
    if (!user?.cabang_id) return
    setLoading(true)
    try {
      const data = await db.stok.list(user.cabang_id)
      setStocks(data)
    } catch (err) {
      console.error(err)
      setError('Gagal memuat persediaan stok')
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (stok) => {
    setCurrentStok(stok)
    setJumlah(stok.jumlah)
    setMinStok(stok.minimum_stok)
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (jumlah === '' || Number(jumlah) < 0) return setError('Jumlah stok tidak valid')
    if (minStok === '' || Number(minStok) < 0) return setError('Minimum stok tidak valid')

    setError('')
    try {
      await db.stok.update(currentStok.id, {
        jumlah: Number(jumlah),
        minimum_stok: Number(minStok)
      })
      setModalOpen(false)
      loadStok()
    } catch (err) {
      console.error(err)
      setError('Gagal memperbarui stok')
    }
  }

  const filteredStocks = stocks.filter(s => 
    s.produk?.nama_produk?.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockCount = stocks.filter(s => s.jumlah <= s.minimum_stok).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-[Outfit]">Persediaan Stok Cabang</h2>
          <p className="text-xs text-coffee-400">Monitoring & penyesuaian stok produk di {user?.cabang?.nama_cabang || 'Cabang'}</p>
        </div>
        
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-bold">
            <FiAlertTriangle size={14} />
            <span>{lowStockCount} Produk Menipis!</span>
          </div>
        )}
      </div>

      {/* Search Panel */}
      <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-4 flex">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3.5 top-3 text-coffee-500" size={16} />
          <input type="text" placeholder="Cari produk di persediaan..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-xl py-2 pl-10 pr-4 text-xs focus:border-accent outline-none placeholder-coffee-600" />
        </div>
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
                  <th className="pb-3 font-semibold">Nama Produk</th>
                  <th className="pb-3 font-semibold">Kategori</th>
                  <th className="pb-3 font-semibold text-center">Jumlah Stok</th>
                  <th className="pb-3 font-semibold text-center">Min. Stok</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map(stok => {
                  const isLow = stok.jumlah <= stok.minimum_stok
                  return (
                    <tr key={stok.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3.5 font-bold text-white font-[Outfit]">{stok.produk?.nama_produk}</td>
                      <td className="py-3.5 text-coffee-300 font-semibold">{stok.produk?.kategori?.nama_kategori}</td>
                      <td className="py-3.5 text-center font-mono font-extrabold text-white">{stok.jumlah}</td>
                      <td className="py-3.5 text-center font-mono text-coffee-400">{stok.minimum_stok}</td>
                      <td className="py-3.5 text-center">
                        {isLow ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 flex items-center justify-center gap-1 w-max mx-auto">
                            <FiAlertTriangle size={10} /> Menipis
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 flex items-center justify-center gap-1 w-max mx-auto">
                            <FiCheck size={10} /> Aman
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-center">
                        <button onClick={() => openEditModal(stok)} title="Update Stok"
                          className="p-2 text-coffee-300 hover:text-accent bg-white/5 hover:bg-white/10 rounded-lg transition-colors mx-auto block">
                          <FiEdit2 size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {filteredStocks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-coffee-500">
                      <FiInfo size={32} className="mx-auto mb-3 text-coffee-600" />
                      <p className="text-sm font-semibold">Persediaan kosong</p>
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
          <div className="bg-coffee-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-[Outfit] font-extrabold text-white text-base mb-1">
              Update Stok Menu
            </h3>
            <p className="text-xs text-coffee-400 mb-4">{currentStok?.produk?.nama_produk}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2.5 rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Jumlah Stok Saat Ini</label>
                <input type="number" value={jumlah} onChange={e => setJumlah(e.target.value)} placeholder="0"
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none" />
              </div>

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Minimum Stok (Peringatan)</label>
                <input type="number" value={minStok} onChange={e => setMinStok(e.target.value)} placeholder="10"
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none" />
              </div>

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
