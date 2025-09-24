import React from 'react'
import './LoginPopup.css'
import { useState } from 'react'
import { assets } from '../../assets/assets'

const LoginPopup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState("login");
  return (
    <div className='login-popup'>
      <form className='login-popup-container'>
        <div className='login-popup-title'>
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
        </div>
        <div className='login-popup-input'>
          {currState === "login" ? <></> : <input type="text" placeholder='name' required />}
          <input type="email" placeholder='email' required />
          <input type="password" placeholder='password' required />
        </div>
        <button>{currState === "signup" ? "Create account" : "Login"}</button>
        <div className='login-popup-condition'>
          <input type="checkbox" required />
          <p>I agree to the terms and conditions</p>
        </div>
        {currState === "login"
          ? <p> Create a new account ? <span onClick={() => setCurrState("signup")}>Click Here</span></p>
          : <p>Already have an account? <span onClick={() => setCurrState("login")}>Login here</span></p>
        }
      </form>
    </div>
  )
}

export default LoginPopup
    