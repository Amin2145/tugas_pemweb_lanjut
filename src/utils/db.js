import { supabase } from '../supabase/client'

// Seed data constants
const SEED_CABANG = [
  { id: 1, nama_cabang: 'CoffeeSync Bandung', alamat: 'Jl. Dago No. 12, Bandung', telepon: '081234567890' },
  { id: 2, nama_cabang: 'CoffeeSync Jakarta', alamat: 'Jl. Kemang Raya No. 45, Jakarta Selatan', telepon: '081298765432' },
  { id: 3, nama_cabang: 'CoffeeSync Surabaya', alamat: 'Jl. Tunjungan No. 88, Surabaya', telepon: '081345678901' },
  { id: 4, nama_cabang: 'CoffeeSync Yogyakarta', alamat: 'Jl. Malioboro No. 42, Yogyakarta', telepon: '081456789012' },
  { id: 5, nama_cabang: 'CoffeeSync Medan', alamat: 'Jl. Kesawan No. 15, Medan', telepon: '081567890123' }
]

const SEED_KATEGORI = [
  { id: 1, nama_kategori: 'Espresso Based' },
  { id: 2, nama_kategori: 'Manual Brew' },
  { id: 3, nama_kategori: 'Non-Coffee' },
  { id: 4, nama_kategori: 'Pastry' },
  { id: 5, nama_kategori: 'Snack' },
  { id: 6, nama_kategori: 'Coffee Beans' }
]

const SEED_PRODUK = [
  { id: 1, kategori_id: 1, nama_produk: 'Espresso Single', harga: 18000, status: 'aktif' },
  { id: 2, kategori_id: 1, nama_produk: 'Espresso Double', harga: 24000, status: 'aktif' },
  { id: 3, kategori_id: 1, nama_produk: 'Café Latte', harga: 28000, status: 'aktif' },
  { id: 4, kategori_id: 1, nama_produk: 'Cappuccino', harga: 28000, status: 'aktif' },
  { id: 5, kategori_id: 1, nama_produk: 'Iced Americano', harga: 22000, status: 'aktif' },
  { id: 6, kategori_id: 1, nama_produk: 'Flat White', harga: 30000, status: 'aktif' },
  { id: 7, kategori_id: 1, nama_produk: 'Mocha Latte', harga: 32000, status: 'aktif' },
  { id: 8, kategori_id: 2, nama_produk: 'V60 Drip', harga: 35000, status: 'aktif' },
  { id: 9, kategori_id: 2, nama_produk: 'Aeropress', harga: 35000, status: 'aktif' },
  { id: 10, kategori_id: 2, nama_produk: 'Cold Brew 250ml', harga: 28000, status: 'aktif' },
  { id: 11, kategori_id: 3, nama_produk: 'Matcha Latte', harga: 30000, status: 'aktif' },
  { id: 12, kategori_id: 3, nama_produk: 'Chocolate', harga: 28000, status: 'aktif' },
  { id: 13, kategori_id: 3, nama_produk: 'Taro Latte', harga: 28000, status: 'aktif' },
  { id: 14, kategori_id: 4, nama_produk: 'Butter Croissant', harga: 25000, status: 'aktif' },
  { id: 15, kategori_id: 4, nama_produk: 'Chocolate Muffin', harga: 22000, status: 'aktif' },
  { id: 16, kategori_id: 5, nama_produk: 'French Fries', harga: 20000, status: 'aktif' },
  { id: 17, kategori_id: 6, nama_produk: 'Gayo Arabica 250g', harga: 95000, status: 'aktif' },
  { id: 18, kategori_id: 6, nama_produk: 'Toraja Kalosi 250g', harga: 105000, status: 'aktif' }
]

const SEED_SUPPLIER = [
  { id: 1, nama_supplier: 'PT Kopi Nusantara', telepon: '08111222333', alamat: 'Jl. Industri No. 5, Bandung' },
  { id: 2, nama_supplier: 'CV Susu Segar Jaya', telepon: '08122334455', alamat: 'Jl. Peternakan No. 10, Bogor' },
  { id: 3, nama_supplier: 'UD Tepung Makmur', telepon: '08133445566', alamat: 'Jl. Pasar Baru No. 3, Jakarta' }
]

