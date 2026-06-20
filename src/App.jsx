import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import LoginPage from './pages/auth/LoginPage'

// Dashboards
import OwnerDashboard from './pages/dashboard/OwnerDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import KasirDashboard from './pages/dashboard/KasirDashboard'

// Owner Pages
import CabangPage from './pages/owner/CabangPage'
import UserManagementPage from './pages/owner/UserManagementPage'
import MutasiApprovalPage from './pages/owner/MutasiApprovalPage'
import LaporanPage from './pages/owner/LaporanPage'

// Admin Pages
import ProdukPage from './pages/admin/ProdukPage'
import KategoriPage from './pages/admin/KategoriPage'
import StokPage from './pages/admin/StokPage'
import SupplierPage from './pages/admin/SupplierPage'
import PembelianPage from './pages/admin/PembelianPage'
import MutasiPage from './pages/admin/MutasiPage'
import RiwayatTransaksiPage from './pages/admin/RiwayatTransaksiPage'

// Kasir Pages
import RiwayatPage from './pages/kasir/RiwayatPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Dashboard */}
          <Route element={
            <ProtectedRoute allowedRoles={['owner', 'admin', 'kasir']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* Owner Routes */}
            <Route path="/dashboard/owner" element={
              <ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>
            } />
            <Route path="/cabang" element={
              <ProtectedRoute allowedRoles={['owner']}><CabangPage /></ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['owner']}><UserManagementPage /></ProtectedRoute>
            } />
            <Route path="/mutasi-approval" element={
              <ProtectedRoute allowedRoles={['owner']}><MutasiApprovalPage /></ProtectedRoute>
            } />
            <Route path="/laporan" element={
              <ProtectedRoute allowedRoles={['owner']}><LaporanPage /></ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/dashboard/admin" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/produk" element={
              <ProtectedRoute allowedRoles={['admin']}><ProdukPage /></ProtectedRoute>
            } />
            <Route path="/kategori" element={
              <ProtectedRoute allowedRoles={['admin']}><KategoriPage /></ProtectedRoute>
            } />
            <Route path="/stok" element={
              <ProtectedRoute allowedRoles={['admin']}><StokPage /></ProtectedRoute>
            } />
            <Route path="/supplier" element={
              <ProtectedRoute allowedRoles={['admin']}><SupplierPage /></ProtectedRoute>
            } />
            <Route path="/pembelian" element={
              <ProtectedRoute allowedRoles={['admin']}><PembelianPage /></ProtectedRoute>
            } />
            <Route path="/mutasi" element={
              <ProtectedRoute allowedRoles={['admin']}><MutasiPage /></ProtectedRoute>
            } />
            <Route path="/riwayat-transaksi" element={
              <ProtectedRoute allowedRoles={['admin']}><RiwayatTransaksiPage /></ProtectedRoute>
            } />

            {/* Kasir Routes */}
            <Route path="/dashboard/kasir" element={
              <ProtectedRoute allowedRoles={['kasir']}><KasirDashboard /></ProtectedRoute>
            } />
            <Route path="/riwayat" element={
              <ProtectedRoute allowedRoles={['kasir']}><RiwayatPage /></ProtectedRoute>
            } />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

