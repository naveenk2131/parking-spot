import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../components/Navbar';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--ps-background)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* Hero Section */}
      <header style={{ padding: '6rem 0', backgroundColor: 'var(--ps-surface)', borderBottom: '1px solid var(--ps-border)' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 animate-fade-in">
              <span className="ps-badge ps-badge-available mb-3">Enterprise Mobility Platform</span>
              <h1 className="mb-4">
                Guaranteed parking,<br />
                without the circling.
              </h1>
              <p className="lead text-muted mb-5" style={{ fontSize: '1.25rem', maxWidth: '480px' }}>
                Find an available space, reserve the exact slot, and arrive knowing it is yours. No stress, no wasted time.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/register" className="btn btn-primary btn-lg px-4">
                  Find Parking
                </Link>
                <Link to="/register?role=owner" className="btn btn-outline-primary btn-lg px-4">
                  List Your Parking
                </Link>
              </div>
            </div>
            <div className="col-lg-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {/* Realistic UI Mock */}
              <div className="ps-card" style={{ boxShadow: 'var(--ps-shadow-lg)', border: '1px solid var(--ps-border)' }}>
                <div className="ps-card-header d-flex justify-content-between align-items-center bg-light">
                  <span className="fw-bold text-main">Downtown Central Garage</span>
                  <span className="ps-badge ps-badge-available"><i className="bi bi-circle-fill me-1" style={{fontSize: '0.5rem'}}></i> 12 Slots Available</span>
                </div>
                <div className="ps-card-body p-4 text-center">
                  <div className="ps-parking-row">
                    <div className="ps-slot occupied">
                      <i className="bi bi-car-front-fill fs-3 mb-1"></i>
                      1A-01
                    </div>
                    <div className="ps-slot occupied">
                      <i className="bi bi-car-front-fill fs-3 mb-1"></i>
                      1A-02
                    </div>
                    <div className="ps-slot available" style={{ border: '2px solid var(--ps-accent)' }}>
                      <i className="bi bi-check-circle fs-3 mb-1 text-accent"></i>
                      1A-03
                      <span className="badge bg-primary mt-2">Select</span>
                    </div>
                    <div className="ps-slot reserved">
                      <i className="bi bi-lock-fill fs-3 mb-1"></i>
                      1A-04
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
                    <div className="text-start">
                      <div className="text-muted small fw-bold text-uppercase">Check In</div>
                      <div className="text-main fw-bold">09:00 AM</div>
                    </div>
                    <div className="text-start border-start ps-3">
                      <div className="text-muted small fw-bold text-uppercase">Check Out</div>
                      <div className="text-main fw-bold">05:00 PM</div>
                    </div>
                    <div className="text-end">
                      <div className="text-main fw-bold fs-5">₹15.00</div>
                      <button className="btn btn-accent btn-sm mt-1">Book Exact Slot</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How it Works */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--ps-background)' }}>
        <div className="container">
          <div className="text-center mb-5 pb-3">
            <h2 className="mb-3">How it works</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px', fontSize: '1.125rem' }}>
              Four simple steps from searching to parking securely.
            </p>
          </div>
          <div className="row g-4 text-center">
            {[
              { icon: 'bi-search', title: '1. Find', desc: 'Search nearby verified parking locations.' },
              { icon: 'bi-calendar-check', title: '2. Reserve', desc: 'Select your duration and lock your exact slot.' },
              { icon: 'bi-qr-code-scan', title: '3. Check In', desc: 'Scan your digital pass at the facility gate.' },
              { icon: 'bi-car-front', title: '4. Park', desc: 'Drive directly to your guaranteed spot.' },
            ].map((step, i) => (
              <div key={i} className="col-md-3">
                <div className="ps-card h-100 border-0 bg-transparent shadow-none">
                  <div className="ps-card-body">
                    <div className="mb-4 text-primary" style={{ fontSize: '2.5rem' }}>
                      <i className={`bi ${step.icon}`}></i>
                    </div>
                    <h5 className="fw-bold">{step.title}</h5>
                    <p className="text-muted small">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guaranteed Spot / Digital Pass */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--ps-surface)', borderTop: '1px solid var(--ps-border)', borderBottom: '1px solid var(--ps-border)' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h2 className="mb-4">Your spot is guaranteed. Always.</h2>
              <p className="text-muted mb-4" style={{ fontSize: '1.125rem' }}>
                When you reserve through ParkingSpot, your space is held exclusively for you in real-time. No overbooking. We enforce it through our hardware integrations and platform policies.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-3 mb-5">
                <li className="d-flex align-items-start gap-3">
                  <i className="bi bi-shield-check text-primary fs-4"></i>
                  <div>
                    <h6 className="fw-bold mb-1">Real-time slot locking</h6>
                    <span className="text-muted small">Slots are locked in the database the second you confirm.</span>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <i className="bi bi-phone text-primary fs-4"></i>
                  <div>
                    <h6 className="fw-bold mb-1">Digital parking pass</h6>
                    <span className="text-muted small">Your secure QR code grants you access instantly.</span>
                  </div>
                </li>
              </ul>
              <Link to="/register" className="btn btn-primary">Create Commuter Account</Link>
            </div>
            <div className="col-lg-6 text-center">
              {/* Minimal Digital Pass UI */}
              <div className="mx-auto text-start" style={{ width: '320px', background: 'var(--ps-primary)', color: 'white', borderRadius: 'var(--ps-radius-lg)', overflow: 'hidden', boxShadow: 'var(--ps-shadow-lg)' }}>
                <div className="p-4 border-bottom border-secondary">
                  <div className="text-uppercase small fw-bold opacity-75 mb-2" style={{ letterSpacing: '0.1em' }}>Digital Pass</div>
                  <h4 className="mb-0 text-white">City Center Garage</h4>
                  <div className="opacity-75 small">Oct 7, 2024</div>
                </div>
                <div className="p-4 bg-white text-dark text-center">
                  <div className="row mb-4">
                    <div className="col-6 border-end">
                      <div className="text-uppercase small fw-bold text-muted">Level</div>
                      <div className="fs-5 fw-bold">B</div>
                    </div>
                    <div className="col-6">
                      <div className="text-uppercase small fw-bold text-muted">Slot</div>
                      <div className="fs-5 fw-bold">B-07</div>
                    </div>
                  </div>
                  <div className="bg-light p-3 rounded mb-3">
                    <i className="bi bi-qr-code border border-dark rounded p-1" style={{ fontSize: '4rem' }}></i>
                    <div className="mt-2 small fw-bold text-muted text-uppercase">PSP-2024-0A7B3</div>
                  </div>
                  <div className="ps-badge ps-badge-available w-100 justify-content-center py-2">
                    Guaranteed Spot
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Section */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--ps-primary)', color: 'white' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5 order-lg-2">
              <h2 className="text-white mb-4">Turn unused spaces into managed inventory.</h2>
              <p className="opacity-75 mb-4" style={{ fontSize: '1.125rem' }}>
                ParkingSpot provides enterprise-grade management tools for parking operators and real estate owners.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-3 mb-5">
                <li className="d-flex align-items-center gap-3"><i className="bi bi-graph-up-arrow text-accent"></i> Real-time occupancy tracking</li>
                <li className="d-flex align-items-center gap-3"><i className="bi bi-lightning-charge text-accent"></i> Demand-based dynamic pricing</li>
                <li className="d-flex align-items-center gap-3"><i className="bi bi-ban text-accent"></i> Automatic no-show and overstay penalties</li>
              </ul>
              <Link to="/register?role=owner" className="btn btn-accent">Partner with ParkingSpot</Link>
            </div>
            <div className="col-lg-7 order-lg-1">
              <div className="ps-card bg-white text-dark p-1">
                <div className="ps-card-header bg-light border-bottom text-muted small text-uppercase fw-bold">
                  <i className="bi bi-bar-chart-fill me-2"></i> Owner Dashboard
                </div>
                <div className="ps-card-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="border rounded p-3 text-center h-100">
                        <div className="text-muted small fw-bold text-uppercase mb-2">Live Occupancy</div>
                        <h3 className="mb-0 text-primary">82%</h3>
                        <div className="text-success small"><i className="bi bi-arrow-up-right"></i> +5% today</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded p-3 text-center h-100">
                        <div className="text-muted small fw-bold text-uppercase mb-2">Suggested Price</div>
                        <h3 className="mb-0 text-primary">₹18.50</h3>
                        <div className="text-warning small"><i className="bi bi-lightning-fill"></i> Peak Demand</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ps-footer mt-auto">
        <div className="container">
          <div className="row g-4 mb-4 pb-4 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="col-lg-4">
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-car-front-fill text-accent"></i> ParkingSpot
              </h5>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', maxWidth: '300px' }}>
                An urban mobility platform connecting drivers with verified parking infrastructure.
              </p>
            </div>
            <div className="col-6 col-lg-2">
              <h6>Product</h6>
              <Link to="/register">Find Parking</Link>
              <Link to="/register?role=owner">List Space</Link>
              <Link to="/login">Sign In</Link>
            </div>
            <div className="col-6 col-lg-2">
              <h6>Platform</h6>
              <Link to="#">Commuters</Link>
              <Link to="#">Operators</Link>
              <Link to="#">Corporate</Link>
            </div>
            <div className="col-6 col-lg-2">
              <h6>Company</h6>
              <Link to="#">About Us</Link>
              <Link to="#">Careers</Link>
              <Link to="#">Contact</Link>
            </div>
            <div className="col-6 col-lg-2">
              <h6>Legal</h6>
              <Link to="#">Privacy Policy</Link>
              <Link to="#">Terms of Service</Link>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
            <span>&copy; {new Date().getFullYear()} ParkingSpot Inc. All rights reserved.</span>
            <span>Guaranteed parking, without the circling.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
