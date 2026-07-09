import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";

const MyOrders = () => {
  const { apiUrl, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    if (!token) {
      setError("Please login to view your orders.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${apiUrl}/order/userorders`, {
        headers: { token },
      });

      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        setError(response.data.message || "Unable to load orders.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      {loading && <p>Loading orders...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && orders.length === 0 && <p>No orders found.</p>}

      <div className="my-orders-list">
        {orders.map((order) => (
          <div className="my-orders-order" key={order._id}>
            <div>
              <p className="my-orders-items">
                {order.items
                  ?.map((item) => `${item.name} x ${item.quantity || item.qty || 1}`)
                  .join(", ")}
              </p>
              <p>{new Date(order.date).toLocaleString()}</p>
            </div>
            <p>₹ {order.amount}</p>
            <p>{order.status}</p>
            <p>{order.payment ? "Paid" : "Payment pending"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