const SEED_USERS = [
  { id: 'a0000000-0000-0000-0000-000000000001', nama: 'Budi Santoso', email: 'owner@coffeesync.id', password: '123456', role: 'owner', cabang_id: null },
  { id: 'a0000000-0000-0000-0000-000000000002', nama: 'Andi Wijaya', email: 'admin.bdg@coffeesync.id', password: '123456', role: 'admin', cabang_id: 1 },
  { id: 'a0000000-0000-0000-0000-000000000003', nama: 'Agus Purnomo', email: 'admin.jkt@coffeesync.id', password: '123456', role: 'admin', cabang_id: 2 },
  { id: 'a0000000-0000-0000-0000-000000000004', nama: 'Adit Pratama', email: 'admin.sby@coffeesync.id', password: '123456', role: 'admin', cabang_id: 3 },
  { id: 'a0000000-0000-0000-0000-000000000008', nama: 'Fajar Nugraha', email: 'admin.yog@coffeesync.id', password: '123456', role: 'admin', cabang_id: 4 },
  { id: 'a0000000-0000-0000-0000-000000000009', nama: 'Rian Syahputra', email: 'admin.mdn@coffeesync.id', password: '123456', role: 'admin', cabang_id: 5 },
  { id: 'a0000000-0000-0000-0000-000000000005', nama: 'Kiki Amelia', email: 'kasir.bdg@coffeesync.id', password: '123456', role: 'kasir', cabang_id: 1 },
  { id: 'a0000000-0000-0000-0000-000000000006', nama: 'Kevin Saputra', email: 'kasir.jkt@coffeesync.id', password: '123456', role: 'kasir', cabang_id: 2 },
  { id: 'a0000000-0000-0000-0000-000000000007', nama: 'Karin Dewi', email: 'kasir.sby@coffeesync.id', password: '123456', role: 'kasir', cabang_id: 3 },
  { id: 'a0000000-0000-0000-0000-000000000010', nama: 'Indah Lestari', email: 'kasir.yog@coffeesync.id', password: '123456', role: 'kasir', cabang_id: 4 },
  { id: 'a0000000-0000-0000-0000-000000000011', nama: 'Putri Siregar', email: 'kasir.mdn@coffeesync.id', password: '123456', role: 'kasir', cabang_id: 5 }
]

