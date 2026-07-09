import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category = "All" }) => {
  const { food_list } = useContext(StoreContext);

  const filteredFoods = Array.isArray(food_list)
    ? food_list.filter(
        (item) => category === "All" || item.category === category
      )
    : [];

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((item) => (
            <FoodItem
              key={item._id}
              _id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              source={item.source}  // ✅ must be included
            />
          ))
        ) : (
          <p>No items found in this category.</p>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;
