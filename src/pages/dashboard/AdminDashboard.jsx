import { useState, useEffect } from 'react'
import { FiPackage, FiList, FiAlertTriangle, FiTruck, FiRepeat, FiArrowRight, FiInfo } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../utils/db'
import { formatRupiah } from '../../utils/formatRupiah'
import { formatDate } from '../../utils/formatDate'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ productsCount: 0, totalStock: 0, lowStock: 0, inboundMonth: 0 })
  const [lowStocksList, setLowStocksList] = useState([])
  const [recentPurchases, setRecentPurchases] = useState([])
  const [recentMutations, setRecentMutations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [user])

  const loadDashboardStats = async () => {
    if (!user?.cabang_id) return
    setLoading(true)
    try {
      const [prodList, stokList, purchasesList, mutList] = await Promise.all([
        db.produk.list(),
        db.stok.list(user.cabang_id),
        db.pembelian.list(user.cabang_id),
        db.mutasi.list(user.cabang_id)
      ])

      const productsCount = prodList.filter(p => p.status === 'aktif').length
      const totalStock = stokList.reduce((sum, s) => sum + s.jumlah, 0)
      const lowStock = stokList.filter(s => s.jumlah <= s.minimum_stok).length
      
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const inboundMonth = purchasesList
        .filter(p => new Date(p.tanggal) >= startOfMonth)
        .reduce((sum, p) => sum + p.total, 0)

      setStats({
        productsCount,
        totalStock,
        lowStock,
        inboundMonth
      })

      // Get lists for dashboard previews
      setLowStocksList(stokList.filter(s => s.jumlah <= s.minimum_stok).slice(0, 5))
      setRecentPurchases(purchasesList.slice(0, 5))
      setRecentMutations(mutList.slice(0, 5))

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white font-[Outfit]">Dashboard Admin</h2>
          <p className="text-sm text-coffee-400">{user?.cabang?.nama_cabang || 'Cabang'}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Produk" value={stats.productsCount} icon={<FiPackage size={22} />} />
            <StatCard title="Total Item Stok" value={stats.totalStock} icon={<FiList size={22} />} />
            <StatCard title="Hampir Habis" value={stats.lowStock} icon={<FiAlertTriangle size={22} />} 
              color="bg-red-900/50" textColor="text-red-400" />
            <StatCard title="Pasokan Masuk Bulan Ini" value={formatRupiah(stats.inboundMonth)} icon={<FiTruck size={22} />} />
          </div>

          {/* Quick Actions */}
          <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white font-[Outfit] mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Kelola Produk', to: '/produk', icon: <FiPackage /> },
                { label: 'Persediaan', to: '/stok', icon: <FiList /> },
                { label: 'Supplier', to: '/supplier', icon: <FiTruck /> },
                { label: 'Mutasi Stok', to: '/mutasi', icon: <FiRepeat /> },
              ].map(action => (
                <Link key={action.to} to={action.to}
                  className="flex flex-col items-center gap-2 p-4 bg-coffee-700/30 hover:bg-coffee-700/60
                    border border-white/5 rounded-xl text-center transition-colors group">
                  <span className="text-2xl text-accent group-hover:scale-110 transition-transform">{action.icon}</span>
                  <span className="text-xs font-bold text-coffee-200">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Data Previews & Summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Low Stocks Preview */}
            <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-red-400 font-[Outfit] mb-4 flex items-center gap-2">
                  <FiAlertTriangle /> Persediaan Menipis
                </h3>
                <div className="space-y-3">
                  {lowStocksList.map((stok, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-xs font-bold text-white">{stok.produk?.nama_produk}</p>
                        <p className="text-[10px] text-coffee-500 font-semibold">{stok.produk?.kategori?.nama_kategori}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400">
                        {stok.jumlah} / {stok.minimum_stok}
                      </span>
                    </div>
                  ))}
                  {lowStocksList.length === 0 && (
                    <p className="text-xs text-coffee-500 text-center py-8 font-semibold">Semua persediaan aman</p>
                  )}
                </div>
              </div>
              
              <Link to="/stok" className="text-xs font-extrabold text-accent hover:text-accent-light flex items-center gap-1.5 mt-6 pt-3 border-t border-white/5">
                Kelola Persediaan Selengkapnya <FiArrowRight />
              </Link>
            </div>

            {/* Inbound Purchases Preview */}
            <div className="lg:col-span-2 bg-coffee-800/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-[Outfit] mb-4 flex items-center gap-2">
                  <FiTruck /> Pasokan Bahan Baku Terakhir
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-coffee-400">
                        <th className="pb-2 font-semibold">Tanggal</th>
                        <th className="pb-2 font-semibold">Supplier</th>
                        <th className="pb-2 text-right font-semibold">Total Biaya</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPurchases.map((purchase, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2.5 text-coffee-300 font-mono">{formatDate(purchase.tanggal).split(',')[0]}</td>
                          <td className="py-2.5 font-bold text-white">{purchase.supplier?.nama_supplier}</td>
                          <td className="py-2.5 text-right font-extrabold text-accent">{formatRupiah(purchase.total)}</td>
                        </tr>
                      ))}
                      {recentPurchases.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-coffee-500 font-semibold">Belum ada riwayat pembelian</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <Link to="/pembelian" className="text-xs font-extrabold text-accent hover:text-accent-light flex items-center gap-1.5 mt-6 pt-3 border-t border-white/5">
                Lihat Nota Pembelian Lengkap <FiArrowRight />
              </Link>
            </div>
          </div>

          {/* Row 4: Recent Mutations Preview */}
          <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-[Outfit] mb-4 flex items-center gap-2">
                <FiRepeat /> Aktivitas Transfer Stok Terbaru
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-coffee-400">
                      <th className="pb-2 font-semibold">Tanggal</th>
                      <th className="pb-2 font-semibold">Produk</th>
                      <th className="pb-2 font-semibold">Rute Transfer</th>
                      <th className="pb-2 text-center font-semibold">Jumlah</th>
                      <th className="pb-2 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMutations.map((mut, i) => {
                      const isOutgoing = mut.cabang_asal === user?.cabang_id
                      return (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2.5 text-coffee-300 font-mono">{formatDate(mut.tanggal).split(',')[0]}</td>
                          <td className="py-2.5 font-bold text-white">{mut.produk?.nama_produk}</td>
                          <td className="py-2.5 font-semibold text-coffee-200">
                            {isOutgoing ? (
                              <span>Ke: {mut.tujuan?.nama_cabang || `Cabang #${mut.cabang_tujuan}`}</span>
                            ) : (
                              <span>Dari: {mut.asal?.nama_cabang || `Cabang #${mut.cabang_asal}`}</span>
                            )}
                          </td>
                          <td className="py-2.5 text-center font-mono font-bold text-white">{mut.qty}</td>
                          <td className="py-2.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase
                              ${mut.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 
                                mut.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {mut.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {recentMutations.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-coffee-500 font-semibold">Belum ada aktivitas mutasi</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <Link to="/mutasi" className="text-xs font-extrabold text-accent hover:text-accent-light flex items-center gap-1.5 mt-6 pt-3 border-t border-white/5 w-max">
              Kelola Pengiriman & Mutasi Stok <FiArrowRight />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}


