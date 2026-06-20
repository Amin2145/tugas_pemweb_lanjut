import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiCoffee, FiInfo, FiSearch } from 'react-icons/fi'
import { db } from '../../utils/db'
import { formatRupiah } from '../../utils/formatRupiah'

export default function ProdukPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  
  // Search & Filter
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Form State
  const [nama, setNama] = useState('')
  const [kategoriId, setKategoriId] = useState('')
  const [harga, setHarga] = useState('')
  const [status, setStatus] = useState('aktif')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [pData, cData] = await Promise.all([
        db.produk.list(),
        db.kategori.list()
      ])
      setProducts(pData)
      setCategories(cData)
    } catch (err) {
      console.error(err)
      setError('Gagal memuat data produk')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setCurrentProduct(null)
    setNama('')
    setKategoriId(categories[0]?.id || '')
    setHarga('')
    setStatus('aktif')
    setError('')
    setModalOpen(true)
  }

  const openEditModal = (prod) => {
    setCurrentProduct(prod)
    setNama(prod.nama_produk)
    setKategoriId(prod.kategori_id || '')
    setHarga(prod.harga)
    setStatus(prod.status || 'aktif')
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nama.trim()) return setError('Nama produk wajib diisi')
    if (!kategoriId) return setError('Pilih kategori produk')
    if (!harga || Number(harga) <= 0) return setError('Harga produk harus lebih dari 0')
    
    setError('')
    try {
      const payload = {
        nama_produk: nama,
        kategori_id: Number(kategoriId),
        harga: Number(harga),
        status
      }

      if (currentProduct) {
        await db.produk.update(currentProduct.id, payload)
      } else {
        await db.produk.create(payload)
      }
      setModalOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan produk')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini? Semua data stok produk ini di semua cabang juga akan terhapus.')) return
    try {
      await db.produk.delete(id)
      loadData()
    } catch (err) {
      console.error(err)
      alert('Gagal menghapus produk')
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nama_produk.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.kategori_id === Number(selectedCategory)
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-[Outfit]">Kelola Produk</h2>
          <p className="text-xs text-coffee-400">Atur katalog produk, harga, dan ketersediaan menu</p>
        </div>
        <button onClick={openAddModal}
          className="w-full sm:w-auto bg-accent hover:bg-accent-light text-coffee-900 font-bold px-4 py-2.5 rounded-xl text-xs
            flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-95 transition-all">
          <FiPlus size={16} /> Tambah Produk
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-col md:flex-row gap-4 bg-coffee-800/60 border border-white/5 rounded-2xl p-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3.5 top-3 text-coffee-500" size={16} />
          <input type="text" placeholder="Cari nama produk..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-xl py-2 pl-10 pr-4 text-xs focus:border-accent outline-none placeholder-coffee-600" />
        </div>
        <div className="w-full md:w-48">
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
            className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-xl py-2 px-3 text-xs focus:border-accent outline-none">
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nama_kategori}</option>
            ))}
          </select>
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
                  <th className="pb-3 font-semibold">Harga</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(prod => (
                  <tr key={prod.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3.5 font-bold text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-coffee-900 flex items-center justify-center text-accent">
                        <FiCoffee size={16} />
                      </div>
                      {prod.nama_produk}
                    </td>
                    <td className="py-3.5 text-coffee-300 font-semibold">{prod.kategori?.nama_kategori || 'Kategori Terhapus'}</td>
                    <td className="py-3.5 font-extrabold text-accent">{formatRupiah(prod.harga)}</td>
                    <td className="py-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase
                        ${prod.status === 'aktif' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {prod.status || 'aktif'}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => openEditModal(prod)}
                          className="p-2 text-coffee-300 hover:text-accent bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                          <FiEdit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(prod.id)}
                          className="p-2 text-red-400 hover:text-red-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-coffee-500">
                      <FiInfo size={32} className="mx-auto mb-3 text-coffee-600" />
                      <p className="text-sm font-semibold">Tidak ada produk ditemukan</p>
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
              {currentProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2.5 rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Nama Produk</label>
                <input type="text" value={nama} onChange={e => setNama(e.target.value)} placeholder="Contoh: Espresso Romano"
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none" />
              </div>

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Kategori</label>
                <select value={kategoriId} onChange={e => setKategoriId(e.target.value)}
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none">
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Harga (Rp)</label>
                <input type="number" value={harga} onChange={e => setHarga(e.target.value)} placeholder="Contoh: 25000"
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none" />
              </div>

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Status Menu</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none">
                  <option value="aktif">Aktif (Tampil di POS)</option>
                  <option value="nonaktif">Nonaktif (Sembunyikan)</option>
                </select>
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
