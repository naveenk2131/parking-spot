import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { QRCodeSVG } from 'qrcode.react';

export default function BookingSuccessPage() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const fetchReservation = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      const found = res.data.data.reservations.find(r => r._id === id);
      if (found) {
        setReservation(found);
      }
    } catch (error) {
      console.error('Failed to load reservation', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container mt-5 text-center">Loading your pass...</div>;
  if (!reservation) return <div className="container mt-5 text-center text-danger">Booking not found.</div>;

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      <div className="digital-pass-wrapper" style={{maxWidth: '400px', width: '100%'}}>
        <div className="text-center mb-4">
          <h2 className="text-success"><i className="bi bi-check-circle-fill"></i></h2>
          <h3 className="fw-bold">Spot Guaranteed</h3>
          <p className="text-muted">Your booking is confirmed and payment is successful.</p>
        </div>

        <div className="ps-card border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          {/* Ticket Header */}
          <div className="bg-dark text-white p-4 text-center position-relative">
            <h5 className="mb-1">{reservation.parkingLot.name}</h5>
            <p className="mb-0 opacity-75 small">{reservation.parkingLot.address?.street}</p>
            
            {/* Cutouts for ticket effect */}
            <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', width: '30px', height: '30px', backgroundColor: 'var(--ps-background)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', width: '30px', height: '30px', backgroundColor: 'var(--ps-background)', borderRadius: '50%' }}></div>
          </div>

          {reservation.parkingLot?.images && reservation.parkingLot.images.length > 0 && (
            <div style={{ height: '140px', overflow: 'hidden' }}>
              <img src={reservation.parkingLot.images[0]} alt="Lot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Ticket Body */}
          <div className="bg-white p-4" style={{ borderTop: '2px dashed #e2e8f0' }}>
            <div className="row text-center mb-4">
              <div className="col-6 border-end">
                <span className="text-muted small text-uppercase d-block mb-1">Slot</span>
                <span className="fs-3 fw-bold text-primary">{reservation.parkingSlot.slotNumber}</span>
              </div>
              <div className="col-6">
                <span className="text-muted small text-uppercase d-block mb-1">Vehicle</span>
                <span className="fs-5 fw-bold mt-1 d-block">{reservation.vehicle?.licensePlate}</span>
              </div>
            </div>

            <div className="bg-light rounded p-3 mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Check-In</span>
                <span className="fw-bold small">{new Date(reservation.startTime).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Check-Out</span>
                <span className="fw-bold small">{new Date(reservation.endTime).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small">Status</span>
                <span className="fw-bold text-success small text-uppercase">{reservation.status}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center mb-2">
              <span className="text-muted small d-block mb-2">Scan at Entry</span>
              <div className="d-inline-block p-2 border rounded">
                <QRCodeSVG value={reservation.passCode || reservation._id} size={150} />
              </div>
              <span className="d-block mt-2 font-monospace small text-muted">{reservation.passCode}</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-4 d-flex gap-2">
          <Link to="/commuter/bookings" className="btn btn-outline-primary w-50">View Bookings</Link>
          <button className="btn btn-primary w-50" onClick={() => window.print()}>Save Pass</button>
        </div>
      </div>
    </div>
  );
}
