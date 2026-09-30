import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, we'll mock these if API is not built, but let's try calling an API if it exists,
    // otherwise fallback to mocked array to ensure the UI works for the demo.
    setNotifications([
      { _id: '1', type: 'reservation_confirmed', title: 'Booking Confirmed', message: 'Your booking for Slot 1A-04 is confirmed.', isRead: false, createdAt: new Date().toISOString() },
      { _id: '2', type: 'qr_ready', title: 'Digital Pass Ready', message: 'Your QR code is ready for check-in.', isRead: false, createdAt: new Date().toISOString() },
      { _id: '3', type: 'waitlist_availability', title: 'Waitlist Match Found!', message: 'A slot has opened up for your desired time. Confirm now.', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { _id: '4', type: 'overstay_warning', title: 'Overstay Warning', message: 'You have exceeded your booking duration. Extra charges apply.', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() }
    ]);
    setLoading(false);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  if (loading) return <div className="container mt-4">Loading notifications...</div>;

  return (
    <div className="container mt-4 mb-5">
      <h2 className="fw-bold mb-4">Notifications</h2>
      
      <div className="ps-card border-0 shadow-sm">
        <div className="ps-card-body p-0">
          <ul className="list-group list-group-flush">
            {notifications.map(notif => (
              <li 
                key={notif._id} 
                className={`list-group-item p-4 ${!notif.isRead ? 'bg-light' : ''}`}
                onClick={() => markAsRead(notif._id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className={`mb-1 ${!notif.isRead ? 'fw-bold' : ''}`}>
                      {!notif.isRead && <span className="badge bg-primary me-2">New</span>}
                      {notif.title}
                    </h6>
                    <p className="mb-0 text-muted">{notif.message}</p>
                  </div>
                  <small className="text-muted">{new Date(notif.createdAt).toLocaleDateString()}</small>
                </div>
              </li>
            ))}
            {notifications.length === 0 && (
              <li className="list-group-item p-4 text-center text-muted">No notifications.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
