import React, { useEffect, useState } from 'react'
import './Orders.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'

const orderStatuses = [
  'pending',
  'Food Processing',
  'Out for delivery',
  'Delivered',
]

const Orders = ({ url, adminToken, onUnauthorized }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get(`${url}/api/order/list`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      if (response.data.success) {
        setOrders(response.data.data || [])
      } else {
        const message = response.data.message || 'Error fetching orders'
        setError(message)
        toast.error(message)
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        onUnauthorized()
        return
      }
      const message = err.response?.data?.message || 'Server error'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId, status) => {
    try {
      const response = await axios.post(
        `${url}/api/order/status`,
        {
          orderId,
          status,
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )

      if (response.data.success) {
        toast.success(response.data.message || 'Order status updated')
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: response.data.order.status } : order
          )
        )
      } else {
        toast.error(response.data.message || 'Error updating order status')
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        onUnauthorized()
        return
      }
      toast.error(err.response?.data?.message || 'Error updating order status')
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div className='orders add'>
      <h3>Orders</h3>
      {loading && <p>Loading orders...</p>}
      {error && <p>{error}</p>}
      {!loading && orders.length === 0 && !error && <p>No orders found.</p>}

      <div className="order-list">
        {orders.map((order) => (
          <div className="order-item" key={order._id}>
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className="order-item-food">
                {order.items?.map((item) => `${item.name} x ${item.quantity || item.qty || 1}`).join(', ')}
              </p>
              <p>{order.address?.firstName} {order.address?.lastName}</p>
              <p>{order.address?.street}, {order.address?.city}, {order.address?.state}</p>
              <p>{order.address?.phone}</p>
            </div>
            <p>Items: {order.items?.length || 0}</p>
            <p>₹ {order.amount}</p>
            <select
              value={order.status}
              onChange={(event) => updateStatus(order._id, event.target.value)}
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
