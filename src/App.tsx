import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/Login/Login'
import QRCodeReader from './components/QRCodeReader/QRCodeReader'

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Navigate to="/login" replace />} />
          <Route path='*' element={<Navigate to="/login" replace />} />
          <Route path='/qr-reader' element={<QRCodeReader />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
