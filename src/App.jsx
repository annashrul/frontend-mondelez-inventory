import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MasterBarang from './pages/masterBarang';
import KelompokBarang from './pages/kelompokBarang';
import MasterRak from './pages/masterRak';
import MasterLokasi from './pages/masterLokasi';
import MasterSatuan from './pages/masterSatuan';
import LevelPengguna from './pages/levelPengguna';
import AdjustmentStok from './pages/adjustmentStok';
import KartuStok from './pages/kartuStok';
import PengambilanBarang from './pages/PengambilanBarang';
import CetakBarcode from './pages/CetakBarcode';
import LogActivity from './pages/LogActivity';
import Closing from './pages/Closing';
import Pengaturan from './pages/Pengaturan';
import { canAccess } from './lib/permissions';
import MasterPengguna from './pages/masterPengguna';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function AuthorizedRoute({ permission, children }) {
  const { user } = useAuth();
  return canAccess(user, permission) ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="master-barang" element={<AuthorizedRoute permission="barang.read"><MasterBarang /></AuthorizedRoute>} />
            <Route path="kelompok-barang" element={<AuthorizedRoute permission="barang.read"><KelompokBarang /></AuthorizedRoute>} />
            <Route path="master-rak" element={<AuthorizedRoute permission="rak.read"><MasterRak /></AuthorizedRoute>} />
            <Route path="master-lokasi" element={<AuthorizedRoute permission="rak.read"><MasterLokasi /></AuthorizedRoute>} />
            <Route path="master-satuan" element={<AuthorizedRoute permission="barang.read"><MasterSatuan /></AuthorizedRoute>} />
            <Route path="master-pengguna" element={<AuthorizedRoute permission="pengguna.read"><MasterPengguna /></AuthorizedRoute>} />
            <Route path="level-pengguna" element={<AuthorizedRoute permission="level.read"><LevelPengguna /></AuthorizedRoute>} />
            <Route path="adjustment-stok" element={<AuthorizedRoute permission="adjustment.read"><AdjustmentStok /></AuthorizedRoute>} />
            <Route path="kartu-stok" element={<AuthorizedRoute permission="kartu.read"><KartuStok /></AuthorizedRoute>} />
            <Route path="pengambilan-barang" element={<AuthorizedRoute permission="pengambilan.read"><PengambilanBarang /></AuthorizedRoute>} />
            <Route path="cetak-barcode" element={<AuthorizedRoute permission="barcode.read"><CetakBarcode /></AuthorizedRoute>} />
            <Route path="log-activity" element={<AuthorizedRoute permission="log.read"><LogActivity /></AuthorizedRoute>} />
            <Route path="closing" element={<AuthorizedRoute permission="closing.read"><Closing /></AuthorizedRoute>} />
            <Route path="pengaturan" element={<AuthorizedRoute permission="pengaturan.read"><Pengaturan /></AuthorizedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}
