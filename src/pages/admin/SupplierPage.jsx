import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiTruck, FiPhone, FiMapPin, FiInfo, FiSearch } from 'react-icons/fi'
import { db } from '../../utils/db'

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentSupplier, setCurrentSupplier] = useState(null)
  
  // Search
  const [search, setSearch] = useState('')

  // Form State
  const [nama, setNama] = useState('')
  const [telepon, setTelepon] = useState('')
  const [alamat, setAlamat] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    setLoading(true)
    try {
      const data = await db.supplier.list()
      setSuppliers(data)
    } catch (err) {
      console.error(err)
      setError('Gagal memuat supplier')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setCurrentSupplier(null)
    setNama('')
    setTelepon('')
    setAlamat('')
    setError('')
    setModalOpen(true)
  }

  const openEditModal = (sup) => {
    setCurrentSupplier(sup)
    setNama(sup.nama_supplier)
    setTelepon(sup.telepon || '')
    setAlamat(sup.alamat || '')
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nama.trim()) return setError('Nama supplier wajib diisi')
    
    setError('')
    try {
      const payload = { nama_supplier: nama, telepon, alamat }
      if (currentSupplier) {
        await db.supplier.update(currentSupplier.id, payload)
      } else {
        await db.supplier.create(payload)
      }
      setModalOpen(false)
      loadSuppliers()
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan supplier')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus supplier ini?')) return
    try {
      await db.supplier.delete(id)
      loadSuppliers()
    } catch (err) {
      console.error(err)
      alert('Gagal menghapus supplier')
    }
  }

  const filteredSuppliers = suppliers.filter(s => 
    s.nama_supplier.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-[Outfit]">Kelola Supplier</h2>
          <p className="text-xs text-coffee-400">Daftar mitra supplier bahan baku dan produk</p>
        </div>
        <button onClick={openAddModal}
          className="w-full sm:w-auto bg-accent hover:bg-accent-light text-coffee-900 font-bold px-4 py-2.5 rounded-xl text-xs
            flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-95 transition-all">
          <FiPlus size={16} /> Tambah Supplier
        </button>
      </div>

      {/* Search Panel */}
      <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-4 flex">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3.5 top-3 text-coffee-500" size={16} />
          <input type="text" placeholder="Cari nama supplier..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-xl py-2 pl-10 pr-4 text-xs focus:border-accent outline-none placeholder-coffee-600" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map(sup => (
            <div key={sup.id}
              className="bg-coffee-800/60 border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
                    <FiTruck size={20} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(sup)}
                      className="p-2 text-coffee-300 hover:text-accent bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      <FiEdit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(sup.id)}
                      className="p-2 text-red-400 hover:text-red-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white font-[Outfit]">{sup.nama_supplier}</h3>
                  <p className="text-xs text-coffee-400 mt-2 flex items-start gap-1.5 leading-relaxed">
                    <span className="mt-0.5"><FiMapPin size={12} className="flex-shrink-0" /></span>
                    {sup.alamat || 'Alamat tidak dicantumkan'}
                  </p>
                  <p className="text-xs text-coffee-400 mt-1 flex items-center gap-1.5">
                    <FiPhone size={12} className="flex-shrink-0" />
                    {sup.telepon || 'Telepon tidak dicantumkan'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-coffee-500 font-bold uppercase">
                ID Supplier: #{sup.id}
              </div>
            </div>
          ))}

          {filteredSuppliers.length === 0 && (
            <div className="col-span-full bg-coffee-800/40 border border-white/5 rounded-2xl p-12 text-center text-coffee-500">
              <FiInfo size={32} className="mx-auto mb-3 text-coffee-600" />
              <p className="text-sm font-semibold">Belum ada supplier terdaftar</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-coffee-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-[Outfit] font-extrabold text-white text-base mb-4">
              {currentSupplier ? 'Edit Supplier' : 'Tambah Supplier Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2.5 rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Nama Supplier</label>
                <input type="text" value={nama} onChange={e => setNama(e.target.value)} placeholder="Contoh: PT Kopi Indonesia"
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none" />
              </div>

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Alamat</label>
                <textarea value={alamat} onChange={e => setAlamat(e.target.value)} placeholder="Alamat lengkap supplier..." rows={3}
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none" />
              </div>

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Telepon</label>
                <input type="text" value={telepon} onChange={e => setTelepon(e.target.value)} placeholder="Contoh: 0811999888"
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
