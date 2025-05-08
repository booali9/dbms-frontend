import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUpload, FiTrash2, FiDownload } from 'react-icons/fi';

function BILLS() {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('https://dbms-project-iota.vercel.app/api/canteen/bills', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setBill(response.data.data);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to fetch bills');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('bill', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('https://dbms-project-iota.vercel.app/api/canteen/bill', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Bill uploaded successfully!');
        setBill(response.data.data);
        setFile(null);
        document.getElementById('file-upload').value = '';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload bill');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        await axios.delete('https://dbms-project-iota.vercel.app/api/canteen/bill', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setBill(null);
        setSuccess('Bill deleted successfully!');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete bill');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-red-600 mb-6">Bill Management</h1>
        
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-red-100 mb-8">
          <h2 className="text-xl font-semibold text-red-700 mb-4">Upload New Bill</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Bill (PDF/Image)
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-red-50 file:text-red-700
                  hover:file:bg-red-100"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-2
                  ${!file || isUploading ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              >
                <FiUpload />
                {isUploading ? 'Uploading...' : 'Upload Bill'}
              </button>
            </div>
          </div>
        </div>

        {/* Current Bill Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-red-100">
          <h2 className="text-xl font-semibold text-red-700 mb-4">Current Bill</h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-600">
              Loading...
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-md mb-4">
              {error}
            </div>
          ) : success ? (
            <div className="p-4 bg-green-50 text-green-600 rounded-md mb-4">
              {success}
            </div>
          ) : bill ? (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium text-gray-800">Uploaded Bill</p>
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(bill.lastUpdated).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={bill.billUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white border border-red-600 text-red-600 rounded-md hover:bg-red-50 flex items-center gap-2"
                >
                  <FiDownload /> View Bill
                </a>
                <button
                  onClick={handleDelete}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No bill uploaded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BILLS;