// Initialize LocalStorage Database if empty
const initMockDB = () => {
  // Reset seed if version changed to support 5 branches and 2x more dummy data
  const seedVersion = localStorage.getItem('db_seed_version')
  if (seedVersion !== '2x_5c') {
    const keysToClear = [
      'db_cabang', 'db_kategori', 'db_produk', 'db_supplier', 'db_users',
      'db_stok', 'db_transaksi', 'db_detail_transaksi', 'db_pembelian',
      'db_detail_pembelian', 'db_mutasi_stok'
    ]
    keysToClear.forEach(key => localStorage.removeItem(key))
    localStorage.setItem('db_seed_version', '2x_5c')
  }

  const getOrSet = (key, seedData) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(seedData))
    }
    return JSON.parse(localStorage.getItem(key))
  }

  const cabang = getOrSet('db_cabang', SEED_CABANG)
  const kategori = getOrSet('db_kategori', SEED_KATEGORI)
  const produk = getOrSet('db_produk', SEED_PRODUK)
  const supplier = getOrSet('db_supplier', SEED_SUPPLIER)
  getOrSet('db_users', SEED_USERS)

  // Seed Stok
  if (!localStorage.getItem('db_stok')) {
    const stoks = []
    let idCounter = 1
    cabang.forEach(c => {
      produk.forEach(p => {
        // Random stock numbers for realism
        const isLow = Math.random() < 0.15
        const jumlah = isLow ? Math.floor(Math.random() * 8) + 1 : Math.floor(Math.random() * 40) + 15
        stoks.push({
          id: idCounter++,
          produk_id: p.id,
          cabang_id: c.id,
          jumlah,
          minimum_stok: p.kategori_id === 6 ? 5 : 10,
          updated_at: new Date().toISOString()
        })
      })
    })
    localStorage.setItem('db_stok', JSON.stringify(stoks))
  }

  // Seed Transaksi & Detail (56 days instead of 28 days, 2x more data)
  if (!localStorage.getItem('db_transaksi')) {
    const transactions = []
    const details = []
    let txIdCounter = 1
    let detailIdCounter = 1

    // Generate transactions for the last 56 days
    for (let day = 55; day >= 0; day--) {
      cabang.forEach(c => {
        // 2 to 5 transactions per branch per day
        const txCount = Math.floor(Math.random() * 4) + 2
        for (let t = 0; t < txCount; t++) {
          const date = new Date()
          date.setDate(date.getDate() - day)
          date.setHours(Math.floor(Math.random() * 12) + 9, Math.floor(Math.random() * 60))

          // Select 1 to 4 random products
          const itemsCount = Math.floor(Math.random() * 3) + 1
          let total = 0
          const chosenProducts = [...produk].sort(() => 0.5 - Math.random()).slice(0, itemsCount)

          const txId = txIdCounter++
          chosenProducts.forEach(p => {
            const qty = Math.floor(Math.random() * 3) + 1
            const subtotal = qty * p.harga
            total += subtotal

            details.push({
              id: detailIdCounter++,
              transaksi_id: txId,
              produk_id: p.id,
              qty,
              harga: p.harga,
              subtotal
            })
          })

          const kasir = SEED_USERS.find(u => u.role === 'kasir' && u.cabang_id === c.id)

          transactions.push({
            id: txId,
            kasir_id: kasir ? kasir.id : SEED_USERS[4].id,
            cabang_id: c.id,
            tanggal: date.toISOString(),
            total,
            metode_bayar: ['tunai', 'qris', 'transfer'][Math.floor(Math.random() * 3)]
          })
        }
      })
    }
    localStorage.setItem('db_transaksi', JSON.stringify(transactions))
    localStorage.setItem('db_detail_transaksi', JSON.stringify(details))
  }

  // Seed Pembelian (Seed purchases for 56 days for full charts and statistics)
  if (!localStorage.getItem('db_pembelian')) {
    const purchases = []
    const purchaseDetails = []
    let pemIdCounter = 1
    let pemDetailIdCounter = 1

    for (let day = 55; day >= 0; day--) {
      cabang.forEach(c => {
        // ~40% chance of a purchase from a supplier on any given day for each branch
        if (Math.random() < 0.4) {
          const date = new Date()
          date.setDate(date.getDate() - day)
          date.setHours(Math.floor(Math.random() * 8) + 8, Math.floor(Math.random() * 60))

          const selectedSupplier = supplier[Math.floor(Math.random() * supplier.length)]
          const itemsCount = Math.floor(Math.random() * 3) + 1
          let total = 0
          const chosenProducts = [...produk].sort(() => 0.5 - Math.random()).slice(0, itemsCount)

          const pemId = pemIdCounter++
          chosenProducts.forEach(p => {
            const qty = Math.floor(Math.random() * 15) + 10
            const hargaBeli = Math.floor(p.harga * 0.5) // ~50% cost price
            const subtotal = qty * hargaBeli
            total += subtotal

            purchaseDetails.push({
              id: pemDetailIdCounter++,
              pembelian_id: pemId,
              produk_id: p.id,
              qty,
              harga: hargaBeli,
              subtotal
            })
          })

          purchases.push({
            id: pemId,
            supplier_id: selectedSupplier.id,
            cabang_id: c.id,
            tanggal: date.toISOString(),
            total
          })
        }
      })
    }
    localStorage.setItem('db_pembelian', JSON.stringify(purchases))
    localStorage.setItem('db_detail_pembelian', JSON.stringify(purchaseDetails))
  }

  // Seed Mutasi (Seeded 20 mutations, 2x more data)
  if (!localStorage.getItem('db_mutasi_stok')) {
    const mutations = []
    let idCounter = 1

    for (let i = 0; i < 20; i++) {
      const p = produk[Math.floor(Math.random() * produk.length)]
      const branches = [...cabang].sort(() => 0.5 - Math.random())
      const status = i < 4 ? 'pending' : (Math.random() < 0.7 ? 'approved' : 'rejected')
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 30))
      date.setHours(Math.floor(Math.random() * 12) + 9)

      mutations.push({
        id: idCounter++,
        produk_id: p.id,
        cabang_asal: branches[0].id,
        cabang_tujuan: branches[1].id,
        qty: Math.floor(Math.random() * 10) + 5,
        status,
        tanggal: date.toISOString()
      })
    }
    localStorage.setItem('db_mutasi_stok', JSON.stringify(mutations))
  }
}

// Call init once immediately
initMockDB()

// Helper functions for mock CRUD
const mockGet = (key) => JSON.parse(localStorage.getItem(key) || '[]')
const mockSet = (key, data) => localStorage.setItem(key, JSON.stringify(data))

