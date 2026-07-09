import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'

const Verify = () => {
  const { apiUrl, clearCart, token } = useContext(StoreContext)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState('Verifying payment...')

  useEffect(() => {
    const verifyPayment = async () => {
      const success = searchParams.get('success')
      const orderId = searchParams.get('orderId')
      const sessionId = searchParams.get('session_id')

      if (success !== 'true') {
        setMessage('Payment cancelled.')
        return
      }

      if (!token || !orderId || !sessionId) {
        setMessage('Unable to verify payment.')
        return
      }

      try {
        const response = await axios.post(
          `${apiUrl}/order/verify`,
          { orderId, sessionId },
          { headers: { token } }
        )

        if (response.data.success) {
          clearCart()
          setMessage('Payment successful. Order placed.')
          setTimeout(() => navigate('/'), 1500)
        } else {
          setMessage(response.data.message || 'Payment verification failed.')
        }
      } catch (error) {
        setMessage(error.response?.data?.message || 'Payment verification failed.')
      }
    }

    verifyPayment()
  }, [])

  return (
    <div className="app">
      <p>{message}</p>
    </div>
  )
}

export default Verify
