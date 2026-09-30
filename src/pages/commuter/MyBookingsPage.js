import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function MyBookingsPage() {
  const [reservations, setReservations] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Extension Modal State
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendData, setExtendData] = useState(null);
  const [extendHours, setExtendHours] = useState(1);
  const [extending, setExtending] = useState(false);

  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelData, setCancelData] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const res = await api.get('/waitlist/my-waitlist');
      setWaitlist(res.data.data.waitlist);
    } catch (error) {
      console.log('Failed to fetch waitlist');
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      setReservations(res.data.data.reservations);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (reservation) => {
    setCancelData(reservation);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancelData) return;
    setCancelling(true);
    try {
      await api.post(`/bookings/${cancelData._id}/cancel`, {});
      fetchBookings();
      setShowCancelModal(false);
      setCancelData(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const openExtendModal = (reservation) => {
    setExtendData(reservation);
    setExtendHours(1);
    setShowExtendModal(true);
  };

  const confirmExtend = async () => {
    if (!extendData) return;
    setExtending(true);

    const currentEndDT = new Date(extendData.endTime);
    const newEndDT = new Date(currentEndDT.getTime() + extendHours * 60 * 60 * 1000);
    const pricePerHour = extendData.parkingLot?.pricing?.baseRate || 10;
    const additionalAmount = extendHours * pricePerHour;

    try {
      await api.post(`/bookings/${extendData._id}/extend`, {
        additionalEndTime: newEndDT.toISOString(),
        additionalAmount
      });
      
      fetchBookings();
      setShowExtendModal(false);
      setExtendData(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to extend booking');
    } finally {
      setExtending(false);
    }
  };

  const openReviewModal = (reservation) => {
    setReviewData(reservation);
    setRating(5);
    setComment('');
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewData) return;
    setSubmittingReview(true);
    try {
      await axios.post('http://localhost:5000/api/reviews', {
        parkingLotId: reviewData.parkingLot._id,
        reservationId: reviewData._id,
        rating,
        comment
      }, { withCredentials: true });
      alert('Review submitted successfully!');
      setShowReviewModal(false);
      setReviewData(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="container mt-4">Loading bookings...</div>;

  return (
    <div className="container mt-4 mb-5">
      <h2 className="fw-bold mb-4">My Bookings</h2>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <a className="nav-link active" href="#upcoming" data-bs-toggle="tab">Upcoming & Active</a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-dark" href="#history" data-bs-toggle="tab">History</a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-dark" href="#waitlist" data-bs-toggle="tab">Waitlist</a>
        </li>
      </ul>

      <div className="tab-content">
        {/* Upcoming & Active */}
        <div className="tab-pane fade show active" id="upcoming">
          <div className="row g-4">
            {reservations.filter(r => ['pending', 'confirmed', 'active'].includes(r.status)).length === 0 ? (
              <div className="col-12"><div className="alert alert-info">No active or upcoming bookings.</div></div>
            ) : (
              reservations.filter(r => ['pending', 'confirmed', 'active'].includes(r.status)).map(res => (
                <div key={res._id} className="col-lg-6">
                  <div className="ps-card h-100 border-primary" style={{ borderWidth: '2px' }}>
                    <div className="ps-card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 fw-bold">{res.parkingLot?.name}</h5>
                      <span className={`ps-badge ps-badge-${res.status === 'active' ? 'success' : res.status === 'pending' ? 'warning' : 'info'}`}>
                        {res.status}
                      </span>
                    </div>
                    {res.parkingLot?.images && res.parkingLot.images.length > 0 && (
                      <div style={{ height: '140px', overflow: 'hidden' }}>
                        <img src={res.parkingLot.images[0]} alt={res.parkingLot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div className="ps-card-body">
                      <div className="row">
                        <div className="col-6 mb-3">
                          <span className="text-muted d-block small">Slot</span>
                          <strong className="fs-5 text-primary">{res.parkingSlot?.slotNumber}</strong>
                        </div>
                        <div className="col-6 mb-3">
                          <span className="text-muted d-block small">Vehicle</span>
                          <strong>{res.vehicle?.licensePlate || 'N/A'}</strong>
                        </div>
                        <div className="col-6 mb-3">
                          <span className="text-muted d-block small">Check-In</span>
                          <strong>{new Date(res.startTime).toLocaleString()}</strong>
                        </div>
                        <div className="col-6 mb-3">
                          <span className="text-muted d-block small">Check-Out</span>
                          <strong>{new Date(res.endTime).toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="ps-card-footer d-flex gap-2">
                      {res.status === 'pending' && (
                        <button className="btn btn-primary flex-grow-1" onClick={() => navigate(`/commuter/checkout/${res._id}`)}>
                          Pay Now
                        </button>
                      )}
                      {res.status === 'confirmed' && (
                        <button className="btn btn-primary flex-grow-1" onClick={() => navigate(`/commuter/booking-success/${res._id}`)}>
                          View Pass
                        </button>
                      )}
                      {res.status === 'active' && (
                        <button className="btn btn-outline-primary flex-grow-1" onClick={() => openExtendModal(res)}>
                          Extend
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(res.status) && (
                        <button className="btn btn-outline-danger flex-grow-1" onClick={() => openCancelModal(res)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* History */}
        <div className="tab-pane fade" id="history">
          <div className="row g-4">
            {reservations.filter(r => ['completed', 'cancelled', 'no_show', 'expired'].includes(r.status)).length === 0 ? (
              <div className="col-12"><div className="alert alert-secondary">No booking history.</div></div>
            ) : (
              reservations.filter(r => ['completed', 'cancelled', 'no_show', 'expired'].includes(r.status)).map(res => (
                <div key={res._id} className="col-lg-6">
                  <div className="ps-card h-100 opacity-75">
                    <div className="ps-card-header d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{res.parkingLot?.name}</h6>
                      <span className={`ps-badge ps-badge-${res.status === 'completed' ? 'success' : 'danger'}`}>
                        {res.status}
                      </span>
                    </div>
                    <div className="ps-card-body">
                      <p className="mb-1"><small><strong>Date:</strong> {new Date(res.startTime).toLocaleDateString()}</small></p>
                      <p className="mb-1"><small><strong>Slot:</strong> {res.parkingSlot?.slotNumber}</small></p>
                      <p className="mb-0"><small><strong>Total:</strong> ${res.totalAmount?.toFixed(2)}</small></p>
                      {res.overstayFee > 0 && <p className="mb-0 text-danger"><small><strong>Overstay Fee:</strong> ${res.overstayFee?.toFixed(2)}</small></p>}
                      {res.gracePeriodPenalty > 0 && <p className="mb-0 text-danger"><small><strong>No-Show Penalty:</strong> ${res.gracePeriodPenalty?.toFixed(2)}</small></p>}
                      
                      {res.status === 'completed' && (
                        <button className="btn btn-sm btn-outline-primary mt-3" onClick={() => openReviewModal(res)}>
                          <i className="bi bi-star-fill me-1"></i> Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Waitlist */}
        <div className="tab-pane fade" id="waitlist">
          <div className="row g-4">
            {waitlist.length === 0 ? (
              <div className="col-12"><div className="alert alert-secondary">You are not currently on any waitlist.</div></div>
            ) : (
              waitlist.map(w => (
                <div key={w._id} className="col-lg-6">
                  <div className="ps-card h-100 border-warning">
                    <div className="ps-card-header d-flex justify-content-between align-items-center bg-light">
                      <h6 className="mb-0">{w.parkingLot?.name}</h6>
                      <span className="ps-badge ps-badge-warning">{w.status}</span>
                    </div>
                    <div className="ps-card-body">
                      <p className="mb-1"><small><strong>Requested Date:</strong> {new Date(w.requestedDate).toLocaleDateString()}</small></p>
                      <p className="mb-1"><small><strong>Time:</strong> {w.requestedStartTime}</small></p>
                      <p className="mb-0"><small><strong>Duration:</strong> {w.requestedDuration} Hours</small></p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Extension Modal */}
      {showExtendModal && extendData && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Extend Parking</h5>
                <button type="button" className="btn-close" onClick={() => setShowExtendModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
                  <i className="bi bi-clock-history fs-3 text-primary me-3"></i>
                  <div>
                    <div className="text-muted small">Current End Time</div>
                    <div className="fw-bold fs-5">{new Date(extendData.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                </div>

                <label className="form-label fw-bold small text-uppercase text-muted">Additional Hours</label>
                <select 
                  className="form-select form-select-lg mb-4" 
                  value={extendHours} 
                  onChange={(e) => setExtendHours(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 8, 12].map(h => (
                    <option key={h} value={h}>+ {h} {h === 1 ? 'Hour' : 'Hours'}</option>
                  ))}
                </select>

                <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded mb-4">
                  <span className="text-muted fw-bold">Extension Fee</span>
                  <span className="fs-4 fw-bold text-main">
                    ${(extendHours * (extendData.parkingLot?.pricing?.baseRate || 10)).toFixed(2)}
                  </span>
                </div>
                
                <div className="alert alert-warning small mb-0 border-0 bg-opacity-25">
                  <i className="bi bi-info-circle me-1"></i> Checking availability... If the next time block is already reserved by another commuter, extension will be denied to prevent double-booking.
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-ghost w-100 mb-2" onClick={() => setShowExtendModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary w-100" onClick={confirmExtend} disabled={extending}>
                  {extending ? 'Processing...' : 'Confirm & Pay Extension'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && cancelData && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Cancel Reservation</h5>
                <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-4 text-muted">Are you sure you want to cancel your reservation for <strong>{cancelData.parkingSlot?.slotNumber}</strong> at <strong>{cancelData.parkingLot?.name}</strong>?</p>
                
                <div className="ps-card border-warning mb-4">
                  <div className="ps-card-header bg-warning bg-opacity-10 text-dark fw-bold border-bottom-0 py-2">
                    <i className="bi bi-shield-exclamation me-2"></i> Cancellation Policy
                  </div>
                  <div className="ps-card-body py-3">
                    <ul className="mb-0 small text-muted ps-3">
                      <li className="mb-1">Cancel <strong>> 1 hour</strong> before check-in: <strong className="text-success">100% Refund</strong></li>
                      <li>Cancel <strong>{'< 1 hour'}</strong> before check-in: <strong className="text-warning">50% Refund</strong></li>
                    </ul>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded">
                  <span className="text-muted fw-bold">Amount Paid</span>
                  <span className="fs-5 fw-bold text-main">
                    ${cancelData.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0 d-flex flex-column gap-2">
                <button type="button" className="btn btn-danger w-100" onClick={confirmCancel} disabled={cancelling}>
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel Reservation'}
                </button>
                <button type="button" className="btn btn-ghost w-100" onClick={() => setShowCancelModal(false)}>Keep Reservation</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewData && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Rate your experience</h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-4">How was your parking experience at <strong>{reviewData.parkingLot?.name}</strong>?</p>
                
                <div className="d-flex justify-content-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <i 
                      key={star} 
                      className={`bi bi-star${star <= rating ? '-fill text-warning' : ' text-muted'} fs-1`} 
                      style={{ cursor: 'pointer', transition: '0.2s' }}
                      onClick={() => setRating(star)}
                    ></i>
                  ))}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted text-uppercase">Leave a comment (Optional)</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Tell us what you liked or what could be improved..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-ghost" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={submitReview} disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
