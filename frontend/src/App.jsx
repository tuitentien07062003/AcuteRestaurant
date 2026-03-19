import { Toaster, toast } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router';
import { GlobalProvider } from '@/context/GlobalContext';
import Pos from './pages/Pos';
import Admin from './pages/Admin';
import Login from './pages/Login';

function App() {

  return (
    <>
      <Toaster richColors position='top-center'/>
      <GlobalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/pos" element={<Pos />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/doanhthu" element={<Admin />} />
            <Route path="/admin/kiemkho" element={<Admin />} />
            <Route path="/admin/tinhluong" element={<Admin />} />
            <Route path="/admin/nhanvien" element={<Admin />} />
            <Route path="/admin/hoso" element={<Admin />} />
            <Route path="/admin/phie_thanhtoan" element={<Admin />} />
            <Route path="*" element={<Pos />} />
          </Routes>
        </BrowserRouter>
      </GlobalProvider>
    </>
  );
}

export default App

