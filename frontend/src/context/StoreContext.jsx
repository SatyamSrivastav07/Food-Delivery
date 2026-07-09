import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { food_list as localFoodList } from "../assets/assets"; // local data

export const StoreContext = createContext();

const StoreContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [food_list, setFoodList] = useState([]);

  const apiUrl = "http://localhost:4000/api"; // backend API
  const baseUrl = "http://localhost:4000";    // for image base path

  // ➕ Add to Cart
  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  // ➖ Remove from Cart
  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      if (prev[itemId] > 1) return { ...prev, [itemId]: prev[itemId] - 1 };
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  // 💰 Total Cart Amount
  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [id, qty]) => {
      const item = food_list.find((f) => f._id === id || f._id === Number(id));
      return item ? total + item.price * qty : total;
    }, 0);
  };

  // 🛒 Total Cart Items
  const getTotalCartItems = () =>
    Object.values(cartItems).reduce((a, b) => a + b, 0);

  // 🍔 Fetch food list from backend + local merge
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${apiUrl}/food/list`);
      let backendList = [];

      if (Array.isArray(response.data)) backendList = response.data;
      else if (Array.isArray(response.data.data)) backendList = response.data.data;

      // ✅ Mark backend items
      backendList = backendList.map(item => ({ ...item, source: "backend" }));

      // ✅ Mark local items
      const localListWithSource = localFoodList.map(item => ({
        ...item,
        source: "local"
      }));

      // ✅ Merge both
      setFoodList([...backendList, ...localListWithSource]);
    } catch (err) {
      console.error("Error fetching food list:", err);
      // fallback to local
      setFoodList(localFoodList.map(item => ({ ...item, source: "local" })));
    }
  };

  useEffect(() => {
    fetchFoodList();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        food_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        getTotalCartItems,
        apiUrl,
        baseUrl,
        token,
        setToken,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