// Exported DB API
export const db = {
  // Check if we should fall back to mock
  isMockMode: () => {
    const sbUrl = import.meta.env.VITE_SUPABASE_URL
    const forceMock = localStorage.getItem('coffeesync_mock')
    return !sbUrl || sbUrl.includes('YOUR_PROJECT') || forceMock === '1'
  },

  // ==========================================
  // CABANG
  // ==========================================
  cabang: {
    list: async () => {
      if (db.isMockMode()) return mockGet('db_cabang')
      const { data, error } = await supabase.from('cabang').select('*').order('id')
      if (error) throw error
      return data
    },
    create: async (cabangObj) => {
      if (db.isMockMode()) {
        const list = mockGet('db_cabang')
        const newId = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 1
        const newCabang = { id: newId, ...cabangObj, created_at: new Date().toISOString() }
        mockSet('db_cabang', [...list, newCabang])

        // Auto-seed stocks for new branch with 0 qty
        const produkList = mockGet('db_produk')
        const stokList = mockGet('db_stok')
        let stokId = stokList.length > 0 ? Math.max(...stokList.map(s => s.id)) + 1 : 1
        const newStoks = produkList.map(p => ({
          id: stokId++,
          produk_id: p.id,
          cabang_id: newId,
          jumlah: 0,
          minimum_stok: p.kategori_id === 6 ? 5 : 10,
          updated_at: new Date().toISOString()
        }))
        mockSet('db_stok', [...stokList, ...newStoks])

        return newCabang
      }
      // Supabase insert
      const { data, error } = await supabase.from('cabang').insert([cabangObj]).select().single()
      if (error) throw error

      // If Supabase, database trigger / functions should handle stock seeding, or we can handle it here if needed.
      return data
    },
    update: async (id, cabangObj) => {
      if (db.isMockMode()) {
        const list = mockGet('db_cabang')
        const updated = list.map(c => c.id === id ? { ...c, ...cabangObj } : c)
        mockSet('db_cabang', updated)
        return updated.find(c => c.id === id)
      }
      const { data, error } = await supabase.from('cabang').update(cabangObj).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    delete: async (id) => {
      if (db.isMockMode()) {
        const list = mockGet('db_cabang')
        mockSet('db_cabang', list.filter(c => c.id !== id))
        // Cascade delete stocks and users
        const stoks = mockGet('db_stok')
        mockSet('db_stok', stoks.filter(s => s.cabang_id !== id))
        const users = mockGet('db_users')
        mockSet('db_users', users.map(u => u.cabang_id === id ? { ...u, cabang_id: null } : u))
        return true
      }
      const { error } = await supabase.from('cabang').delete().eq('id', id)
      if (error) throw error
      return true
    }
  },

  // ==========================================
  // USERS
  // ==========================================
  users: {
    list: async () => {
      if (db.isMockMode()) {
        const users = mockGet('db_users')
        const cabang = mockGet('db_cabang')
        return users.map(u => ({
          ...u,
          cabang: cabang.find(c => c.id === u.cabang_id) || null
        }))
      }
      const { data, error } = await supabase.from('users').select('*, cabang(*)').order('nama')
      if (error) throw error
      return data
    },
    create: async (userObj) => {
      if (db.isMockMode()) {
        const list = mockGet('db_users')
        const newId = 'a0000000-0000-0000-0000-' + Math.floor(100000000000 + Math.random() * 900000000000).toString()
        const newUser = { id: newId, ...userObj, created_at: new Date().toISOString() }
        mockSet('db_users', [...list, newUser])
        return newUser
      }
      const { data, error } = await supabase.from('users').insert([userObj]).select().single()
      if (error) throw error
      return data
    },
    update: async (id, userObj) => {
      if (db.isMockMode()) {
        const list = mockGet('db_users')
        const updated = list.map(u => u.id === id ? { ...u, ...userObj } : u)
        mockSet('db_users', updated)
        return updated.find(u => u.id === id)
      }
      const { data, error } = await supabase.from('users').update(userObj).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    delete: async (id) => {
      if (db.isMockMode()) {
        const list = mockGet('db_users')
        mockSet('db_users', list.filter(u => u.id !== id))
        return true
      }
      const { error } = await supabase.from('users').delete().eq('id', id)
      if (error) throw error
      return true
    }
  },

  // ==========================================
  // KATEGORI
  // ==========================================
  kategori: {
    list: async () => {
      if (db.isMockMode()) return mockGet('db_kategori')
      const { data, error } = await supabase.from('kategori').select('*').order('id')
      if (error) throw error
      return data
    },
    create: async (katObj) => {
      if (db.isMockMode()) {
        const list = mockGet('db_kategori')
        const newId = list.length > 0 ? Math.max(...list.map(k => k.id)) + 1 : 1
        const newKat = { id: newId, ...katObj }
        mockSet('db_kategori', [...list, newKat])
        return newKat
      }
      const { data, error } = await supabase.from('kategori').insert([katObj]).select().single()
      if (error) throw error
      return data
    },
    update: async (id, katObj) => {
      if (db.isMockMode()) {
        const list = mockGet('db_kategori')
        const updated = list.map(k => k.id === id ? { ...k, ...katObj } : k)
        mockSet('db_kategori', updated)
        return updated.find(k => k.id === id)
      }
      const { data, error } = await supabase.from('kategori').update(katObj).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    delete: async (id) => {
      if (db.isMockMode()) {
        const list = mockGet('db_kategori')
        mockSet('db_kategori', list.filter(k => k.id !== id))
        return true
      }
      const { error } = await supabase.from('kategori').delete().eq('id', id)
      if (error) throw error
      return true
    }
  },

  // ==========================================
  // PRODUK
  // ==========================================
  produk: {
    list: async () => {
      if (db.isMockMode()) {
        const produk = mockGet('db_produk')
        const kategori = mockGet('db_kategori')
        return produk.map(p => ({
          ...p,
          kategori: kategori.find(k => k.id === p.kategori_id) || null
        }))
      }
      const { data, error } = await supabase.from('produk').select('*, kategori(*)').order('id')
      if (error) throw error
      return data
    },
    create: async (prodObj) => {
      if (db.isMockMode()) {
        const list = mockGet('db_produk')
        const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1
        const newProd = { id: newId, ...prodObj }
        mockSet('db_produk', [...list, newProd])

        // Add stocks for this product in all branches
        const cabang = mockGet('db_cabang')
        const stokList = mockGet('db_stok')
        let stokId = stokList.length > 0 ? Math.max(...stokList.map(s => s.id)) + 1 : 1
        const newStoks = cabang.map(c => ({
          id: stokId++,
          produk_id: newId,
          cabang_id: c.id,
          jumlah: 0,
          minimum_stok: newProd.kategori_id === 6 ? 5 : 10,
          updated_at: new Date().toISOString()
        }))
        mockSet('db_stok', [...stokList, ...newStoks])

        return newProd
      }
      const { data, error } = await supabase.from('produk').insert([prodObj]).select().single()
      if (error) throw error
      return data
    },
    update: async (id, prodObj) => {
      if (db.isMockMode()) {
        const list = mockGet('db_produk')
        const updated = list.map(p => p.id === id ? { ...p, ...prodObj } : p)
        mockSet('db_produk', updated)
        return updated.find(p => p.id === id)
      }
      const { data, error } = await supabase.from('produk').update(prodObj).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    delete: async (id) => {
      if (db.isMockMode()) {
        const list = mockGet('db_produk')
        mockSet('db_produk', list.filter(p => p.id !== id))
        // Cascade delete stocks
        const stoks = mockGet('db_stok')
        mockSet('db_stok', stoks.filter(s => s.produk_id !== id))
        return true
      }
      const { error } = await supabase.from('produk').delete().eq('id', id)
      if (error) throw error
      return true
    }
  },

  // ==========================================
  // PERSERDIAAN / STOK
  // ==========================================
  stok: {
    list: async (cabangId = null) => {
      if (db.isMockMode()) {
        const stoks = mockGet('db_stok')
        const produk = mockGet('db_produk')
        const cabang = mockGet('db_cabang')
        const kategori = mockGet('db_kategori')

        let filtered = stoks
        if (cabangId) {
          filtered = stoks.filter(s => s.cabang_id === Number(cabangId))
        }

        return filtered.map(s => {
          const p = produk.find(x => x.id === s.produk_id) || {}
          return {
            ...s,
            produk: {
              ...p,
              kategori: kategori.find(k => k.id === p.kategori_id) || null
            },
            cabang: cabang.find(c => c.id === s.cabang_id) || null
          }
        })
      }

      let query = supabase.from('stok').select('*, produk(*, kategori(*)), cabang(*)')
      if (cabangId) {
        query = query.eq('cabang_id', cabangId)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
    update: async (id, { jumlah, minimum_stok }) => {
      if (db.isMockMode()) {
        const list = mockGet('db_stok')
        const updated = list.map(s => s.id === id ? { ...s, jumlah, minimum_stok, updated_at: new Date().toISOString() } : s)
        mockSet('db_stok', updated)
        return updated.find(s => s.id === id)
      }
      const { data, error } = await supabase.from('stok').update({ jumlah, minimum_stok }).eq('id', id).select().single()
      if (error) throw error
      return data
    }
  },

  // ==========================================
  // SUPPLIER
  // ==========================================
  supplier: {
    list: async () => {
      if (db.isMockMode()) return mockGet('db_supplier')
      const { data, error } = await supabase.from('supplier').select('*').order('id')
      if (error) throw error
      return data
    },
    create: async (supObj) => {
      if (db.isMockMode()) {
        const list = mockGet('db_supplier')
        const newId = list.length > 0 ? Math.max(...list.map(s => s.id)) + 1 : 1
        const newSup = { id: newId, ...supObj }
        mockSet('db_supplier', [...list, newSup])
        return newSup
      }
      const { data, error } = await supabase.from('supplier').insert([supObj]).select().single()
      if (error) throw error
      return data
    },
    update: async (id, supObj) => {
      if (db.isMockMode()) {
        const list = mockGet('db_supplier')
        const updated = list.map(s => s.id === id ? { ...s, ...supObj } : s)
        mockSet('db_supplier', updated)
        return updated.find(s => s.id === id)
      }
      const { data, error } = await supabase.from('supplier').update(supObj).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    delete: async (id) => {
      if (db.isMockMode()) {
        const list = mockGet('db_supplier')
        mockSet('db_supplier', list.filter(s => s.id !== id))
        return true
      }
      const { error } = await supabase.from('supplier').delete().eq('id', id)
      if (error) throw error
      return true
    }
  },

  // ==========================================
  // PEMBELIAN
  // ==========================================
  pembelian: {
    list: async (cabangId = null) => {
      if (db.isMockMode()) {
        const list = mockGet('db_pembelian')
        const details = mockGet('db_detail_pembelian')
        const supplier = mockGet('db_supplier')
        const cabang = mockGet('db_cabang')
        const produk = mockGet('db_produk')
        const kategori = mockGet('db_kategori')

        const produkWithKategori = produk.map(p => ({
          ...p,
          kategori: kategori.find(k => k.id === p.kategori_id) || null
        }))

        let filtered = list
        if (cabangId) {
          filtered = list.filter(p => p.cabang_id === Number(cabangId))
        }

        return filtered.map(p => {
          const items = details.filter(d => d.pembelian_id === p.id).map(item => ({
            ...item,
            produk: produkWithKategori.find(pr => pr.id === item.produk_id) || null
          }))
          return {
            ...p,
            supplier: supplier.find(s => s.id === p.supplier_id) || null,
            cabang: cabang.find(c => c.id === p.cabang_id) || null,
            detail_pembelian: items
          }
        }).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
      }

      let query = supabase.from('pembelian').select('*, supplier(*), cabang(*), detail_pembelian(*, produk(*, kategori(*)))').order('tanggal', { ascending: false })
      if (cabangId) {
        query = query.eq('cabang_id', cabangId)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
    create: async ({ supplier_id, cabang_id, items }) => {
      const total = items.reduce((sum, item) => sum + item.qty * item.harga, 0)

      if (db.isMockMode()) {
        const list = mockGet('db_pembelian')
        const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1
        const newPem = {
          id: newId,
          supplier_id,
          cabang_id,
          tanggal: new Date().toISOString(),
          total
        }
        mockSet('db_pembelian', [...list, newPem])

        // Add details
        const details = mockGet('db_detail_pembelian')
        let detailId = details.length > 0 ? Math.max(...details.map(d => d.id)) + 1 : 1
        const newDetails = items.map(item => ({
          id: detailId++,
          pembelian_id: newId,
          produk_id: item.produk_id,
          qty: item.qty,
          harga: item.harga,
          subtotal: item.qty * item.harga
        }))
        mockSet('db_detail_pembelian', [...details, ...newDetails])

        // Update local stock!
        const stocks = mockGet('db_stok')
        const updatedStocks = stocks.map(s => {
          if (s.cabang_id === cabang_id) {
            const purItem = items.find(i => i.produk_id === s.produk_id)
            if (purItem) {
              return { ...s, jumlah: s.jumlah + purItem.qty, updated_at: new Date().toISOString() }
            }
          }
          return s
        })
        mockSet('db_stok', updatedStocks)

        return newPem
      }

      // Supabase transaksional insert
      const { data: pem, error: pemErr } = await supabase.from('pembelian').insert([{
        supplier_id, cabang_id, total, tanggal: new Date().toISOString()
      }]).select().single()

      if (pemErr) throw pemErr

      const detailsToInsert = items.map(item => ({
        pembelian_id: pem.id,
        produk_id: item.produk_id,
        qty: item.qty,
        harga: item.harga,
        subtotal: item.qty * item.harga
      }))

      const { error: detErr } = await supabase.from('detail_pembelian').insert(detailsToInsert)
      if (detErr) throw detErr

      // Update stocks
      for (const item of items) {
        // Increment stock
        const { data: currentStock } = await supabase.from('stok')
          .select('id, jumlah')
          .eq('cabang_id', cabang_id)
          .eq('produk_id', item.produk_id)
          .single()

        if (currentStock) {
          await supabase.from('stok')
            .update({ jumlah: currentStock.jumlah + item.qty })
            .eq('id', currentStock.id)
        } else {
          // If stock entry doesn't exist, create it
          await supabase.from('stok').insert([{
            cabang_id,
            produk_id: item.produk_id,
            jumlah: item.qty,
            minimum_stok: 10
          }])
        }
      }

      return pem
    }
  },

  // ==========================================
  // TRANSAKSI (POS KASIR)
  // ==========================================
  transaksi: {
    list: async (cabangId = null) => {
      if (db.isMockMode()) {
        const list = mockGet('db_transaksi')
        const details = mockGet('db_detail_transaksi')
        const users = mockGet('db_users')
        const cabang = mockGet('db_cabang')
        const produk = mockGet('db_produk')
        const kategori = mockGet('db_kategori')

        const produkWithKategori = produk.map(p => ({
          ...p,
          kategori: kategori.find(k => k.id === p.kategori_id) || null
        }))

        let filtered = list
        if (cabangId) {
          filtered = list.filter(t => t.cabang_id === Number(cabangId))
        }

        return filtered.map(t => {
          const items = details.filter(d => d.transaksi_id === t.id).map(item => ({
            ...item,
            produk: produkWithKategori.find(pr => pr.id === item.produk_id) || null
          }))
          return {
            ...t,
            kasir: users.find(u => u.id === t.kasir_id) || null,
            cabang: cabang.find(c => c.id === t.cabang_id) || null,
            detail_transaksi: items
          }
        }).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
      }

      let query = supabase.from('transaksi').select('*, kasir:users(*), cabang(*), detail_transaksi(*, produk(*, kategori(*)))').order('tanggal', { ascending: false })
      if (cabangId) {
        query = query.eq('cabang_id', cabangId)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
    create: async ({ kasir_id, cabang_id, total, metode_bayar, items }) => {
      if (db.isMockMode()) {
        const list = mockGet('db_transaksi')
        const newId = list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1
        const newTx = {
          id: newId,
          kasir_id,
          cabang_id,
          tanggal: new Date().toISOString(),
          total,
          metode_bayar
        }
        mockSet('db_transaksi', [...list, newTx])

        // Add details
        const details = mockGet('db_detail_transaksi')
        let detailId = details.length > 0 ? Math.max(...details.map(d => d.id)) + 1 : 1
        const newDetails = items.map(item => ({
          id: detailId++,
          transaksi_id: newId,
          produk_id: item.id || item.produk_id,
          qty: item.qty,
          harga: item.harga,
          subtotal: item.qty * item.harga
        }))
        mockSet('db_detail_transaksi', [...details, ...newDetails])

        // Update local stock! (Deduct quantities)
        const stocks = mockGet('db_stok')
        const updatedStocks = stocks.map(s => {
          if (s.cabang_id === cabang_id) {
            const saleItem = items.find(i => (i.id || i.produk_id) === s.produk_id)
            if (saleItem) {
              return { ...s, jumlah: Math.max(0, s.jumlah - saleItem.qty), updated_at: new Date().toISOString() }
            }
          }
          return s
        })
        mockSet('db_stok', updatedStocks)

        return newTx
      }

      // Supabase insert
      const { data: tx, error: txErr } = await supabase.from('transaksi').insert([{
        kasir_id, cabang_id, total, metode_bayar, tanggal: new Date().toISOString()
      }]).select().single()

      if (txErr) throw txErr

      const detailsToInsert = items.map(item => ({
        transaksi_id: tx.id,
        produk_id: item.id || item.produk_id,
        qty: item.qty,
        harga: item.harga,
        subtotal: item.qty * item.harga
      }))

      const { error: detErr } = await supabase.from('detail_transaksi').insert(detailsToInsert)
      if (detErr) throw detErr

      // Deduct stock in Supabase
      for (const item of items) {
        const prodId = item.id || item.produk_id
        const { data: currentStock } = await supabase.from('stok')
          .select('id, jumlah')
          .eq('cabang_id', cabang_id)
          .eq('produk_id', prodId)
          .single()

        if (currentStock) {
          await supabase.from('stok')
            .update({ jumlah: Math.max(0, currentStock.jumlah - item.qty) })
            .eq('id', currentStock.id)
        }
      }

      return tx
    }
  },

  // ==========================================
  // MUTASI STOK
  // ==========================================
  mutasi: {
    list: async (cabangId = null) => {
      if (db.isMockMode()) {
        const list = mockGet('db_mutasi_stok')
        const produk = mockGet('db_produk')
        const cabang = mockGet('db_cabang')

        let filtered = list
        if (cabangId) {
          filtered = list.filter(m => m.cabang_asal === Number(cabangId) || m.cabang_tujuan === Number(cabangId))
        }

        return filtered.map(m => ({
          ...m,
          produk: produk.find(p => p.id === m.produk_id) || null,
          asal: cabang.find(c => c.id === m.cabang_asal) || null,
          tujuan: cabang.find(c => c.id === m.cabang_tujuan) || null
        })).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
      }

      let query = supabase.from('mutasi_stok').select('*, produk(*), asal:cabang!mutasi_stok_cabang_asal_fkey(*), tujuan:cabang!mutasi_stok_cabang_tujuan_fkey(*)').order('tanggal', { ascending: false })
      if (cabangId) {
        query = query.or(`cabang_asal.eq.${cabangId},cabang_tujuan.eq.${cabangId}`)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
    create: async (mutObj) => {
      if (db.isMockMode()) {
        const list = mockGet('db_mutasi_stok')
        const newId = list.length > 0 ? Math.max(...list.map(m => m.id)) + 1 : 1
        const newMut = {
          id: newId,
          ...mutObj,
          status: 'pending',
          tanggal: new Date().toISOString()
        }
        mockSet('db_mutasi_stok', [...list, newMut])
        return newMut
      }
      const { data, error } = await supabase.from('mutasi_stok').insert([{
        ...mutObj, status: 'pending', tanggal: new Date().toISOString()
      }]).select().single()
      if (error) throw error
      return data
    },
    approve: async (id) => {
      if (db.isMockMode()) {
        const list = mockGet('db_mutasi_stok')
        const mut = list.find(m => m.id === id)
        if (!mut || mut.status !== 'pending') return false

        // Deduct source branch stock and increment target branch stock
        const stocks = mockGet('db_stok')
        const sourceStok = stocks.find(s => s.cabang_id === mut.cabang_asal && s.produk_id === mut.produk_id)
        const targetStok = stocks.find(s => s.cabang_id === mut.cabang_tujuan && s.produk_id === mut.produk_id)

        if (!sourceStok || sourceStok.jumlah < mut.qty) {
          throw new Error('Stok cabang asal tidak mencukupi!')
        }

        const updatedStocks = stocks.map(s => {
          if (s.id === sourceStok.id) {
            return { ...s, jumlah: s.jumlah - mut.qty, updated_at: new Date().toISOString() }
          }
          if (targetStok && s.id === targetStok.id) {
            return { ...s, jumlah: s.jumlah + mut.qty, updated_at: new Date().toISOString() }
          }
          return s
        })

        // If target stock doesn't exist, create it
        if (!targetStok) {
          const newStokId = updatedStocks.length > 0 ? Math.max(...updatedStocks.map(s => s.id)) + 1 : 1
          updatedStocks.push({
            id: newStokId,
            produk_id: mut.produk_id,
            cabang_id: mut.cabang_tujuan,
            jumlah: mut.qty,
            minimum_stok: 10,
            updated_at: new Date().toISOString()
          })
        }

        mockSet('db_stok', updatedStocks)

        const updatedMut = list.map(m => m.id === id ? { ...m, status: 'approved' } : m)
        mockSet('db_mutasi_stok', updatedMut)
        return true
      }

      // In Supabase: Need to get mutasi record
      const { data: mut, error: fetchErr } = await supabase.from('mutasi_stok').select('*').eq('id', id).single()
      if (fetchErr) throw fetchErr

      if (mut.status !== 'pending') throw new Error('Mutasi sudah diproses')

      // Get source stock
      const { data: sourceStok, error: srcStokErr } = await supabase.from('stok')
        .select('*')
        .eq('cabang_id', mut.cabang_asal)
        .eq('produk_id', mut.produk_id)
        .single()

      if (srcStokErr || !sourceStok || sourceStok.jumlah < mut.qty) {
        throw new Error('Stok cabang asal tidak mencukupi!')
      }

      // 1. Deduct from asal
      await supabase.from('stok').update({ jumlah: sourceStok.jumlah - mut.qty }).eq('id', sourceStok.id)

      // 2. Add to tujuan
      const { data: targetStok } = await supabase.from('stok')
        .select('*')
        .eq('cabang_id', mut.cabang_tujuan)
        .eq('produk_id', mut.produk_id)
        .single()

      if (targetStok) {
        await supabase.from('stok').update({ jumlah: targetStok.jumlah + mut.qty }).eq('id', targetStok.id)
      } else {
        await supabase.from('stok').insert([{
          cabang_id: mut.cabang_tujuan,
          produk_id: mut.produk_id,
          jumlah: mut.qty,
          minimum_stok: 10
        }])
      }

      // 3. Update mutasi status
      await supabase.from('mutasi_stok').update({ status: 'approved' }).eq('id', id)
      return true
    },
    reject: async (id) => {
      if (db.isMockMode()) {
        const list = mockGet('db_mutasi_stok')
        const updated = list.map(m => m.id === id ? { ...m, status: 'rejected' } : m)
        mockSet('db_mutasi_stok', updated)
        return true
      }
      await supabase.from('mutasi_stok').update({ status: 'rejected' }).eq('id', id)
      return true
    }
  }
}
