import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import './Login.css'

const Login = ({ url, onLogin }) => {
  const [data, setData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const onChangeHandler = (event) => {
    const { name, value } = event.target
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(`${url}/api/user/login`, data)

      if (!response.data.success) {
        toast.error(response.data.message || 'Login failed')
        return
      }

      if (response.data.role !== 'admin') {
        toast.error('Admin access required')
        return
      }

      onLogin(response.data.token)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-form" onSubmit={onSubmitHandler}>
        <h2>Admin Login</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={data.email}
          onChange={onChangeHandler}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={data.password}
          onChange={onChangeHandler}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default Login
