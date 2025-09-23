import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import './App.css'
import QRCodeReader from './components/QRCodeReader/QRCodeReader'
import LoginPage from './pages/LoginPage/LoginPage'
import AdminPage from './pages/AdminPage/AdminPage'
import RegisterActivityPage from './pages/RegisterActivityPage/RegisterActivityPage'
import ListActivityPage from './pages/ListActivityPage/ListActivityPage'
import ParticipantPage from './pages/ParticipantPage/ParticipantPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/' element={<Navigate to="/login" replace />} />
        <Route path='*' element={<Navigate to="/login" replace />} />
        <Route path='/admin' element={<AdminPage />} />
        <Route path='/participante' element={<ParticipantPage />} />
        <Route path='/cadastro-atividades' element={<RegisterActivityPage />} />
        <Route path='/lista-atividades' element={<ListActivityPage/>} />
        <Route path='/qr-reader' element={<QRCodeReader />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
