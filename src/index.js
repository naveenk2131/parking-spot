import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'leaflet/dist/leaflet.css';
import './index.css';
import App from './App';
import axios from 'axios';

// Inject global interceptor for raw axios calls across the app
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('ps_token') || localStorage.getItem('token');
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    if (config.headers.set) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
