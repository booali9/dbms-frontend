import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Create a custom icon for markers
const createMarkerIcon = () => {
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const LocationTrackerpoint = () => {
  const [pointUsers, setPointUsers] = useState([]);
  const [message, setMessage] = useState('');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  
  // Get user from localStorage
  const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current).setView([0, 0], 2);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when pointUsers change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const markers = markersRef.current;

    // Clear existing markers
    Object.values(markers).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    // Add new markers
    pointUsers.forEach(user => {
      const marker = L.marker([user.latitude, user.longitude], {
        icon: createMarkerIcon()
      })
      .addTo(map)
      .bindPopup(`
        <b>User ID:</b> ${user.userId}<br>
        <b>Role:</b> ${user.role || 'N/A'}<br>
        <b>Last updated:</b> ${new Date(user.lastUpdated).toLocaleString()}
      `);
      
      markersRef.current[user.userId] = marker;
    });

    // Fit map to bounds if we have markers
    if (pointUsers.length > 0) {
      const bounds = L.latLngBounds(pointUsers.map(user => [user.latitude, user.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pointUsers]);

  // Set location handler
  const setLocation = async () => {
    const user = getUser();
    if (!user) {
      setMessage('Error: User not found in localStorage');
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;
          const response = await axios.post('https://dbms-project-iota.vercel.app/api/location/set', {
            userId: user._id, // Use user ID from localStorage
            longitude,
            latitude,
            role: user.role // Use role from localStorage
          });
          setMessage(response.data.message);
          
          if (user.role === 'point') {
            startLocationUpdates(user._id, longitude, latitude);
          }

          // Center map on current location
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 13);
          }
        },
        (error) => {
          setMessage(`Error getting location: ${error.message}`);
        },
        { enableHighAccuracy: true }
      );
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  // Start periodic location updates for point users
  const startLocationUpdates = (userId, initialLng, initialLat) => {
    const user = getUser();
    if (!user) return;

    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;
          await axios.post('https://dbms-project-chi-ten.vercel.app/api/location/set', {
            userId: user._id,
            longitude,
            latitude,
            role: user.role
          });
        },
        (error) => {
          console.error('Error updating location:', error);
        },
        { enableHighAccuracy: true }
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  };

  // Fetch point users locations
  const getPointUsersLocations = async () => {
    try {
      const response = await axios.get('https://dbms-project-chi-ten.vercel.app/api/location/point-users');
      setPointUsers(response.data);
      setMessage('Point users locations retrieved successfully');
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000');

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'location-update') {
        setPointUsers(prev => {
          const exists = prev.some(user => user.userId === data.userId);
          if (exists) {
            return prev.map(user => 
              user.userId === data.userId ? { ...user, ...data } : user
            );
          } else {
            return [...prev, data];
          }
        });
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  // Load point users initially
  useEffect(() => {
    getPointUsersLocations();
  }, []);

  return (
    <div className="location-tracker" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Point User Location Tracking</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={setLocation}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Set My Location
        </button>
        <button 
          onClick={getPointUsersLocations}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Point Users
        </button>
      </div>
      
      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
          borderLeft: message.includes('Error') ? '4px solid #f44336' : '4px solid #4CAF50',
          color: message.includes('Error') ? '#f44336' : '#2e7d32'
        }}>
          {message}
        </div>
      )}
      
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '500px', 
          marginBottom: '20px', 
          borderRadius: '8px', 
          overflow: 'hidden' 
        }}
      ></div>
      
      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
        <h3 style={{ marginTop: '0' }}>Active Point Users:</h3>
        <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
          {pointUsers.map((user, index) => (
            <li 
              key={index} 
              style={{
                padding: '10px',
                marginBottom: '8px',
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <strong>User ID:</strong> {user.userId}<br />
              <strong>Location:</strong> {user.latitude.toFixed(4)}, {user.longitude.toFixed(4)}<br />
              <small>Last updated: {new Date(user.lastUpdated).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LocationTrackerpoint;