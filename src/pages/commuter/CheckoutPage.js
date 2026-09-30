import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const fetchReservation = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      const found = res.data.data.reservations.find(r => r._id === id);
      if (found) {
        setReservation(found);
      } else {
        alert('Booking not found');
        navigate('/commuter/find-parking');
      }
    } catch (error) {
      console.error('Failed to load reservation', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      await api.post(`/bookings/${id}/pay`, {});
      navigate(`/commuter/booking-success/${id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Payment failed');
      setProcessing(false);
    }
  };

  if (loading) return <div className="container mt-5 text-center">Loading checkout...</div>;
  if (!reservation) return null;

  return (
    <div className="container mt-5 mb-5 animate-fade-in" style={{maxWidth: '800px'}}>
      <h2 className="fw-bold mb-4">Complete Your Booking</h2>
      
      <div className="row g-4">
        <div className="col-md-7">
          <div className="ps-card h-100">
            <div className="ps-card-header bg-light">
              <h5 className="mb-0">Booking Summary</h5>
            </div>
            {reservation.parkingLot?.images && reservation.parkingLot.images.length > 0 && (
              <div style={{ height: '180px', overflow: 'hidden' }}>
                <img src={reservation.parkingLot.images[0]} alt="Lot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div className="ps-card-body">
              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted">Parking Facility</span>
                <span className="fw-bold">{reservation.parkingLot.name}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted">Guaranteed Slot</span>
                <span className="fw-bold text-primary">{reservation.parkingSlot.slotNumber} ({reservation.parkingSlot.type})</span>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted">Check-In</span>
                <span className="fw-bold">{new Date(reservation.startTime).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <span className="text-muted">Check-Out</span>
                <span className="fw-bold">{new Date(reservation.endTime).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Vehicle</span>
                <span className="fw-bold">{reservation.vehicle?.licensePlate || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="ps-card h-100">
            <div className="ps-card-header bg-dark text-white">
              <h5 className="mb-0">Payment Details</h5>
            </div>
            <div className="ps-card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Parking Fee</span>
                <span>₹{reservation.ownerAmount?.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                <span className="text-muted">Platform Fee</span>
                <span>₹{reservation.commission?.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-4 fs-4 fw-bold">
                <span>Total</span>
                <span>₹{reservation.totalAmount?.toFixed(2)}</span>
              </div>

              <div className="alert alert-warning small">
                <i className="bi bi-info-circle me-1"></i> DEMO PAYMENT MODE ACTIVE. No real charge will be made.
              </div>

              <button 
                className="btn btn-primary w-100 btn-lg"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? 'Processing...' : `Pay ₹${reservation.totalAmount?.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
