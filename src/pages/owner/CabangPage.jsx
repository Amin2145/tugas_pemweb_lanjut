import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiPhone, FiInfo } from 'react-icons/fi'
import { db } from '../../utils/db'

export default function CabangPage() {
  const [cabangs, setCabangs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentCabang, setCurrentCabang] = useState(null)
  
  // Form State
  const [nama, setNama] = useState('')
  const [alamat, setAlamat] = useState('')
  const [telepon, setTelepon] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadCabang()
  }, [])

  const loadCabang = async () => {
    setLoading(true)
    try {
      const data = await db.cabang.list()
      setCabangs(data)
    } catch (err) {
      console.error(err)
      setError('Gagal memuat data cabang')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setCurrentCabang(null)
    setNama('')
    setAlamat('')
    setTelepon('')
    setError('')
    setModalOpen(true)
  }

  const openEditModal = (cabang) => {
    setCurrentCabang(cabang)
    setNama(cabang.nama_cabang)
    setAlamat(cabang.alamat || '')
    setTelepon(cabang.telepon || '')
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nama.trim()) return setError('Nama cabang wajib diisi')
    
    setError('')
    try {
      const payload = { nama_cabang: nama, alamat, telepon }
      if (currentCabang) {
        await db.cabang.update(currentCabang.id, payload)
      } else {
        await db.cabang.create(payload)
      }
      setModalOpen(false)
      loadCabang()
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan data cabang')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus cabang ini? Semua data stok terkait juga akan terhapus.')) return
    try {
      await db.cabang.delete(id)
      loadCabang()
    } catch (err) {
      console.error(err)
      alert('Gagal menghapus cabang')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white font-[Outfit]">Kelola Cabang</h2>
          <p className="text-xs text-coffee-400">Daftar dan manajemen seluruh cabang CoffeeSync</p>
        </div>
        <button onClick={openAddModal}
          className="bg-accent hover:bg-accent-light text-coffee-900 font-bold px-4 py-2.5 rounded-xl text-xs
            flex items-center gap-2 shadow-lg shadow-accent/20 active:scale-95 transition-all">
          <FiPlus size={16} /> Tambah Cabang
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cabangs.map(cabang => (
            <div key={cabang.id}
              className="bg-coffee-800/60 border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
                    <FiMapPin size={20} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(cabang)}
                      className="p-2 text-coffee-300 hover:text-accent bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      <FiEdit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(cabang.id)}
                      className="p-2 text-red-400 hover:text-red-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white font-[Outfit]">{cabang.nama_cabang}</h3>
                  <p className="text-xs text-coffee-400 mt-2 flex items-start gap-1.5 leading-relaxed">
                    <span className="mt-0.5"><FiMapPin size={12} className="flex-shrink-0" /></span>
                    {cabang.alamat || 'Alamat belum diatur'}
                  </p>
                  <p className="text-xs text-coffee-400 mt-1 flex items-center gap-1.5">
                    <FiPhone size={12} className="flex-shrink-0" />
                    {cabang.telepon || 'Telepon belum diatur'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-coffee-500 font-bold uppercase">
                <span>ID Cabang: #{cabang.id}</span>
                <span>Terdaftar: {new Date(cabang.created_at || Date.now()).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          ))}

          {cabangs.length === 0 && (
            <div className="col-span-full bg-coffee-800/40 border border-white/5 rounded-2xl p-12 text-center text-coffee-500">
              <FiInfo size={32} className="mx-auto mb-3 text-coffee-600" />
              <p className="text-sm font-semibold">Belum ada cabang terdaftar</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-coffee-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-[Outfit] font-extrabold text-white text-base mb-4">
              {currentCabang ? 'Edit Cabang' : 'Tambah Cabang Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2.5 rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Nama Cabang</label>
                <input type="text" value={nama} onChange={e => setNama(e.target.value)} placeholder="Contoh: CoffeeSync Dipatiukur"
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none" />
              </div>

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Alamat</label>
                <textarea value={alamat} onChange={e => setAlamat(e.target.value)} placeholder="Alamat lengkap cabang..." rows={3}
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none" />
              </div>

              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Telepon</label>
                <input type="text" value={telepon} onChange={e => setTelepon(e.target.value)} placeholder="Contoh: 081234567890"
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
