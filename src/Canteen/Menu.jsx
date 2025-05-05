import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MenuManagement = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [editingItem, setEditingItem] = useState(null);
  const [canteenInfo, setCanteenInfo] = useState({ 
    name: 'My Canteen', 
    lastUpdated: 'Never' 
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/canteen/getmenu', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Handle both response formats:
        // 1. {success: true, data: {menu: [...], canteenName: '', updatedAt: ''}}
        // 2. {success: true, data: [...]}
        const menuData = Array.isArray(response.data.data) 
          ? response.data.data 
          : response.data.data?.menu || [];
        
        setMenu(menuData);
        
        // Set canteen info if available
        if (response.data.data && !Array.isArray(response.data.data)) {
          setCanteenInfo({
            name: response.data.data.canteenName || 'My Canteen',
            lastUpdated: response.data.data.updatedAt 
              ? new Date(response.data.data.updatedAt).toLocaleString() 
              : 'Never'
          });
        }
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setMenu([]);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch menu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return;
    
    try {
      const updatedMenu = [...menu, { 
        item: newItem.name, 
        price: parseFloat(newItem.price) 
      }];
      
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/canteen/menu', 
        { menu: updatedMenu },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewItem({ name: '', price: '' });
      fetchMenu(); // Refresh to get the latest data with IDs
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !editingItem.item || editingItem.price === undefined) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/canteen/menu/${editingItem._id}`,
        { item: editingItem.item, price: editingItem.price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEditingItem(null);
      fetchMenu(); // Refresh the menu
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item');
    }
  };
  
  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:3000/api/canteen/menu/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchMenu(); // Refresh the menu
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item');
    }
  };
  const handleDeleteMenu = async () => {
    if (window.confirm('Are you sure you want to delete the entire menu?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          'http://localhost:3000/api/canteen/menu',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setMenu([]);
        setCanteenInfo(prev => ({ ...prev, lastUpdated: 'Never' }));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete menu');
      }
    }
  };

  if (loading) return (
    <div className="text-center py-8 text-gray-600">
      Loading menu...
    </div>
  );

  if (error) return (
    <div className="p-5 text-red-600 bg-red-100 rounded-lg">
      {error}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {canteenInfo.name} Menu
      </h2>
      <p className="text-gray-600 mb-6">
        Last updated: {canteenInfo.lastUpdated}
      </p>
      
      {/* Add/Edit Form */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Item name"
          value={editingItem ? editingItem.item : newItem.name}
          onChange={(e) => editingItem 
            ? setEditingItem({...editingItem, item: e.target.value})
            : setNewItem({...newItem, name: e.target.value})}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <input
          type="number"
          placeholder="Price"
          value={editingItem ? editingItem.price : newItem.price}
          onChange={(e) => editingItem 
            ? setEditingItem({...editingItem, price: parseFloat(e.target.value)})
            : setNewItem({...newItem, price: parseFloat(e.target.value)})}
          className="w-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
          min="0"
          step="0.01"
        />
        {editingItem ? (
          <>
            <button 
              onClick={handleUpdateItem}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Update
            </button>
            <button 
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button 
            onClick={handleAddItem}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Add Item
          </button>
        )}
      </div>
      
      {/* Menu Items List */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Current Menu Items
        </h3>
        {menu.length === 0 ? (
          <p className="text-gray-500">No items in the menu yet</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {menu.map((item, index) => (
              <li key={item._id || index} className="py-3 flex justify-between items-center">
                <span className="text-gray-800">
                  {item.item} - {item.price.toFixed(2)}Rs
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingItem(item)}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleRemoveItem(item._id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={fetchMenu}
          className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Refresh Menu
        </button>
        <button 
          onClick={handleDeleteMenu}
          disabled={menu.length === 0}
          className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
            menu.length === 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600 transition-colors'
          }`}
        >
          Delete Entire Menu
        </button>
      </div>
    </div>
  );
};

export default MenuManagement;