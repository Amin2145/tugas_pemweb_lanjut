import { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiInfo, FiShoppingBag, FiCheck } from 'react-icons/fi'
import { db } from '../../utils/db'
import { useAuth } from '../../context/AuthContext'
import { formatRupiah } from '../../utils/formatRupiah'
import { formatDate } from '../../utils/formatDate'

export default function PembelianPage() {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // Form State
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [cart, setCart] = useState([])
  
  // Quick item state
  const [selectedProduct, setSelectedProduct] = useState('')
  const [qty, setQty] = useState(1)
  const [hargaBeli, setHargaBeli] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user?.cabang_id) return
    setLoading(true)
    try {
      const [pData, sData, prData] = await Promise.all([
        db.pembelian.list(user.cabang_id),
        db.supplier.list(),
        db.produk.list()
      ])
      setPurchases(pData)
      setSuppliers(sData)
      // Only active products
      setProducts(prData.filter(p => p.status === 'aktif'))
      if (sData.length > 0) setSelectedSupplier(sData[0].id)
      if (prData.length > 0) {
        setSelectedProduct(prData[0].id)
        setHargaBeli(Math.floor(prData[0].harga * 0.6)) // default purchase price is 60% of sale price
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleProductChange = (prodId) => {
    setSelectedProduct(prodId)
    const prod = products.find(p => p.id === Number(prodId))
    if (prod) {
      setHargaBeli(Math.floor(prod.harga * 0.6))
    }
  }

  const addToCart = () => {
    if (!selectedProduct) return
    const prod = products.find(p => p.id === Number(selectedProduct))
    if (!prod) return
    if (!qty || Number(qty) <= 0) return alert('Jumlah tidak valid')
    if (!hargaBeli || Number(hargaBeli) <= 0) return alert('Harga beli tidak valid')

    const existing = cart.find(item => item.produk_id === prod.id)
    if (existing) {
      setCart(cart.map(item => item.produk_id === prod.id 
        ? { ...item, qty: item.qty + Number(qty), subtotal: (item.qty + Number(qty)) * item.harga } 
        : item
      ))
    } else {
      setCart([...cart, {
        produk_id: prod.id,
        nama_produk: prod.nama_produk,
        qty: Number(qty),
        harga: Number(hargaBeli),
        subtotal: Number(qty) * Number(hargaBeli)
      }])
    }
    // reset quick add
    setQty(1)
  }

  const removeFromCart = (prodId) => {
    setCart(cart.filter(item => item.produk_id !== prodId))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedSupplier) return setError('Pilih supplier')
    if (cart.length === 0) return setError('Keranjang pembelian masih kosong')

    setError('')
    try {
      await db.pembelian.create({
        supplier_id: Number(selectedSupplier),
        cabang_id: user.cabang_id,
        items: cart
      })
      setCart([])
      setModalOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      setError('Gagal mencatat pembelian')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-white font-[Outfit]">Pembelian Bahan Baku</h2>
          <p className="text-xs text-coffee-400">Catat pasokan barang masuk dari supplier & update stok otomatis</p>
        </div>
        <button onClick={() => { setError(''); setModalOpen(true); }}
          className="bg-accent hover:bg-accent-light text-coffee-900 font-bold px-4 py-2.5 rounded-xl text-xs
            flex items-center gap-2 shadow-lg shadow-accent/20 active:scale-95 transition-all">
          <FiPlus size={16} /> Catat Pembelian
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-coffee-800/60 border border-white/5 rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-white font-[Outfit] mb-4">Riwayat Pembelian</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 text-coffee-400">
                  <th className="pb-3 font-semibold">Nota</th>
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold">Supplier</th>
                  <th className="pb-3 font-semibold">Detail Barang</th>
                  <th className="pb-3 font-semibold text-right">Total Biaya</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 align-top">
                    <td className="py-4 font-bold text-accent">#PB{p.id}</td>
                    <td className="py-4 text-coffee-300 text-xs">{formatDate(p.tanggal)}</td>
                    <td className="py-4 text-white font-semibold">{p.supplier?.nama_supplier}</td>
                    <td className="py-4">
                      <div className="space-y-1">
                        {p.detail_pembelian?.map((d, i) => (
                          <div key={i} className="text-xs text-coffee-300">
                            • {d.produk?.nama_produk} <span className="font-semibold text-white">({d.qty}x)</span> @ {formatRupiah(d.harga)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 text-right font-extrabold text-white">{formatRupiah(p.total)}</td>
                  </tr>
                ))}

                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-coffee-500">
                      <FiShoppingBag size={32} className="mx-auto mb-3 text-coffee-600" />
                      <p className="text-sm font-semibold">Belum ada riwayat pembelian</p>
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
          <div className="bg-coffee-800 border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-[Outfit] font-extrabold text-white text-base mb-4">
              Catat Pembelian Baru
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2.5 rounded-lg">
                  {error}
                </div>
              )}

              {/* Select Supplier */}
              <div>
                <label className="text-xs text-coffee-300 font-semibold mb-1 block">Supplier Mitra</label>
                <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}
                  className="w-full bg-coffee-900/60 border border-white/10 text-white rounded-lg py-2 px-3 text-xs focus:border-accent outline-none">
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.nama_supplier}</option>
                  ))}
                </select>
              </div>

              {/* Quick Add Product */}
              <div className="bg-coffee-900/40 p-4 rounded-xl border border-white/5">
                <h4 className="text-xs font-bold text-coffee-400 uppercase tracking-wider mb-2">Tambah Item ke Nota</h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5">
                    <label className="text-[10px] text-coffee-400 font-bold block mb-1">Produk</label>
                    <select value={selectedProduct} onChange={e => handleProductChange(e.target.value)}
                      className="w-full bg-coffee-800/80 border border-white/10 text-white rounded-lg py-2 px-2.5 text-xs focus:border-accent outline-none">
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.nama_produk}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-coffee-400 font-bold block mb-1">Qty</label>
                    <input type="number" value={qty} onChange={e => setQty(e.target.value)} min={1}
                      className="w-full bg-coffee-800/80 border border-white/10 text-white rounded-lg py-2 px-2 text-xs focus:border-accent outline-none text-center" />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-coffee-400 font-bold block mb-1">Harga Beli satuan (Rp)</label>
                    <input type="number" value={hargaBeli} onChange={e => setHargaBeli(e.target.value)}
                      className="w-full bg-coffee-800/80 border border-white/10 text-white rounded-lg py-2 px-2.5 text-xs focus:border-accent outline-none text-right" />
                  </div>

                  <div className="sm:col-span-2">
                    <button type="button" onClick={addToCart}
                      className="w-full bg-coffee-700 hover:bg-coffee-600 text-white font-bold py-2 rounded-lg text-xs active:scale-95 transition-all">
                      Tambah
                    </button>
                  </div>
                </div>
              </div>

              {/* Cart Table */}
              <div className="border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-coffee-900/60 text-coffee-400 font-bold">
                      <th className="p-3">Nama Produk</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Harga Satuan</th>
                      <th className="p-3 text-right">Subtotal</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.produk_id} className="border-b border-white/5 text-white">
                        <td className="p-3 font-semibold">{item.nama_produk}</td>
                        <td className="p-3 text-center font-mono">{item.qty}</td>
                        <td className="p-3 text-right font-mono">{formatRupiah(item.harga)}</td>
                        <td className="p-3 text-right font-mono font-bold text-accent">{formatRupiah(item.subtotal)}</td>
                        <td className="p-3 text-center">
                          <button type="button" onClick={() => removeFromCart(item.produk_id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg">
                            <FiTrash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cart.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-coffee-600 font-semibold">Keranjang kosong. Tambahkan item di atas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              {cart.length > 0 && (
                <div className="flex justify-between items-center bg-coffee-900/60 p-4 rounded-xl border border-white/5">
                  <span className="text-xs font-bold text-coffee-400 uppercase">Grand Total Pembelian:</span>
                  <span className="text-base font-extrabold text-accent">{formatRupiah(cartTotal)}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl text-xs active:scale-95 transition-all">
                  Batal
                </button>
                <button type="submit" disabled={cart.length === 0}
                  className="flex-1 bg-accent hover:bg-accent-light text-coffee-900 font-bold py-2.5 rounded-xl text-xs active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <FiCheck size={14} /> Simpan Pembelian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
