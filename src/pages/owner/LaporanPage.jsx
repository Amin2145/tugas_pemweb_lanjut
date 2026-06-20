import { useState, useEffect } from 'react'
import { FiCalendar, FiDownload, FiFilter, FiBarChart2, FiDollarSign, FiShoppingBag, FiLayers } from 'react-icons/fi'
import { db } from '../../utils/db'
import { formatRupiah } from '../../utils/formatRupiah'
import { formatDate } from '../../utils/formatDate'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function LaporanPage() {
  const [transactions, setTransactions] = useState([])
  const [cabangs, setCabangs] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedCabang, setSelectedCabang] = useState('all')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30) // Default last 30 days
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadCabangs()
  }, [])

  useEffect(() => {
    loadData()
  }, [selectedCabang, startDate, endDate])

  const loadCabangs = async () => {
    try {
      const data = await db.cabang.list()
      setCabangs(data)
    } catch (err) {
      console.error('Failed to load branches', err)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const cabId = selectedCabang === 'all' ? null : Number(selectedCabang)
      const rawData = await db.transaksi.list(cabId)

      // Filter by date range client-side to ensure accuracy
      const filtered = rawData.filter(t => {
        const tDate = t.tanggal.split('T')[0]
        return tDate >= startDate && tDate <= endDate
      })

      setTransactions(filtered)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Stats calculators
  const totalSales = transactions.reduce((sum, t) => sum + Number(t.total), 0)
  const transactionCount = transactions.length
  const averageSales = transactionCount > 0 ? totalSales / transactionCount : 0

  // Export PDF function
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()
      doc.setFont("helvetica", "bold")
      doc.setFontSize(18)
      doc.setTextColor(78, 52, 46) // coffee-800
      doc.text("Laporan Penjualan CoffeeSync", 14, 20)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      
      const cabangText = selectedCabang === 'all' 
        ? 'Semua Cabang' 
        : cabangs.find(c => c.id === Number(selectedCabang))?.nama_cabang || ''
      
      doc.text(`Filter Cabang: ${cabangText}`, 14, 28)
      doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 34)
      doc.text(`Total Penjualan: Rp ${totalSales.toLocaleString('id-ID')}`, 14, 40)
      doc.text(`Jumlah Transaksi: ${transactionCount}`, 14, 46)

      const tableRows = transactions.map(t => [
        `#${t.id}`,
        new Date(t.tanggal).toLocaleString('id-ID'),
        t.cabang?.nama_cabang || `Cabang #${t.cabang_id}`,
        t.kasir?.nama || 'Kasir',
        t.metode_bayar.toUpperCase(),
        `Rp ${Number(t.total).toLocaleString('id-ID')}`
      ])

      doc.autoTable({
        startY: 52,
        head: [['ID Transaksi', 'Tanggal', 'Cabang', 'Kasir', 'Metode Bayar', 'Total']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [78, 52, 46] }, // coffee-800
        styles: { fontSize: 8 },
        columnStyles: { 5: { halign: 'right' } }
      })

      doc.save(`coffeesync_laporan_${startDate}_to_${endDate}.pdf`)
    } catch (err) {
      console.error(err)
      alert('Gagal mengekspor PDF')
    }
  }

  // Export Excel function
  const handleExportExcel = () => {
    try {
      const dataToExport = transactions.map(t => ({
        'ID Transaksi': t.id,
        'Tanggal': new Date(t.tanggal).toLocaleString('id-ID'),
        'Cabang': t.cabang?.nama_cabang || `Cabang #${t.cabang_id}`,
        'Kasir': t.kasir?.nama || '',
        'Metode Bayar': t.metode_bayar.toUpperCase(),
        'Total (Rp)': Number(t.total)
      }))

      const ws = XLSX.utils.json_to_sheet(dataToExport)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan")
      
      // Auto width
      const maxColWidth = Object.keys(dataToExport[0] || {}).map(key => 
        Math.max(key.length, ...dataToExport.map(item => String(item[key]).length)) + 3
      )
      ws['!cols'] = maxColWidth.map(w => ({ wth: w }))

      XLSX.writeFile(wb, `coffeesync_laporan_${startDate}_to_${endDate}.xlsx`)
    } catch (err) {
      console.error(err)
      alert('Gagal mengekspor Excel')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-[Outfit]">Laporan Penjualan</h2>
          <p className="text-xs text-coffee-400">Analisis kinerja bisnis dan rekap transaksi terpusat</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={handleExportPDF} disabled={transactions.length === 0}
            className="flex-1 sm:flex-initial bg-coffee-800 hover:bg-coffee-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs
              flex items-center justify-center gap-2 border border-white/5 active:scale-95 transition-all disabled:opacity-50">
            <FiDownload size={14} /> PDF
          </button>
          <button onClick={handleExportExcel} disabled={transactions.length === 0}
            className="flex-1 sm:flex-initial bg-accent hover:bg-accent-light text-coffee-900 font-bold px-4 py-2.5 rounded-xl text-xs
              flex items-center justify-center gap-2 shadow-lg shadow-accent/10 active:scale-95 transition-all disabled:opacity-50">
            <FiDownload size={14} /> Excel
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-5 shadow-lg">
        <h3 className="text-xs font-bold text-coffee-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <FiFilter /> Filter Laporan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-coffee-300 font-semibold mb-1 block">Cabang</label>
            <select value={selectedCabang} onChange={e => setSelectedCabang(e.target.value)}
              className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none">
              <option value="all">Semua Cabang</option>
              {cabangs.map(c => (
                <option key={c.id} value={c.id}>{c.nama_cabang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-coffee-300 font-semibold mb-1 block">Tanggal Mulai</label>
            <div className="relative">
              <FiCalendar className="absolute right-3.5 top-2.5 text-coffee-500" size={14} />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 pl-3 pr-10 text-xs focus:border-accent outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs text-coffee-300 font-semibold mb-1 block">Tanggal Akhir</label>
            <div className="relative">
              <FiCalendar className="absolute right-3.5 top-2.5 text-coffee-500" size={14} />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 pl-3 pr-10 text-xs focus:border-accent outline-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-accent/10 text-accent rounded-2xl">
            <FiDollarSign size={24} />
          </div>
          <div>
            <p className="text-[11px] text-coffee-400 font-bold uppercase">Total Penjualan</p>
            <p className="text-lg font-extrabold text-white mt-0.5">{formatRupiah(totalSales)}</p>
          </div>
        </div>

        <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
            <FiShoppingBag size={24} />
          </div>
          <div>
            <p className="text-[11px] text-coffee-400 font-bold uppercase">Jumlah Transaksi</p>
            <p className="text-lg font-extrabold text-white mt-0.5">{transactionCount} Transaksi</p>
          </div>
        </div>

        <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-400 rounded-2xl">
            <FiLayers size={24} />
          </div>
          <div>
            <p className="text-[11px] text-coffee-400 font-bold uppercase">Rata-Rata Transaksi</p>
            <p className="text-lg font-extrabold text-white mt-0.5">{formatRupiah(averageSales)}</p>
          </div>
        </div>
      </div>

      {/* Table Panel */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-white font-[Outfit] mb-4">Detail Rekap Transaksi</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 text-coffee-400">
                  <th className="pb-3 font-semibold">ID</th>
                  <th className="pb-3 font-semibold">Waktu</th>
                  <th className="pb-3 font-semibold">Cabang</th>
                  <th className="pb-3 font-semibold">Kasir</th>
                  <th className="pb-3 font-semibold">Metode</th>
                  <th className="pb-3 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 font-bold text-accent">#{t.id}</td>
                    <td className="py-3 text-coffee-300 text-xs">{formatDate(t.tanggal)}</td>
                    <td className="py-3 text-white font-semibold">{t.cabang?.nama_cabang || `Cabang #${t.cabang_id}`}</td>
                    <td className="py-3 text-coffee-300">{t.kasir?.nama || 'Kasir'}</td>
                    <td className="py-3 text-coffee-300 uppercase text-xs font-bold">{t.metode_bayar}</td>
                    <td className="py-3 text-right font-extrabold text-white">{formatRupiah(t.total)}</td>
                  </tr>
                ))}

                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-coffee-500">
                      <FiBarChart2 size={32} className="mx-auto mb-3 text-coffee-600" />
                      <p className="text-sm font-semibold">Tidak ada transaksi ditemukan pada periode ini</p>
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
