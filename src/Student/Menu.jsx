import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MenuStudent() {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCanteenData();
  }, []);

  const fetchCanteenData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/canteen/getallmenu', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setCanteens(response.data.data || []);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch canteen data');
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never updated';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* All Canteens Header */}
      <div className="bg-red-600 text-white p-6 rounded-lg mb-6">
        <h1 className="text-2xl font-bold">Available Canteen Menus</h1>
      </div>

      {/* Canteens List */}
      {canteens.length === 0 ? (
        <p className="text-gray-500 italic">No canteens available</p>
      ) : (
        canteens.map((canteen, index) => (
          <div key={canteen._id || index} className="mb-8">
            {/* Individual Canteen Header */}
            <div className="bg-red-100 p-4 rounded-lg mb-4">
              <h2 className="text-xl font-bold text-red-800">{canteen.canteenName || 'Unnamed Canteen'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-red-700">Owner: {canteen.owner || 'N/A'}</p>
                  <p className="text-red-700">Email: {canteen.email || 'N/A'}</p>
                </div>
                <p className="text-red-700 md:text-right">
                  Last Updated: {formatDate(canteen.lastUpdated)}
                </p>
              </div>
            </div>

            {/* Menu Section for this Canteen */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-red-700 mb-3 pb-1 border-b border-red-200">
                Menu Items
              </h3>
              
              {canteen.menu?.length === 0 ? (
                <p className="text-gray-500 italic">No menu items available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-red-50">
                        <th className="py-2 px-3 text-left text-red-700 font-semibold">Item</th>
                        <th className="py-2 px-3 text-left text-red-700 font-semibold">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100">
                      {canteen.menu?.map((item) => (
                        <tr key={item._id}>
                          <td className="py-2 px-3">{item.item}</td>
                          <td className="py-2 px-3 text-red-600 font-medium">{item.price} Rs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MenuStudent;
