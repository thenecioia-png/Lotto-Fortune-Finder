import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import InstallBanner from './components/InstallBanner';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Dreams from './pages/Dreams';
import Chat from './pages/Chat';
import Subscription from './pages/Subscription';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Sin min-h-screen aquí — cada página gestiona su propia altura */}
        <div className="stars-bg" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          {/* pt-16 = 64px para compensar el navbar fixed */}
          <main style={{ paddingTop: '64px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sorteos" element={<Schedule />} />
              <Route path="/suenos" element={<Dreams />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/suscripcion" element={<Subscription />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <InstallBanner />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
