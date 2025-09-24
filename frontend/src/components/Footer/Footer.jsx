import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'


const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className='footer-content'>
            <div className='footer-content-left'>
                <img src={assets.logo} alt="" />
                <p>Delivering delicious food to your doorstep.  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Numquam velit veniam perspiciatis incidunt at fuga fugit, eligendi nobis esse. Maxime dolore, totam corporis excepturi explicabo atque deleniti modi a sint!</p>
                <div className='footer-social-links'>
                    <img src={assets.facebook_icon} alt="" />
                    <img src={assets.twitter_icon} alt="" />
                    <img src={assets.instagram_icon} alt="" />
                </div>
            </div>
            <div className='footer-content-center'>
                <h2>COMPANY</h2>
                <ul>
                    <li>Home</li>
                    <li>About Us</li>
                    <li>Delivery</li>
                    <li>Privacy Policy</li>
                </ul>
            </div>
            <div className='footer-content-right'>
                <h2>GET IN TOUCH</h2>
                <ul>
                    <li>Email: info@fooddelivery.com</li>
                    <li>Phone: +123 456 7890</li>
                </ul>
            </div>
                
        </div>
        <hr />
        <p className='footer-copyright'>© 2023 Food Delivery. All rights reserved.</p>

    </div>
  )
}

export default Footer
