import { useState, useEffect } from 'react'
import { FiPlus, FiInfo, FiRepeat, FiArrowRight, FiCheck } from 'react-icons/fi'
import { db } from '../../utils/db'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatDate'

export default function MutasiPage() {
  const { user } = useAuth()
  const [mutations, setMutations] = useState([])
  const [cabangs, setCabangs] = useState([])
  const [products, setProducts] = useState([])
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // Form State
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedTujuan, setSelectedTujuan] = useState('')
  const [qty, setQty] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user?.cabang_id) return
    setLoading(true)
    try {
      const [mData, cData, pData, sData] = await Promise.all([
        db.mutasi.list(user.cabang_id),
        db.cabang.list(),
        db.produk.list(),
        db.stok.list(user.cabang_id)
      ])
      setMutations(mData)
      setCabangs(cData.filter(c => c.id !== user.cabang_id)) // other branches
      setProducts(pData.filter(p => p.status === 'aktif'))
      setStocks(sData)
      if (pData.length > 0) setSelectedProduct(pData[0].id)
      if (cData.length > 1) {
        const other = cData.find(c => c.id !== user.cabang_id)
        if (other) setSelectedTujuan(other.id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return setError('Pilih produk')
    if (!selectedTujuan) return setError('Pilih cabang tujuan')
    if (!qty || Number(qty) <= 0) return setError('Jumlah mutasi tidak valid')

    // Validate local stock limit
    const localStock = stocks.find(s => s.produk_id === Number(selectedProduct))
    if (!localStock || localStock.jumlah < Number(qty)) {
      return setError(`Stok lokal tidak mencukupi! Stok saat ini: ${localStock ? localStock.jumlah : 0}`)
    }

    setError('')
    try {
      await db.mutasi.create({
        produk_id: Number(selectedProduct),
        cabang_asal: user.cabang_id,
        cabang_tujuan: Number(selectedTujuan),
        qty: Number(qty)
      })
      setModalOpen(false)
      setQty(1)
      loadData()
    } catch (err) {
      console.error(err)
      setError('Gagal mengajukan mutasi stok')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white font-[Outfit]">Mutasi Stok Cabang</h2>
          <p className="text-xs text-coffee-400">Kirim pasokan produk berlebih Anda ke cabang mitra yang menipis</p>
        </div>
        <button onClick={() => { setError(''); setModalOpen(true); }}
          className="bg-accent hover:bg-accent-light text-coffee-900 font-bold px-4 py-2.5 rounded-xl text-xs
            flex items-center gap-2 shadow-lg shadow-accent/20 active:scale-95 transition-all">
          <FiPlus size={16} /> Ajukan Mutasi
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-white font-[Outfit] mb-4">Riwayat Mutasi Stok</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 text-coffee-400">
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold">Produk</th>
                  <th className="pb-3 font-semibold">Rute Mutasi</th>
                  <th className="pb-3 font-semibold text-center">Jumlah</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {mutations.map(m => {
                  const isOutgoing = m.cabang_asal === user?.cabang_id
                  return (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 text-coffee-300 text-xs">{formatDate(m.tanggal)}</td>
                      <td className="py-4 font-bold text-white font-[Outfit]">{m.produk?.nama_produk}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className={isOutgoing ? 'text-red-400 font-bold' : 'text-coffee-300'}>
                            {m.asal?.nama_cabang || `Cabang #${m.cabang_asal}`}
                          </span>
                          <FiArrowRight className="text-coffee-500" />
                          <span className={!isOutgoing ? 'text-green-400 font-bold' : 'text-coffee-300'}>
                            {m.tujuan?.nama_cabang || `Cabang #${m.cabang_tujuan}`}
                          </span>
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
                    </tr>
                  )
                })}

                {mutations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-coffee-500">
                      <FiRepeat size={32} className="mx-auto mb-3 text-coffee-600" />
                      <p className="text-sm font-semibold">Belum ada riwayat mutasi stok</p>
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
              Ajukan Mutasi Stok
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Pilih Produk</label>
                <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none">
                  {products.map(p => {
                    const localStock = stocks.find(s => s.produk_id === p.id)
                    const stockQty = localStock ? localStock.jumlah : 0
                    return (
                      <option key={p.id} value={p.id}>{p.nama_produk} (Stok lokal: {stockQty})</option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Cabang Tujuan</label>
                <select value={selectedTujuan} onChange={e => setSelectedTujuan(e.target.value)}
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none">
                  {cabangs.map(c => (
                    <option key={c.id} value={c.id}>{c.nama_cabang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Jumlah Mutasi (Qty)</label>
                <input type="number" value={qty} onChange={e => setQty(e.target.value)} min={1}
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none" />
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-xl text-xs active:scale-95 transition-all">
                  Batal
                </button>
                <button type="submit"
                  className="flex-1 bg-accent hover:bg-accent-light text-coffee-900 font-bold py-2.5 rounded-xl text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5">
                  <FiCheck size={14} /> Ajukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
