import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../components/Navbar';

const features = [
  { icon: '🔍', title: 'Find Available Spots', desc: 'Search parking near your destination with real-time availability.' },
  { icon: '📱', title: 'Reserve Instantly', desc: 'Book your spot in seconds. Your space is guaranteed.' },
  { icon: '🅿️', title: 'Park with Confidence', desc: 'Arrive knowing your spot is waiting. No stress, no circling.' },
];

const commuterBenefits = [
  { icon: '✅', text: 'Guaranteed parking — no more circling' },
  { icon: '⏱️', text: 'Save up to 30 minutes per trip' },
  { icon: '💰', text: 'Transparent upfront pricing' },
  { icon: '📲', text: 'Digital pass — no paper tickets' },
  { icon: '🔒', text: 'Secure, verified parking locations' },
  { icon: '🚘', text: 'Manage multiple vehicles easily' },
];

const ownerBenefits = [
  { icon: '💵', text: 'Turn idle spaces into reliable revenue' },
  { icon: '📊', text: 'Real-time occupancy dashboard' },
  { icon: '📆', text: 'Control availability and pricing' },
  { icon: '🤝', text: 'Commuter network brings you bookings' },
  { icon: '📈', text: 'Revenue insights and analytics' },
  { icon: '🛡️', text: 'Verified commuters only' },
];

