import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import './App.css'
import QRCodeReader from './components/QRCodeReader/QRCodeReader'
import LoginPage from './pages/LoginPage/LoginPage'
import AdminPage from './pages/AdminPage/AdminPage'
import RegisterActivityPage from './pages/RegisterActivityPage/RegisterActivityPage'
import ListActivityPage from './pages/ListActivityPage/ListActivityPage'
import ParticipantPage from './pages/ParticipantPage/ParticipantPage'
import ActivityPage from './pages/ActivityPage/ActivityPage'
import { useEffect, useState } from 'react';
import RegisterUserPage from './pages/RegisterUserPage/RegisterUserPage'
import TableActivityPage from './pages/TableActivityPage/TableActivityPage'

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    if (storedToken && userRole) {
      setToken(storedToken);
      setRole(userRole);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (newToken: string, newRole: string) => {
    setToken(newToken);
    setRole(newRole);
  };

  if (isLoading) {
    return <div className="loading-page"><h3>Carregando...</h3></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {!token ? (
          <>
            <Route path='/login' element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path='*' element={<Navigate to="/login" replace />} />
            <Route path="cadastro" element={<RegisterUserPage />} />
          </>
        ) : (
          <>
            {
              role === 'ADMIN' ? (
                <>
                  <Route path='/admin' element={<AdminPage />} />
                  <Route path='/cadastro-atividades' element={<RegisterActivityPage />} />
                  <Route path='/' element={<Navigate to="/admin" replace />} />
                  <Route path='*' element={<Navigate to="/admin" replace />} />
                  <Route path='/login' element={<Navigate to="/admin" replace />} />
                  <Route path='/acoes-atividades' element={<TableActivityPage />}/>
                </>
              ) : (
                <Route path='*' element={<ActivityPage />} />
              )
            }
            <Route path='/participante' element={<ParticipantPage />} />
            <Route path='/atividades' element={<ActivityPage />} />
            <Route path='/lista-atividades' element={<ListActivityPage />} />
            <Route path='/qr-reader' element={<QRCodeReader />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App