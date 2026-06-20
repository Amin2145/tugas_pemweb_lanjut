import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FiHome, FiShoppingCart, FiPackage, FiTruck, FiBarChart2,
  FiUsers, FiMapPin, FiLayers, FiRepeat, FiLogOut, FiCoffee,
  FiList, FiShoppingBag, FiClipboard, FiClock
} from 'react-icons/fi'

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
    isActive
      ? 'bg-accent text-coffee-900 shadow-md shadow-accent/30'
      : 'text-coffee-200 hover:bg-white/10 hover:text-white'
  }`

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const ownerLinks = [
    { to: '/dashboard/owner', icon: <FiHome />, label: 'Dashboard' },
    { to: '/cabang', icon: <FiMapPin />, label: 'Kelola Cabang' },
    { to: '/users', icon: <FiUsers />, label: 'Kelola User' },
    { to: '/mutasi-approval', icon: <FiRepeat />, label: 'Approval Mutasi' },
    { to: '/laporan', icon: <FiBarChart2 />, label: 'Laporan' },
  ]

  const adminLinks = [
    { to: '/dashboard/admin', icon: <FiHome />, label: 'Dashboard' },
    { to: '/produk', icon: <FiPackage />, label: 'Produk' },
    { to: '/kategori', icon: <FiLayers />, label: 'Kategori' },
    { to: '/stok', icon: <FiList />, label: 'Persediaan' },
    { to: '/supplier', icon: <FiTruck />, label: 'Supplier' },
    { to: '/pembelian', icon: <FiShoppingBag />, label: 'Pembelian' },
    { to: '/mutasi', icon: <FiRepeat />, label: 'Mutasi Stok' },
    { to: '/riwayat-transaksi', icon: <FiClipboard />, label: 'Riwayat Transaksi' },
  ]

  const kasirLinks = [
    { to: '/dashboard/kasir', icon: <FiShoppingCart />, label: 'POS Kasir' },
    { to: '/riwayat', icon: <FiClock />, label: 'Riwayat Penjualan' },
  ]

  const links = user?.role === 'owner' ? ownerLinks : user?.role === 'admin' ? adminLinks : kasirLinks

  return (
    <>
      {/* Mobile overlay */}
      {open && <div onClick={onClose} className="lg:hidden fixed inset-0 bg-black/60 z-40" />}

      <aside className={`fixed lg:static top-0 left-0 z-50 h-screen w-64 bg-coffee-900 border-r border-white/5
        flex flex-col transition-transform duration-300 lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-xl text-accent">
              <FiCoffee size={24} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white font-[Outfit] tracking-tight">CoffeeSync</h1>
              <p className="text-[10px] text-coffee-400 font-medium">Distributed POS System</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 border-b border-white/5">
          <p className="text-sm font-bold text-white truncate">{user?.nama}</p>
          <p className="text-[11px] text-accent font-semibold capitalize flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            {user?.role} {user?.cabang ? `• ${user.cabang.nama_cabang}` : '• Pusat'}
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <span className="px-4 text-[10px] font-bold text-coffee-500 uppercase tracking-widest">Menu</span>
          {links.map(link => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={onClose}>
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/5">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-coffee-300
              hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <FiLogOut />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
