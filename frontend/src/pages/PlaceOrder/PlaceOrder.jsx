import React, { useContext, useState } from 'react'
import './PlaceOrder.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const PlaceOrder = () => {
  const { apiUrl, cartItems, clearCart, food_list, getTotalCartAmount, token } = useContext(StoreContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  })

  const subtotal = getTotalCartAmount()
  const deliveryFee = subtotal > 0 ? 2 : 0
  const total = subtotal + deliveryFee

  const onChangeHandler = (event) => {
    setAddress((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault()

    if (!token) {
      alert('Please login to place an order')
      return
    }

    const orderItems = food_list
      .filter((item) => cartItems[item._id])
      .map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: cartItems[item._id],
      }))

    if (orderItems.length === 0) {
      alert('Your cart is empty')
      return
    }

    try {
      setLoading(true)

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        alert('Unable to load Razorpay checkout')
        return
      }

      const response = await axios.post(
        `${apiUrl}/order/place`,
        {
          items: orderItems,
          amount: total,
          address,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!response.data.success) {
        alert(response.data.message || 'Unable to start payment')
        return
      }

      const options = {
        key: response.data.keyId,
        amount: response.data.amount,
        currency: response.data.currency,
        name: 'Food Delivery',
        description: 'Food order payment',
        order_id: response.data.razorpayOrderId,
        prefill: {
          name: `${address.firstName} ${address.lastName}`.trim(),
          email: address.email,
          contact: address.phone,
        },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await axios.post(
              `${apiUrl}/order/verify`,
              {
                orderId: response.data.orderId,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )

            if (verifyResponse.data.success) {
              clearCart()
              navigate('/myorders')
            } else {
              alert(verifyResponse.data.message || 'Payment verification failed')
            }
          } catch (error) {
            alert(error.response?.data?.message || 'Payment verification failed')
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to place order')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="place-order" onSubmit={placeOrder}>
        <div className="place-order-left">
          <p className='title'>Delivery Address</p>
          <div className="multi-fields">
            <input name="firstName" value={address.firstName} onChange={onChangeHandler} type="text" placeholder='First Name' required />
            <input name="lastName" value={address.lastName} onChange={onChangeHandler} type="text" placeholder='Last Name' required />
          </div>
          <input name="email" value={address.email} onChange={onChangeHandler} type="email" placeholder='Email Address' required />
          <input name="street" value={address.street} onChange={onChangeHandler} type="text" placeholder='Street Address' required />
          <div className="multi-fields">
            <input name="city" value={address.city} onChange={onChangeHandler} type="text" placeholder='City' required />
            <input name="state" value={address.state} onChange={onChangeHandler} type="text" placeholder='State' required />
          </div>
          <div className="multi-fields">
            <input name="zipcode" value={address.zipcode} onChange={onChangeHandler} type="text" placeholder='Zip Code' required />
            <input name="country" value={address.country} onChange={onChangeHandler} type="text" placeholder='Country' required />
          </div>
          <input name="phone" value={address.phone} onChange={onChangeHandler} type="text" placeholder='Phone Number' required />
        </div>
        <div className="place-order-right">
          <div className="cart-total">
            <h2>Total:</h2>
            <div>
              <div className="cart-total-details">
                <p>Subtotal:</p>
                <p>₹ {subtotal}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>₹ {deliveryFee}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total:</b>
                <b>₹ {total}</b>
              </div>
            </div>
            <button type="submit" disabled={loading}>{loading ? 'PROCESSING...' : 'PROCEED TO CHECKOUT'}</button>
          </div>
        </div>
    </form>
  )
}

export default PlaceOrder
