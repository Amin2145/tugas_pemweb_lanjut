import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiLayers, FiInfo } from 'react-icons/fi'
import { db } from '../../utils/db'

export default function KategoriPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)
  
  // Form State
  const [nama, setNama] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const data = await db.kategori.list()
      setCategories(data)
    } catch (err) {
      console.error(err)
      setError('Gagal memuat kategori')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setCurrentCategory(null)
    setNama('')
    setError('')
    setModalOpen(true)
  }

  const openEditModal = (category) => {
    setCurrentCategory(category)
    setNama(category.nama_kategori)
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nama.trim()) return setError('Nama kategori wajib diisi')
    
    setError('')
    try {
      if (currentCategory) {
        await db.kategori.update(currentCategory.id, { nama_kategori: nama })
      } else {
        await db.kategori.create({ nama_kategori: nama })
      }
      setModalOpen(false)
      loadCategories()
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan kategori')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini? Produk dalam kategori ini akan terputus.')) return
    try {
      await db.kategori.delete(id)
      loadCategories()
    } catch (err) {
      console.error(err)
      alert('Gagal menghapus kategori')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white font-[Outfit]">Kelola Kategori</h2>
          <p className="text-xs text-coffee-400">Kelompokkan produk kopi, makanan, dan beans Anda</p>
        </div>
        <button onClick={openAddModal}
          className="bg-accent hover:bg-accent-light text-coffee-900 font-bold px-4 py-2.5 rounded-xl text-xs
            flex items-center gap-2 shadow-lg shadow-accent/20 active:scale-95 transition-all">
          <FiPlus size={16} /> Tambah Kategori
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map(cat => (
            <div key={cat.id}
              className="bg-coffee-800/60 border border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:shadow-xl transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
                  <FiLayers size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white font-[Outfit]">{cat.nama_kategori}</h3>
                  <span className="text-[10px] text-coffee-500 font-bold">ID: #{cat.id}</span>
                </div>
              </div>
              
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(cat)} title="Edit"
                  className="p-1.5 text-coffee-300 hover:text-accent bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  <FiEdit2 size={12} />
                </button>
                <button onClick={() => handleDelete(cat.id)} title="Hapus"
                  className="p-1.5 text-red-400 hover:text-red-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  <FiTrash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="col-span-full bg-coffee-800/40 border border-white/5 rounded-2xl p-12 text-center text-coffee-500">
              <FiInfo size={32} className="mx-auto mb-3 text-coffee-600" />
              <p className="text-sm font-semibold">Belum ada kategori terdaftar</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-coffee-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-[Outfit] font-extrabold text-white text-base mb-4">
              {currentCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2.5 rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Nama Kategori</label>
                <input type="text" value={nama} onChange={e => setNama(e.target.value)} placeholder="Contoh: Espresso Based"
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
