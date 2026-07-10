import React, { useEffect, useState } from 'react';
import './List.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const List = ({url, adminToken, onUnauthorized}) => {
    const [list, SetList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchList = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(`${url}/api/food/list`);
            if (response.data.success) {
                SetList(response.data.data);
            } else {
                const message = response.data.message || "Error fetching list";
                setError(message);
                toast.error(message);
            }
        } catch (error) {
            const message = error.response?.data?.message || "Server error";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const removeFood = async (foodId) => {
        try {
            const response = await axios.post(
                `${url}/api/food/remove`,
                {id:foodId},
                { headers: { Authorization: `Bearer ${adminToken}` } }
            );
            await fetchList();
            if(response.data.success){
                toast.success("Food item removed successfully");
            } else {
                toast.error(response.data.message || "Error removing food item");
            }
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                onUnauthorized();
                return;
            }
            toast.error(error.response?.data?.message || "Error removing food item");
        }
    }
        

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <div className='list add flex-col'>
            <p>All Foods List</p>
            {loading && <p>Loading foods...</p>}
            {error && <p>{error}</p>}
            <div className='list-table'>
                <div className="list-table-format">
                    <b>Image</b>
                    <b>Name</b>
                    <b>Category</b>
                    <b>Price</b>
                    <b>Action</b>
                </div>
                {!loading && list.length === 0 && !error && <p>No food items found.</p>}
                {list.map((item, index) => (
                    <div key={index} className='list-table-format'>
                        <img src={`${url}/images/${item.image}`} alt={item.name} />
                        <p>{item.name}</p>
                        <p>{item.category}</p>
                        <p>${item.price}</p>
                        <p onClick={() => removeFood(item._id)} className='cursor'>X</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default List;
