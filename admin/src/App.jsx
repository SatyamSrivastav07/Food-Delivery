import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import './index.css'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Login from './pages/Login/Login'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const url = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const navigate = useNavigate()
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '')

  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token)
    setAdminToken(token)
    navigate('/add')
  }

  const handleUnauthorized = () => {
    localStorage.removeItem('adminToken')
    setAdminToken('')
    navigate('/login')
  }

  if (!adminToken) {
    return (
      <div>
        <ToastContainer/>
        <Routes>
          <Route path="/login" element={<Login url={url} onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    )
  }

  return (
    <div>
      <ToastContainer/>
      <Navbar/>
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/add" replace />} />
          <Route path="/login" element={<Navigate to="/add" replace />} />
          <Route path="/add" element={<Add url={url} adminToken={adminToken} onUnauthorized={handleUnauthorized} />} />
          <Route path="/list" element={<List url={url} adminToken={adminToken} onUnauthorized={handleUnauthorized} />} />
          <Route path="/orders" element={<Orders url={url} adminToken={adminToken} onUnauthorized={handleUnauthorized} />} />
          <Route path="*" element={<Navigate to="/add" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
