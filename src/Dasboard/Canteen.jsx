import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CanteenInfo() {
  const [canteens, setCanteens] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCanteenData();
    fetchBills();
  }, []);

  const fetchCanteenData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://dbms-project-iota.vercel.app/api/canteen/getallmenu', {
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

  const fetchBills = async () => {
    try {
      const response = await axios.get('https://dbms-project-iota.vercel.app/api/canteen/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setBills(response.data.bills || []);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
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
        <h1 className="text-2xl font-bold">All Canteens</h1>
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

      {/* Bills Section (Common for all canteens) */}
      <div>
        <h2 className="text-xl font-semibold text-red-700 mb-4 pb-2 border-b border-red-200">
          Bills
        </h2>
        
        {bills.length === 0 ? (
          <p className="text-gray-500 italic">No bills available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bills.map((bill) => (
              <div key={bill._id} className="bg-white border border-red-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-medium">Bill ID: {bill._id.slice(-6)}</span>
                </div>
                <a
                  href={bill.bill}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  View Bill
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CanteenInfo;