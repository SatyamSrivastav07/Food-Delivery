import React from 'react'
import './PlaceOrder.css'
import { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'

const PlaceOrder = () => {
  const {getTotalCartAmount}=useContext(StoreContext)

  const subtotal = getTotalCartAmount()
  const deliveryFee = subtotal > 0 ? 2 : 0
  const total = subtotal + deliveryFee
  return (
    <form className="place-order">
        <div className="place-order-left">
          <p className='title'>Delivery Address</p>
          <div className="multi-fields">
            <input type="text" placeholder='First Name' />
            <input type="text" placeholder='Last Name' />
          </div>
          <input type="text" placeholder='Email Address' />
          <input type="text" placeholder='Street Address' />
          <div className="multi-fields">
            <input type="text" placeholder='City' />
            <input type="text" placeholder='State' />
          </div>
          <div className="multi-fields">
            <input type="text" placeholder='Zip Code' />
            <input type="text" placeholder='Country' />
          </div>
          <input type="text" placeholder='Phone Number' />
        </div>
        <div className="place-order-right">
          <div className="cart-total">
            <h2>Total:</h2>
            <div>
              <div className="cart-total-details">
                <p>Subtotal:</p>
                <p>${subtotal}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>${deliveryFee}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total:</b>
                <b>${total}</b>
              </div>
            </div>
            <button>PROCEED TO CHECKOUT</button>
          </div>
        </div>
    </form>
  )
}

export default PlaceOrder
