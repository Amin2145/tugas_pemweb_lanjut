import { useState, useEffect, useRef } from 'react'
import { FiDollarSign, FiTrendingUp, FiMapPin, FiPackage, FiUsers, FiAlertTriangle, FiFilter } from 'react-icons/fi'
import { Chart, registerables } from 'chart.js'
import StatCard from '../../components/StatCard'
import { formatRupiah } from '../../utils/formatRupiah'
import { formatDate } from '../../utils/formatDate'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../utils/db'

Chart.register(...registerables)

export default function OwnerDashboard() {
  const { theme } = useAuth()
  const [selectedCabang, setSelectedCabang] = useState('all')
  const [cabangs, setCabangs] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Raw Data Store
  const [allData, setAllData] = useState({
    transactions: [],
    branches: [],
    products: [],
    users: [],
    stocks: []
  })

  // Aggregated Visual States
  const [stats, setStats] = useState({ todaySales: 0, monthSales: 0, cabangCount: 0, produkCount: 0, userCount: 0, lowStockCount: 0 })
  const [transactions, setTransactions] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [branchSales, setBranchSales] = useState([])
  const [categorySales, setCategorySales] = useState([])
  
  // Interactive Modal State
  const [activeTxDetails, setActiveTxDetails] = useState(null)

  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const chartDonutRef = useRef(null)
  const chartDonutInstance = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [txAll, cabang, produk, users, stokData] = await Promise.all([
        db.transaksi.list(),
        db.cabang.list(),
        db.produk.list(),
        db.users.list(),
        db.stok.list()
      ])

      setCabangs(cabang || [])
      setAllData({
        transactions: txAll || [],
        branches: cabang || [],
        products: produk || [],
        users: users || [],
        stocks: stokData || []
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filter & Aggregation Engine
  useEffect(() => {
    const { transactions: txAll, branches, products, users, stocks } = allData
    if (branches.length === 0) return

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const isAll = selectedCabang === 'all'
    const cabIdNum = Number(selectedCabang)

    // Filtered arrays
    const txFiltered = isAll ? txAll : txAll.filter(t => t.cabang_id === cabIdNum)
    const stockFiltered = isAll ? stocks : stocks.filter(s => s.cabang_id === cabIdNum)

    // Compute stats cards
    const todaySales = txFiltered.filter(t => t.tanggal >= startOfDay).reduce((s, t) => s + Number(t.total), 0)
    const monthSales = txFiltered.filter(t => t.tanggal >= startOfMonth).reduce((s, t) => s + Number(t.total), 0)
    const lowStockItems = stockFiltered.filter(s => s.jumlah <= s.minimum_stok)

    setStats({
      todaySales,
      monthSales,
      cabangCount: branches.length,
      produkCount: products.filter(p => p.status === 'aktif').length,
      userCount: users.length,
      lowStockCount: lowStockItems.length
    })

    // Show 10 most recent transactions for display
    setTransactions(txFiltered.slice(0, 10))

    // Low stock mapping
    setLowStock(lowStockItems.map(s => ({
      nama_produk: s.produk?.nama_produk,
      nama_cabang: s.cabang?.nama_cabang || `Cabang #${s.cabang_id}`,
      jumlah: s.jumlah,
      minimum_stok: s.minimum_stok
    })))

    // Category Sales Pie aggregation
    const catMap = {}
    txFiltered.forEach(tx => {
      (tx.detail_transaksi || []).forEach(d => {
        const catName = d.produk?.kategori?.nama_kategori || 'Espresso Based'
        catMap[catName] = (catMap[catName] || 0) + Number(d.subtotal || 0)
      })
    })
    setCategorySales(Object.entries(catMap).map(([nama, total]) => ({ nama, total })))

    // Branch Sales (Bar chart) data mapping
    if (isAll) {
      // Comparison chart: sales per branch
      const bs = branches.map(c => ({
        nama: c.nama_cabang,
        total: txAll.filter(t => t.cabang_id === c.id).reduce((s, t) => s + Number(t.total), 0)
      }))
      setBranchSales(bs)
    } else {
      // Branch selected: daily sales trend of the last 7 days for that branch
      const trend = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dStr = d.toISOString().split('T')[0]

        const dailySum = txAll
          .filter(t => t.cabang_id === cabIdNum && t.tanggal.split('T')[0] === dStr)
          .reduce((sum, t) => sum + Number(t.total), 0)

        const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
        trend.push({ nama: label, total: dailySum })
      }
      setBranchSales(trend)
    }

  }, [allData, selectedCabang])

  // Bar Chart (Sales per Branch OR Branch Daily Trend)
  useEffect(() => {
    if (!chartRef.current || branchSales.length === 0) return
    if (chartInstance.current) chartInstance.current.destroy()

    const labelColor = theme === 'dark' ? '#E4D8CD' : '#5D4037'
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
    const isTrend = selectedCabang !== 'all'

    // Colors
    const bgColors = isTrend 
      ? 'rgba(6, 182, 212, 0.75)' // single cyan gradient for daily trend
      : [
          'rgba(6, 182, 212, 0.75)',  // Cyan (Bandung)
          'rgba(236, 72, 153, 0.75)',  // Hot Pink (Jakarta)
          'rgba(245, 158, 11, 0.75)',   // Amber (Surabaya)
          'rgba(16, 185, 129, 0.75)',  // Emerald (Yogyakarta)
          'rgba(168, 85, 247, 0.75)'   // Purple (Medan)
        ]
    const borderColors = isTrend
      ? '#06B6D4'
      : ['#06B6D4', '#EC4899', '#F59E0B', '#10B981', '#A855F7']

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: branchSales.map(b => b.nama.replace('CoffeeSync ', '')),
        datasets: [{
          label: isTrend ? 'Penjualan Harian' : 'Total Penjualan',
          data: branchSales.map(b => b.total),
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { 
            grid: { color: gridColor }, 
            ticks: { color: labelColor, font: { weight: '600' }, callback: v => formatRupiah(v) } 
          },
          x: { 
            grid: { display: false }, 
            ticks: { color: labelColor, font: { weight: '600' } } 
          }
        }
      }
    })

    return () => { if (chartInstance.current) chartInstance.current.destroy() }
  }, [branchSales, theme, selectedCabang])

  // Doughnut Chart (Category Sales)
  useEffect(() => {
    if (!chartDonutRef.current || categorySales.length === 0) return
    if (chartDonutInstance.current) chartDonutInstance.current.destroy()

    const labelColor = theme === 'dark' ? '#E4D8CD' : '#5D4037'

    chartDonutInstance.current = new Chart(chartDonutRef.current, {
      type: 'doughnut',
      data: {
        labels: categorySales.map(c => c.nama),
        datasets: [{
          data: categorySales.map(c => c.total),
          backgroundColor: [
            'rgba(168, 85, 247, 0.75)', // Purple
            'rgba(99, 102, 241, 0.75)',  // Indigo
            'rgba(6, 182, 212, 0.75)',   // Cyan
            'rgba(16, 185, 129, 0.75)',  // Emerald
            'rgba(245, 158, 11, 0.75)',   // Amber
            'rgba(236, 72, 153, 0.75)'   // Pink
          ],
          borderColor: [
            '#A855F7',
            '#6366F1',
            '#06B6D4',
            '#10B981',
            '#F59E0B',
            '#EC4899'
          ],
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: labelColor, font: { size: 10, weight: '600' } }
          }
        }
      }
    })

    return () => { if (chartDonutInstance.current) chartDonutInstance.current.destroy() }
  }, [categorySales, theme])

  const getPaymentBadge = (method) => {
    const cleanMethod = String(method).toLowerCase()
    if (cleanMethod === 'tunai') {
      return 'bg-green-500/10 text-green-400 border border-green-500/20'
    } else if (cleanMethod === 'qris') {
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
    } else {
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-[Outfit]">Dashboard Owner</h2>
          <p className="text-xs text-coffee-400">Analisis bisnis terintegrasi untuk seluruh jaringan CoffeeSync</p>
        </div>
        
        {/* Branch Filter dropdown */}
        <div className="flex items-center gap-2 bg-coffee-800/40 border border-white/5 rounded-xl py-1.5 px-3">
          <FiFilter className="text-accent" size={16} />
          <span className="text-xs font-semibold text-coffee-300">Filter Cabang:</span>
          <select value={selectedCabang} onChange={e => setSelectedCabang(e.target.value)}
            className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer focus:text-accent">
            <option value="all" className="bg-coffee-800 text-white">Semua Cabang</option>
            {cabangs.map(c => (
              <option key={c.id} value={c.id} className="bg-coffee-800 text-white">{c.nama_cabang}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard title="Penjualan Hari Ini" value={formatRupiah(stats.todaySales)} />
            <StatCard title="Penjualan Bulan Ini" value={formatRupiah(stats.monthSales)} />
            <StatCard title="Total Cabang" value={stats.cabangCount} icon={<FiMapPin size={22} />} />
            <StatCard title="Total Produk" value={stats.produkCount} icon={<FiPackage size={22} />} />
            <StatCard title="Total User" value={stats.userCount} icon={<FiUsers size={22} />} />
            <StatCard title="Stok Menipis" value={stats.lowStockCount} icon={<FiAlertTriangle size={22} />}
              color="bg-red-900/50" textColor="text-red-400" />
          </div>

          {/* Row 2: Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <h3 className="text-base font-bold text-white font-[Outfit] mb-4">
                {selectedCabang === 'all' ? 'Penjualan per Cabang' : 'Tren Penjualan (7 Hari Terakhir)'}
              </h3>
              <div className="h-64"><canvas ref={chartRef} /></div>
            </div>

            <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <h3 className="text-base font-bold text-white font-[Outfit] mb-4">Kategori Terlaris (Kontribusi Omset)</h3>
              <div className="h-64"><canvas ref={chartDonutRef} /></div>
            </div>
          </div>

          {/* Row 3: Low Stock & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Low Stock List */}
            <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-red-400 font-[Outfit] mb-4 flex items-center gap-2">
                  <FiAlertTriangle /> Stok Menipis
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {lowStock.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{item.nama_produk}</p>
                        <p className="text-[10px] text-coffee-500 font-semibold">{item.nama_cabang}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">
                        {item.jumlah}/{item.minimum_stok}
                      </span>
                    </div>
                  ))}
                  {lowStock.length === 0 && <p className="text-xs text-coffee-500 text-center py-8 font-semibold">Semua stok aman</p>}
                </div>
              </div>
            </div>

            {/* 10 Recent Transactions */}
            <div className="lg:col-span-2 bg-coffee-800/60 border border-white/5 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white font-[Outfit] mb-4">10 Transaksi Terakhir</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-coffee-400">
                      <th className="pb-3 font-semibold">ID</th>
                      <th className="pb-3 font-semibold">Tanggal</th>
                      <th className="pb-3 font-semibold">Cabang</th>
                      <th className="pb-3 font-semibold text-center">Metode</th>
                      <th className="pb-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id} onClick={() => setActiveTxDetails(tx)}
                        className="border-b border-white/5 hover:bg-white/5 cursor-pointer active:bg-white/10 transition-colors">
                        <td className="py-3 font-bold text-accent">#{tx.id}</td>
                        <td className="py-3 text-coffee-300">{formatDate(tx.tanggal)}</td>
                        <td className="py-3 text-white font-semibold">{tx.cabang?.nama_cabang || `Cabang #${tx.cabang_id}`}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${getPaymentBadge(tx.metode_bayar)}`}>
                            {tx.metode_bayar}
                          </span>
                        </td>
                        <td className="py-3 text-right font-extrabold text-white">{formatRupiah(tx.total)}</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-coffee-500 font-semibold">Belum ada transaksi</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Transaction Details Modal */}
      {activeTxDetails && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-coffee-800/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setActiveTxDetails(null)}
              className="absolute right-4 top-4 p-2 text-coffee-400 hover:text-white rounded-lg hover:bg-white/5 active:scale-95 transition-all">
              ✕
            </button>
            <div className="text-center space-y-3 font-mono text-xs text-coffee-200">
              <div className="pt-2">
                <h3 className="font-[Outfit] font-extrabold text-white text-lg">☕ Detail Transaksi</h3>
                <p className="text-[10px] text-coffee-500">{activeTxDetails.cabang?.nama_cabang}</p>
                <p className="text-[10px] text-coffee-400 font-bold">#{activeTxDetails.id}</p>
              </div>
              <div className="border-t border-dashed border-white/20 my-2" />
              <div className="text-left text-[10px] space-y-1 text-coffee-400">
                <p><span className="font-semibold text-coffee-300">Kasir:</span> {activeTxDetails.kasir?.nama || 'Kasir'}</p>
                <p><span className="font-semibold text-coffee-300">Waktu:</span> {new Date(activeTxDetails.tanggal).toLocaleString('id-ID')}</p>
                <p><span className="font-semibold text-coffee-300">Metode:</span> <span className="uppercase text-accent font-bold">{activeTxDetails.metode_bayar}</span></p>
              </div>
              <div className="border-t border-dashed border-white/20 my-2" />
              <div className="space-y-1.5 text-[10px]">
                {(activeTxDetails.detail_transaksi || []).map(item => (
                  <div key={item.id} className="flex justify-between">
                    <div className="text-left">
                      <p className="text-white font-semibold">{item.produk?.nama_produk || 'Produk'}</p>
                      <p className="text-coffee-500">{item.qty} x {formatRupiah(item.harga)}</p>
                    </div>
                    <span className="text-white font-bold">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-white/20 my-2" />
              <div className="text-[10px] space-y-1">
                <div className="flex justify-between font-bold text-white text-sm">
                  <span>TOTAL</span>
                  <span className="text-accent">{formatRupiah(activeTxDetails.total)}</span>
                </div>
              </div>
              <div className="border-t border-dashed border-white/20 my-2" />
              <p className="text-accent italic text-[10px] font-semibold">CoffeeSync POS Ledger ☕</p>
            </div>
            <button onClick={() => setActiveTxDetails(null)}
              className="mt-6 w-full bg-accent hover:bg-accent-light text-coffee-900 font-extrabold py-3 rounded-xl active:scale-[0.98] transition-all">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
