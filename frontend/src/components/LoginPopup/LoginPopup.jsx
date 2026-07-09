import React, { useState, useContext } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const LoginPopup = ({ setShowLogin }) => {
  const { baseUrl, setToken } = useContext(StoreContext);

  const [currState, setCurrState] = useState("login"); // "login" or "signup"
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const onLogin = async (event) => {
    event.preventDefault();
    try {
      const endpoint = currState === "login" ? "/user/login" : "/user/register";

      // Only send name for signup
      const payload =
        currState === "login"
          ? { email: data.email, password: data.password }
          : data;

      const res = await axios.post(`${baseUrl}/api${endpoint}`, payload);

      if (res.data.success) {
        // Save token
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
        setShowLogin(false);
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error(error.response || error);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState === "login" ? "Login" : "Sign Up"}</h2>
          <img
            src={assets.cross_icon}
            alt="close"
            onClick={() => setShowLogin(false)}
          />
        </div>

        {currState === "signup" && (
          <input
            name="name"
            value={data.name}
            onChange={onChangeHandler}
            type="text"
            placeholder="Name"
            required
          />
        )}

        <input
          name="email"
          value={data.email}
          onChange={onChangeHandler}
          type="email"
          placeholder="Email"
          required
        />
        <input
          name="password"
          value={data.password}
          onChange={onChangeHandler}
          type="password"
          placeholder="Password"
          required
        />

        <button type="submit">
          {currState === "login" ? "Login" : "Create Account"}
        </button>

        {currState === "login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrState("signup")}>Click Here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrState("login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
