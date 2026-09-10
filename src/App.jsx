import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MasterBarang from './pages/MasterBarang';
import KelompokBarang from './pages/KelompokBarang';
import MasterRak from './pages/MasterRak';
import MasterLokasi from './pages/MasterLokasi';
import MasterSatuan from './pages/MasterSatuan';
import MasterPengguna from './pages/MasterPengguna';
import LevelPengguna from './pages/LevelPengguna';
import AdjustmentStok from './pages/AdjustmentStok';
import KartuStok from './pages/KartuStok';
import PengambilanBarang from './pages/PengambilanBarang';
import CetakBarcode from './pages/CetakBarcode';
import LogActivity from './pages/LogActivity';
import Closing from './pages/Closing';
import Pengaturan from './pages/Pengaturan';

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
            <Route path="master-barang" element={<MasterBarang />} />
            <Route path="kelompok-barang" element={<KelompokBarang />} />
            <Route path="master-rak" element={<MasterRak />} />
            <Route path="master-lokasi" element={<MasterLokasi />} />
            <Route path="master-satuan" element={<MasterSatuan />} />
            <Route path="master-pengguna" element={<MasterPengguna />} />
            <Route path="level-pengguna" element={<LevelPengguna />} />
            <Route path="adjustment-stok" element={<AdjustmentStok />} />
            <Route path="kartu-stok" element={<KartuStok />} />
            <Route path="pengambilan-barang" element={<PengambilanBarang />} />
            <Route path="cetak-barcode" element={<CetakBarcode />} />
            <Route path="log-activity" element={<LogActivity />} />
            <Route path="closing" element={<Closing />} />
            <Route path="pengaturan" element={<Pengaturan />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}
