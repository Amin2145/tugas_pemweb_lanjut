import { useState, useMemo, useEffect } from 'react'
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiPrinter, FiCheck } from 'react-icons/fi'
import { formatRupiah } from '../../utils/formatRupiah'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../utils/db'

const getCategoryIcon = (categoryName) => {
  const name = String(categoryName || '').toLowerCase()
  if (name.includes('espresso') || name.includes('coffee') || name.includes('brew')) {
    return (
      <svg className="w-8 h-8 text-accent group-hover:scale-110 transition-transform mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8Z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    )
  }
  if (name.includes('non-coffee') || name.includes('matcha') || name.includes('taro') || name.includes('chocolate') || name.includes('drink')) {
    return (
      <svg className="w-8 h-8 text-accent group-hover:scale-110 transition-transform mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="14" y1="2" x2="9" y2="8" />
        <path d="M17 22l2-18H5l2 18a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2z" />
      </svg>
    )
  }
  if (name.includes('pastry') || name.includes('muffin') || name.includes('croissant') || name.includes('cake')) {
    return (
      <svg className="w-8 h-8 text-accent group-hover:scale-110 transition-transform mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12a10 10 0 0 1 20 0H2Z" />
        <path d="M5 12V9a7 7 0 0 1 14 0v3" />
      </svg>
    )
  }
  if (name.includes('snack') || name.includes('fries') || name.includes('kentang') || name.includes('food')) {
    return (
      <svg className="w-8 h-8 text-accent group-hover:scale-110 transition-transform mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8c0 4.42-3.58 8-8 8s-8-3.58-8-8Z" />
        <line x1="9" y1="22" x2="15" y2="22" />
      </svg>
    )
  }
  if (name.includes('beans') || name.includes('biji')) {
    return (
      <svg className="w-8 h-8 text-accent group-hover:scale-110 transition-transform mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Z" />
        <path d="M12 2c0 10-4 10-4 20" />
      </svg>
    )
  }
  return (
    <svg className="w-8 h-8 text-accent group-hover:scale-110 transition-transform mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

const PPN_RATE = 0.11

export default function KasirDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['Semua'])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [cart, setCart] = useState([])
  const [discount, setDiscount] = useState(0)
  const [cash, setCash] = useState('')
  const [showReceipt, setShowReceipt] = useState(null)
  const [metode, setMetode] = useState('tunai')

  useEffect(() => {
    loadPOSData()
  }, [])

  const loadPOSData = async () => {
    setLoading(true)
    try {
      const [pData, cData] = await Promise.all([
        db.produk.list(),
        db.kategori.list()
      ])
      setProducts(pData.filter(p => p.status === 'aktif'))
      setCategories(['Semua', ...cData.map(c => c.nama_kategori)])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => activeCategory === 'Semua' || p.kategori?.nama_kategori === activeCategory)
      .filter(p => p.nama_produk.toLowerCase().includes(search.toLowerCase()))
  }, [products, search, activeCategory])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id
          ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.harga }
          : item
        )
      }
      return [...prev, { ...product, qty: 1, subtotal: product.harga }]
    })
  }

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item
      const newQty = Math.max(0, item.qty + delta)
      return newQty === 0 ? null : { ...item, qty: newQty, subtotal: newQty * item.harga }
    }).filter(Boolean))
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id))

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const discountAmount = subtotal * (discount / 100)
  const afterDiscount = subtotal - discountAmount
  const ppn = afterDiscount * PPN_RATE
  const grandTotal = afterDiscount + ppn
  const cashValue = Number(cash) || 0
  const change = cashValue - grandTotal

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Keranjang kosong!')
    if (metode === 'tunai' && cashValue < grandTotal) return alert('Uang tunai kurang!')

    try {
      const txPayload = {
        kasir_id: user?.id,
        cabang_id: user?.cabang_id,
        total: grandTotal,
        metode_bayar: metode,
        items: cart
      }
      
      const createdTx = await db.transaksi.create(txPayload)

      const receipt = {
        id: createdTx.id || ('TX' + Date.now().toString().slice(-8)),
        tanggal: new Date().toISOString(),
        kasir: user?.nama,
        cabang: user?.cabang?.nama_cabang || 'Cabang',
        items: [...cart],
        subtotal, discount, discountAmount, ppn, grandTotal,
        bayar: metode === 'tunai' ? cashValue : grandTotal,
        kembalian: metode === 'tunai' ? change : 0,
        metode
      }

      setShowReceipt(receipt)
      setCart([])
      setCash('')
      setDiscount(0)
    } catch (err) {
      console.error(err)
      alert('Gagal memproses checkout: ' + err.message)
    }
  }


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)] min-h-[600px]">
      {/* LEFT - Product Catalog */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-4 min-h-0">
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-3 text-coffee-500" size={16} />
          <input type="text" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-coffee-800/60 border border-white/10 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm
              focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none placeholder-coffee-600" />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 flex-shrink-0">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all
                ${activeCategory === cat
                  ? 'bg-accent text-coffee-900 shadow-md shadow-accent/30'
                  : 'bg-coffee-800/60 text-coffee-300 border border-white/10 hover:bg-white/10'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="pos-grid">
            {filteredProducts.map(p => (
              <button key={p.id} onClick={() => addToCart(p)}
                className="bg-coffee-800/60 border border-white/5 hover:border-accent/30 rounded-xl p-4
                  text-left transition-all hover:shadow-lg hover:shadow-accent/5 active:scale-[0.97] group flex flex-col justify-between min-h-[165px]">
                <div>
                  {getCategoryIcon(p.kategori?.nama_kategori)}
                  <div className="text-[9px] text-coffee-500 font-extrabold uppercase tracking-wider mt-1">{p.kategori?.nama_kategori}</div>
                  <h4 className="text-sm font-extrabold text-white mt-1 leading-tight font-[Outfit] group-hover:text-accent transition-colors">
                    {p.nama_produk}
                  </h4>
                </div>
                <div className="w-full flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                  <span className="text-xs font-extrabold text-accent">{formatRupiah(p.harga)}</span>
                  <span className="p-1 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-coffee-900 transition-colors">
                    <FiPlus size={14} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT - Cart & Checkout */}
      <div className="lg:col-span-5 xl:col-span-4 bg-coffee-800/80 backdrop-blur border border-white/5 rounded-2xl p-5 flex flex-col min-h-0 shadow-2xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
          <h3 className="font-[Outfit] font-bold text-white text-sm flex items-center gap-2">
            🛒 Keranjang
          </h3>
          <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
            {cart.reduce((s, i) => s + i.qty, 0)} item
          </span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
          {cart.length === 0 && (
            <div className="h-full flex items-center justify-center text-coffee-600 text-sm">
              Keranjang kosong
            </div>
          )}
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-2 bg-coffee-900/50 p-2.5 rounded-xl border border-white/5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{item.nama_produk}</p>
                <p className="text-[10px] text-accent font-semibold">{formatRupiah(item.harga)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded bg-white/5 hover:bg-white/10 text-coffee-300 active:scale-90">
                  <FiMinus size={12} />
                </button>
                <span className="w-6 text-center text-xs font-extrabold text-white">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded bg-white/5 hover:bg-white/10 text-coffee-300 active:scale-90">
                  <FiPlus size={12} />
                </button>
              </div>
              <span className="text-xs font-bold text-white w-16 text-right">{formatRupiah(item.subtotal)}</span>
              <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-400 hover:text-red-300 active:scale-90">
                <FiTrash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Checkout Panel */}
        {cart.length > 0 && (
          <div className="border-t border-white/5 pt-4 mt-3 space-y-3 flex-shrink-0">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-coffee-400">
                <span>Subtotal</span><span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-coffee-400">
                <span>Diskon (%)</span>
                <input type="number" value={discount} onChange={e => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-16 bg-coffee-900/60 border border-white/10 text-white text-right rounded px-2 py-1 text-xs focus:border-accent outline-none" />
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Potongan</span><span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-coffee-400">
                <span>PPN 11%</span><span>{formatRupiah(ppn)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/10">
                <span>Grand Total</span><span className="text-accent">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex gap-2">
              {['tunai', 'qris', 'transfer'].map(m => (
                <button key={m} onClick={() => setMetode(m)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors
                    ${metode === m ? 'bg-accent text-coffee-900' : 'bg-coffee-900/60 text-coffee-400 border border-white/10 hover:bg-white/10'}`}>
                  {m}
                </button>
              ))}
            </div>

            {/* Cash Input */}
            {metode === 'tunai' && (
              <div>
                <label className="text-[10px] text-coffee-500 uppercase font-bold">Uang Tunai</label>
                <input type="number" value={cash} onChange={e => setCash(e.target.value)} placeholder="0"
                  className="w-full bg-coffee-900/60 border border-white/10 text-white text-right rounded-lg py-2 px-3 text-sm font-mono font-bold text-accent
                    focus:border-accent outline-none mt-1" />
                {cashValue >= grandTotal && cashValue > 0 && (
                  <div className="flex justify-between text-xs text-green-400 font-bold mt-1.5 bg-green-500/10 p-2 rounded-lg">
                    <span>Kembalian</span><span>{formatRupiah(change)}</span>
                  </div>
                )}
              </div>
            )}

            <button onClick={handleCheckout}
              className="w-full bg-accent hover:bg-accent-light text-coffee-900 font-extrabold py-3 rounded-xl shadow-lg
                shadow-accent/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
              <FiCheck size={18} /> Bayar & Cetak Struk
            </button>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-coffee-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div id="receipt-print" className="text-center space-y-3 font-mono text-xs text-coffee-200">
              <div>
                <h3 className="font-[Outfit] font-extrabold text-white text-lg">☕ CoffeeSync</h3>
                <p className="text-[10px] text-coffee-500">{showReceipt.cabang}</p>
                <p className="text-[10px] text-coffee-500">#{showReceipt.id}</p>
              </div>
              <div className="border-t border-dashed border-white/20 my-2" />
              <div className="text-left text-[10px] space-y-1 text-coffee-400">
                <p>Kasir: {showReceipt.kasir}</p>
                <p>Waktu: {new Date(showReceipt.tanggal).toLocaleString('id-ID')}</p>
                <p>Metode: {showReceipt.metode.toUpperCase()}</p>
              </div>
              <div className="border-t border-dashed border-white/20 my-2" />
              <div className="space-y-1.5 text-[10px]">
                {showReceipt.items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <div className="text-left">
                      <p className="text-white font-semibold">{item.nama_produk}</p>
                      <p className="text-coffee-500">{item.qty} x {formatRupiah(item.harga)}</p>
                    </div>
                    <span className="text-white font-bold">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-white/20 my-2" />
              <div className="text-[10px] space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(showReceipt.subtotal)}</span></div>
                {showReceipt.discountAmount > 0 && (
                  <div className="flex justify-between text-green-400"><span>Diskon</span><span>-{formatRupiah(showReceipt.discountAmount)}</span></div>
                )}
                <div className="flex justify-between"><span>PPN 11%</span><span>{formatRupiah(showReceipt.ppn)}</span></div>
                <div className="flex justify-between font-bold text-white"><span>TOTAL</span><span>{formatRupiah(showReceipt.grandTotal)}</span></div>
                <div className="flex justify-between text-coffee-300"><span>BAYAR</span><span>{formatRupiah(showReceipt.bayar)}</span></div>
                {showReceipt.kembalian > 0 && (
                  <div className="flex justify-between text-green-400 font-bold"><span>KEMBALI</span><span>{formatRupiah(showReceipt.kembalian)}</span></div>
                )}
              </div>
              <div className="border-t border-dashed border-white/20 my-2" />
              <p className="text-accent italic text-[10px] font-semibold">Terima kasih! ☕</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => window.print()}
                className="flex-1 bg-coffee-700 hover:bg-coffee-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95">
                <FiPrinter size={14} /> Cetak
              </button>
              <button onClick={() => setShowReceipt(null)}
                className="flex-1 bg-accent hover:bg-accent-light text-coffee-900 font-bold py-2.5 rounded-xl text-xs active:scale-95">
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
