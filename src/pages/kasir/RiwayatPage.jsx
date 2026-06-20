import { useState, useEffect } from 'react'
import { FiClock, FiInfo, FiEye, FiPrinter } from 'react-icons/fi'
import { db } from '../../utils/db'
import { useAuth } from '../../context/AuthContext'
import { formatRupiah } from '../../utils/formatRupiah'
import { formatDate } from '../../utils/formatDate'

export default function RiwayatPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTx, setSelectedTx] = useState(null)

  useEffect(() => {
    loadTransactions()
  }, [user])

  const loadTransactions = async () => {
    if (!user?.cabang_id) return
    setLoading(true)
    try {
      const data = await db.transaksi.list(user.cabang_id)
      // Filter for transactions made by this specific cashier to keep it private/role-specific if desired,
      // or show all branch transactions. Let's show this cashier's transactions.
      const myTx = data.filter(t => t.kasir_id === user.id)
      setTransactions(myTx)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white font-[Outfit]">Riwayat Penjualan Saya</h2>
        <p className="text-xs text-coffee-400">Daftar transaksi penjualan yang Anda layani di {user?.cabang?.nama_cabang || 'Cabang'}</p>
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
                  <th className="pb-3 font-semibold">ID Transaksi</th>
                  <th className="pb-3 font-semibold">Waktu Penjualan</th>
                  <th className="pb-3 font-semibold">Metode Pembayaran</th>
                  <th className="pb-3 font-semibold text-right">Total Belanja</th>
                  <th className="pb-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3.5 font-bold text-accent">#{tx.id}</td>
                    <td className="py-3.5 text-coffee-300 text-xs">{formatDate(tx.tanggal)}</td>
                    <td className="py-3.5 text-coffee-400 font-bold uppercase text-xs">{tx.metode_bayar}</td>
                    <td className="py-3.5 text-right font-extrabold text-white">{formatRupiah(tx.total)}</td>
                    <td className="py-3.5 text-center">
                      <button onClick={() => setSelectedTx(tx)}
                        className="p-2 text-coffee-300 hover:text-accent bg-white/5 hover:bg-white/10 rounded-lg transition-colors inline-flex items-center gap-1 text-xs">
                        <FiEye size={12} /> Struk
                      </button>
                    </td>
                  </tr>
                ))}

                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-coffee-500">
                      <FiClock size={32} className="mx-auto mb-3 text-coffee-600" />
                      <p className="text-sm font-semibold">Anda belum mencatat transaksi hari ini</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-coffee-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div id="receipt-print" className="text-center space-y-3 font-mono text-xs text-coffee-200">
              <div>
                <h3 className="font-[Outfit] font-extrabold text-white text-lg">☕ CoffeeSync</h3>
                <p className="text-[10px] text-coffee-500">{selectedTx.cabang?.nama_cabang}</p>
                <p className="text-[10px] text-coffee-500">#{selectedTx.id}</p>
              </div>
              <div className="border-t border-dashed border-white/20 my-2" />
              <div className="text-left text-[10px] space-y-1 text-coffee-400">
                <p>Kasir: {user?.nama}</p>
                <p>Waktu: {new Date(selectedTx.tanggal).toLocaleString('id-ID')}</p>
                <p>Metode: {selectedTx.metode_bayar.toUpperCase()}</p>
              </div>
              <div className="border-t border-dashed border-white/20 my-2" />
              <div className="space-y-1.5 text-[10px]">
                {selectedTx.detail_transaksi?.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="text-left">
                      <p className="text-white font-semibold">{item.produk?.nama_produk}</p>
                      <p className="text-coffee-500">{item.qty} x {formatRupiah(item.harga)}</p>
                    </div>
                    <span className="text-white font-bold">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-white/20 my-2" />
              <div className="text-[10px] space-y-1">
                <div className="flex justify-between font-bold text-white"><span>TOTAL</span><span>{formatRupiah(selectedTx.total)}</span></div>
              </div>
              <div className="border-t border-dashed border-white/20 my-2" />
              <p className="text-accent italic text-[10px] font-semibold">Cetak Ulang Struk Belanja ☕</p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={handlePrint}
                className="flex-1 bg-coffee-700 hover:bg-coffee-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95">
                <FiPrinter size={14} /> Cetak
              </button>
              <button onClick={() => setSelectedTx(null)}
                className="flex-1 bg-accent hover:bg-accent-light text-coffee-900 font-bold py-2.5 rounded-xl text-xs active:scale-95">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
