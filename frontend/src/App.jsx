import { Toaster, toast } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router';
import Pos from './pages/Pos';
import Login from './pages/Login';

function App() {

  return (
    <>
      <Toaster richColors position='top-center'/>
      <BrowserRouter>
        <Routes>
          <Route path="/pos" element={<Pos />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Pos />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
