import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { food_list as localFoodList } from "../assets/assets";

export const StoreContext = createContext();

const StoreContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [food_list, setFoodList] = useState([]);

  const configuredUrl = import.meta.env.VITE_API_URL || "";
  const baseUrl = configuredUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  const apiUrl = `${baseUrl}/api`;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const getImageUrl = (item) => {
    if (!item?.image) return "";
    if (item.source === "backend") return `${baseUrl}/images/${item.image}`;
    return item.image;
  };

  const updateLocalCartAdd = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const updateLocalCartRemove = (itemId) => {
    setCartItems((prev) => {
      if (prev[itemId] > 1) return { ...prev, [itemId]: prev[itemId] - 1 };
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  const addToCart = async (itemId) => {
    updateLocalCartAdd(itemId);

    if (!token) {
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/cart/add`,
        { itemId },
        { headers: authHeaders }
      );
      if (response.data.success) setCartItems(response.data.cartData || {});
    } catch (err) {
      console.error("Error adding item to cart:", err);
    }
  };

  const removeFromCart = async (itemId) => {
    updateLocalCartRemove(itemId);

    if (!token) {
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/cart/remove`,
        { itemId },
        { headers: authHeaders }
      );
      if (response.data.success) setCartItems(response.data.cartData || {});
    } catch (err) {
      console.error("Error removing item from cart:", err);
    }
  };

  const fetchCart = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${apiUrl}/cart/`, { headers: authHeaders });
      if (response.data.success) setCartItems(response.data.cartData || {});
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const clearCart = () => {
    setCartItems({});
  };

  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [id, qty]) => {
      const item = food_list.find((food) => food._id === id || food._id === Number(id));
      return item ? total + item.price * qty : total;
    }, 0);
  };

  const getTotalCartItems = () =>
    Object.values(cartItems).reduce((total, qty) => total + qty, 0);

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${apiUrl}/food/list`);
      const backendData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      const backendList = backendData.map((item) => ({ ...item, source: "backend" }));
      const localList = localFoodList.map((item) => ({ ...item, source: "local" }));

      setFoodList([...backendList, ...localList]);
    } catch (err) {
      console.error("Error fetching food list:", err);
      setFoodList(localFoodList.map((item) => ({ ...item, source: "local" })));
    }
  };

  useEffect(() => {
    fetchFoodList();
  }, []);

  useEffect(() => {
    fetchCart();
  }, [token]);

  return (
    <StoreContext.Provider
      value={{
        food_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        getTotalCartItems,
        getImageUrl,
        clearCart,
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
