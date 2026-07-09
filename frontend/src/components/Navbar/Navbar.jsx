import React, { useContext, useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setShowLogin }) => {
  const { getTotalCartItems, token, setToken } = useContext(StoreContext);
  const [menu, setMenu] = useState("Home");

  const navigate = useNavigate();

  const logout=()=>{
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  }

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="logo" className="logo" />
      </Link>

      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("Home")}
          className={menu === "Home" ? "active" : ""}
        >
          Home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => setMenu("Menu")}
          className={menu === "Menu" ? "active" : ""}
        >
          Menu
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("Contact-us")}
          className={menu === "Contact-us" ? "active" : ""}
        >
          Contact Us
        </a>
      </ul>

      <div className="navbar-right">
        <img src={assets.search_icon} alt="search" />

        <Link to="/cart" className="navbar-icon">
          <img src={assets.basket_icon} alt="cart" />
          {getTotalCartItems() > 0 && <div className="dot"></div>}
        </Link>

        {!token ? (
          <button onClick={() => setShowLogin(true)}>Sign In</button>
        ) : (
          // <div className="navbar-icons-loggedin">
          //   <Link to="/profile" className="navbar-icon">
          //     <img src={assets.user_icon} alt="profile" />
          //   </Link>
          //   <Link to="/orders" className="navbar-icon">
          //     <img src={assets.bag_icon} alt="orders" />
          //   </Link>
          //   <img
          //     src={assets.logout_icon}
          //     alt="logout"
          //     className="navbar-icon logout-icon"
          //     onClick={handleLogout}
          //     style={{ cursor: "pointer" }}
          //   />
          // </div>
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="" />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate("/myorders")}>
                <img src={assets.bag_icon} alt="" /><p>Orders</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="" /><p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
