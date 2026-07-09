import React, { useContext, useState } from 'react'
import './PlaceOrder.css'
import axios from 'axios'
import { StoreContext } from '../../context/StoreContext'

const PlaceOrder = () => {
  const { apiUrl, cartItems, food_list, getTotalCartAmount, token } = useContext(StoreContext)
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
      const response = await axios.post(
        `${apiUrl}/order/place`,
        {
          items: orderItems,
          amount: total,
          address,
        },
        { headers: { token } }
      )

      if (response.data.success && response.data.session_url) {
        window.location.href = response.data.session_url
      } else {
        alert(response.data.message || 'Unable to start checkout')
      }
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
            <button type="submit" disabled={loading}>{loading ? 'REDIRECTING...' : 'PROCEED TO CHECKOUT'}</button>
          </div>
        </div>
    </form>
  )
}

export default PlaceOrder