const LandingPage = () => {
  return (
    <div>
      <PublicNavbar />

      {/* Hero */}
      <section className="ps-hero">
        <div className="container position-relative">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 animate-fade-in-up">
              <div className="ps-hero-tagline">
                <span>🅿️</span> Smart Parking Platform
              </div>
              <h1>
                Guaranteed parking,<br />
                without the <span className="highlight">circling.</span>
              </h1>
              <p className="lead">
                Find, reserve and use a parking space with confidence.
                Real-time availability. Instant booking. Always guaranteed.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/register" className="btn btn-accent btn-lg" id="hero-find-parking-btn">
                  Find Parking
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                <Link to="/register?role=owner" className="btn btn-outline-light btn-lg" id="hero-list-parking-btn">
                  List Your Parking
                </Link>
              </div>
              <div className="d-flex gap-4 mt-4 pt-2">
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>50K+</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Active commuters</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }}></div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>2,400+</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Parking locations</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }}></div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>99.2%</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Spot guarantee rate</div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 animate-fade-in-up delay-200">
              {/* Hero Visual — Product UI Card */}
              <div className="ps-hero-card">
                <div className="ps-hero-search">
                  <h6 style={{ fontFamily: 'var(--ps-font-display)', fontWeight: 700, marginBottom: '1rem', color: 'var(--ps-gray-800)' }}>
                    Find Parking
                  </h6>
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <div className="input-group">
                      <span className="input-group-text">📍</span>
                      <input type="text" className="form-control" placeholder="Enter address or area" defaultValue="Downtown Financial District" readOnly />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Date</label>
                      <input type="text" className="form-control" defaultValue="Mon, Oct 7" readOnly />
                    </div>
                    <div className="col-3">
                      <label className="form-label">From</label>
                      <input type="text" className="form-control" defaultValue="09:00" readOnly />
                    </div>
                    <div className="col-3">
                      <label className="form-label">Until</label>
                      <input type="text" className="form-control" defaultValue="17:00" readOnly />
                    </div>
                  </div>
                  <button className="btn btn-primary w-100" disabled>Search Available Spots</button>
                </div>

                {/* Sample Results */}
                <div className="mt-3 d-flex flex-column gap-2">
                  {[
                    { name: 'City Center Garage', dist: '0.2 mi', slots: 12, price: '$4.50/hr', badge: 'Best Value' },
                    { name: 'Metro Park & Ride', dist: '0.5 mi', slots: 28, price: '$3.00/hr', badge: 'Covered' },
                  ].map((lot, i) => (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 'var(--ps-radius)',
                      padding: '0.875rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>{lot.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                          {lot.dist} · {lot.slots} slots available
                        </div>
                      </div>
                      <div className="text-end">
                        <div style={{ fontWeight: 700, color: 'var(--ps-accent)', fontSize: '0.9rem' }}>{lot.price}</div>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 600, background: 'var(--ps-accent-subtle)',
                          color: 'var(--ps-accent-dark)', padding: '0.15rem 0.5rem', borderRadius: 100,
                        }}>{lot.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="ps-section" id="how-it-works">
        <div className="container">
          <div className="text-center mb-5">
            <div className="ps-section-label">Simple Process</div>
            <h2>How ParkingSpot works</h2>
            <p className="text-muted" style={{ maxWidth: 520, margin: '0 auto' }}>
              Three steps from search to parked — no surprises, no stress.
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            {features.map((f, i) => (
              <div key={i} className="col-md-4">
                <div className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="ps-step-number mx-auto mb-4">{i + 1}</div>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                  <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h5>
                  <p className="text-muted" style={{ fontSize: '0.9375rem' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guaranteed Spot Section */}
      <section className="ps-section ps-section-alt" id="benefits">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div className="ps-section-label">The ParkingSpot Promise</div>
              <h2>Your spot is guaranteed.<br />Always.</h2>
              <p className="text-muted mb-4" style={{ fontSize: '1.0625rem' }}>
                When you reserve through ParkingSpot, your space is held exclusively for you.
                No overbooking. No surprises. We enforce it technically and contractually.
              </p>
              <div className="d-flex flex-column gap-3 mb-4">
                {[
                  { icon: '🔒', title: 'Real-time slot locking', desc: 'Slots are locked the moment you book.' },
                  { icon: '📲', title: 'Digital parking pass', desc: 'Your pass opens the gate automatically.' },
                  { icon: '💸', title: 'Full refund guarantee', desc: 'If your spot isn\'t available, you get a full refund.' },
                ].map((item, i) => (
                  <div key={i} className="d-flex gap-3 align-items-start">
                    <div className="ps-feature-icon flex-shrink-0" style={{ width: 44, height: 44, fontSize: '1.25rem', marginBottom: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{item.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.9rem' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn btn-primary" id="guarantee-cta-btn">
                Start with a guaranteed spot
              </Link>
            </div>
            <div className="col-lg-6">
              {/* Digital pass mockup */}
              <div style={{
                background: 'linear-gradient(135deg, var(--ps-primary) 0%, #1345c2 100%)',
                borderRadius: 'var(--ps-radius-xl)',
                padding: '2rem',
                color: '#fff',
                boxShadow: 'var(--ps-shadow-xl)',
              }}>
                <div style={{ opacity: 0.7, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                  🅿️ ParkingSpot Digital Pass
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>City Center Garage</div>
                <div style={{ opacity: 0.7, fontSize: '0.875rem', marginBottom: '2rem' }}>Level 2 · Slot B-07</div>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 'var(--ps-radius)',
                  padding: '1.25rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  {[
                    { label: 'Check In', value: '09:00 AM' },
                    { label: 'Check Out', value: '05:00 PM' },
                    { label: 'Duration', value: '8 hours' },
                  ].map((d, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '0.7rem', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.label}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{d.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{
                  background: '#fff',
                  borderRadius: 'var(--ps-radius)',
                  padding: '1.25rem',
                  textAlign: 'center',
                }}>
                  {/* QR Code placeholder */}
                  <div style={{ 
                    width: 100, height: 100, background: 'var(--ps-gray-900)', 
                    borderRadius: 8, margin: '0 auto 0.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem',
                  }}>🔲</div>
                  <div style={{ color: 'var(--ps-gray-800)', fontWeight: 700, fontSize: '0.9rem' }}>PSP-2024-0A7B3</div>
                  <div style={{ color: 'var(--ps-gray-500)', fontSize: '0.75rem' }}>Scan at entry gate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits split */}
      <section className="ps-section">
        <div className="container">
          <div className="text-center mb-5">
            <div className="ps-section-label">For Everyone</div>
            <h2>Built for commuters and owners alike</h2>
          </div>
          <div className="row g-4">
            {/* Commuter */}
            <div className="col-lg-6">
              <div className="ps-card h-100" style={{ border: '2px solid var(--ps-primary-subtle)' }}>
                <div className="ps-card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="ps-feature-icon" style={{ marginBottom: 0 }}>🚗</div>
                    <div>
                      <h4 style={{ marginBottom: 0 }}>For Commuters</h4>
                      <p className="text-muted small mb-0">Stop wasting time searching for parking</p>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2 mb-4">
                    {commuterBenefits.map((b, i) => (
                      <div key={i} className="d-flex align-items-center gap-2" style={{ fontSize: '0.9375rem' }}>
                        <span>{b.icon}</span>
                        <span>{b.text}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/register" className="btn btn-primary" id="commuter-signup-btn">
                    Get Started for Free
                  </Link>
                </div>
              </div>
            </div>
            {/* Owner */}
            <div className="col-lg-6">
              <div className="ps-card h-100" style={{ border: '2px solid var(--ps-accent-subtle)' }}>
                <div className="ps-card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="ps-feature-icon" style={{ marginBottom: 0, background: 'var(--ps-accent-subtle)', color: 'var(--ps-accent)' }}>🏢</div>
                    <div>
                      <h4 style={{ marginBottom: 0 }}>For Parking Owners</h4>
                      <p className="text-muted small mb-0">Monetize your underutilized parking</p>
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2 mb-4">
                    {ownerBenefits.map((b, i) => (
                      <div key={i} className="d-flex align-items-center gap-2" style={{ fontSize: '0.9375rem' }}>
                        <span>{b.icon}</span>
                        <span>{b.text}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/register?role=owner" className="btn btn-accent" id="owner-signup-btn">
                    List Your Parking
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a56db 100%)', padding: '5rem 0' }}>
        <div className="container text-center">
          <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>
            Stop circling. Start parking.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.125rem', marginBottom: '2rem' }}>
            Join thousands of commuters who park with confidence every day.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/register" className="btn btn-accent btn-lg" id="footer-cta-btn">
              Create Free Account
            </Link>
            <Link to="/login" className="btn btn-outline-light btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ps-footer">
        <div className="container">
          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <div className="footer-brand mb-3">Parking<span>Spot</span></div>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                Smart parking reservation platform connecting commuters with verified parking spaces.
              </p>
            </div>
            <div className="col-6 col-lg-2">
              <h6>Product</h6>
              <Link to="/register">Find Parking</Link>
              <Link to="/register?role=owner">List Space</Link>
              <a href="#how-it-works">How it works</a>
              <a href="#benefits">Benefits</a>
            </div>
            <div className="col-6 col-lg-2">
              <h6>Company</h6>
              <a href="#!">About Us</a>
              <a href="#!">Careers</a>
              <a href="#!">Blog</a>
              <a href="#!">Press</a>
            </div>
            <div className="col-6 col-lg-2">
              <h6>Support</h6>
              <a href="#!">Help Center</a>
              <a href="#!">Contact Us</a>
              <a href="#!">Safety</a>
              <a href="#!">Community</a>
            </div>
            <div className="col-6 col-lg-2">
              <h6>Legal</h6>
              <a href="#!">Privacy Policy</a>
              <a href="#!">Terms of Service</a>
              <a href="#!">Cookie Policy</a>
            </div>
          </div>
          <div className="ps-footer-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
            <p style={{ margin: 0, fontSize: '0.875rem' }}>© 2024 ParkingSpot, Inc. All rights reserved.</p>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>🅿️ Guaranteed parking, without the circling.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
