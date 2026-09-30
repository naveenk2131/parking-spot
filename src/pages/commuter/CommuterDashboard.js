import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";
import axios from "axios";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const StatCard = ({ icon, label, value, sub, accentColor = "var(--ps-secondary)" }) => (
  <div className="ps-stat-card">
    <div className="d-flex align-items-center justify-content-between">
      <div className="stat-label">{label}</div>
      <div className="stat-icon" style={{ background: accentColor + "15", color: accentColor }}>
        {icon}
      </div>
    </div>
    <div className="stat-value mt-2">{value}</div>
    {sub && <div className="mt-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--ps-on-surface-variant)" }}>{sub}</div>}
  </div>
);

const statusColors = {
  completed:  { bg: "rgba(0,106,97,0.1)",  color: "var(--ps-available)" },
  active:     { bg: "rgba(0,106,97,0.08)", color: "var(--ps-available)" },
  confirmed:  { bg: "rgba(11,28,48,0.08)", color: "var(--ps-on-surface)" },
  pending:    { bg: "rgba(124,88,0,0.1)",  color: "var(--ps-reserved)"  },
  cancelled:  { bg: "rgba(186,26,26,0.1)", color: "var(--ps-occupied)"  },
};

const CommuterDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/bookings/my-bookings", { withCredentials: true })
      .then(res => setBookings(res.data.data.reservations || []))
      .catch(err => console.error("Bookings fetch failed", err))
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = bookings.filter(b => ["completed","active"].includes(b.status)).reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const completed  = bookings.filter(b => b.status === "completed").length;
  const upcoming   = bookings.filter(b => ["pending","confirmed"].includes(b.status)).length;

  const quickActions = [
    { icon: "bi-search",         title: "Find Parking",      desc: "Search available spots near you",             to: "/commuter/find-parking", btn: "Search Now"      },
    { icon: "bi-car-front-fill", title: "My Vehicles",       desc: "Manage your registered vehicles",              to: "/commuter/vehicles",     btn: "Manage"          },
    { icon: "bi-calendar-check", title: "My Bookings",       desc: "View all your reservations",                  to: "/commuter/bookings",     btn: "View Bookings"   },
    { icon: "bi-stars",          title: "Premium Services",  desc: "EV Charging, Valet, Car Wash & more",         to: "/commuter/premium",      btn: "Explore"         },
  ];

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "40vh" }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{ color: "var(--ps-secondary) !important" }}></div>
        <div className="label-code" style={{ color: "var(--ps-on-surface-variant)" }}>Loading dashboard...</div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="ps-page-header d-flex align-items-start justify-content-between flex-wrap gap-3">
        <div>
          <div className="label-code mb-1" style={{ color: "var(--ps-secondary)" }}>
            <span className="live-dot me-2"></span>
            LIVE SESSION
          </div>
          <h1>
            {getGreeting()}, {user?.firstName}
          </h1>
          <p className="mb-0">Here is what is happening with your parking today.</p>
        </div>
        <Link to="/commuter/find-parking" className="btn btn-secondary" id="dashboard-find-parking-btn">
          <i className="bi bi-search me-2"></i>Find Parking
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard icon={<i className="bi bi-card-list"></i>} label="Total Bookings" value={bookings.length} sub="All time" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<i className="bi bi-clock"></i>} label="Upcoming" value={upcoming} sub="Pending + Confirmed" accentColor="#7c5800" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<i className="bi bi-check-circle"></i>} label="Completed" value={completed} sub="Total trips" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<i className="bi bi-currency-rupee"></i>} label="Total Spent" value={`₹${totalSpent.toFixed(0)}`} sub="Lifetime" accentColor="var(--ps-on-surface)" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="ps-card mb-4">
        <div className="ps-card-header d-flex align-items-center gap-2">
          <i className="bi bi-lightning-fill" style={{ color: "var(--ps-secondary)" }}></i>
          Quick Actions
        </div>
        <div className="ps-card-body">
          <div className="row g-3">
            {quickActions.map((action, i) => (
              <div key={i} className="col-6 col-md-3">
                <div style={{
                  border: "1px solid var(--ps-outline-variant)", borderRadius: "var(--radius-lg)",
                  padding: "1.25rem", height: "100%", display: "flex", flexDirection: "column",
                  transition: "all 0.15s", cursor: "pointer",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ps-secondary)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--ps-outline-variant)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "rgba(0,106,97,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
                    <i className={`bi ${action.icon}`} style={{ fontSize: "1.125rem", color: "var(--ps-secondary)" }}></i>
                  </div>
                  <div style={{ fontFamily: "var(--font-headline)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--ps-on-surface)", marginBottom: "0.25rem" }}>{action.title}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--ps-on-surface-variant)", flexGrow: 1, marginBottom: "1rem", lineHeight: 1.4 }}>{action.desc}</div>
                  <Link to={action.to} className="btn btn-outline-primary btn-sm" style={{ alignSelf: "flex-start" }}>
                    {action.btn}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="ps-card">
        <div className="ps-card-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-journal-text" style={{ color: "var(--ps-secondary)" }}></i>
            Recent Bookings
          </div>
          <Link to="/commuter/bookings" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 600, color: "var(--ps-secondary)", textDecoration: "none", letterSpacing: "0.04em" }}>
            VIEW ALL →
          </Link>
        </div>
        <div className="ps-card-body p-0">
          {bookings.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-journal-x" style={{ fontSize: "2.5rem", color: "var(--ps-outline)" }}></i>
              <div className="mt-3" style={{ fontFamily: "var(--font-headline)", fontWeight: 600, color: "var(--ps-on-surface)" }}>No bookings yet</div>
              <div className="mb-3" style={{ fontSize: "0.875rem", color: "var(--ps-on-surface-variant)" }}>Book your first parking spot to see it here.</div>
              <Link to="/commuter/find-parking" className="btn btn-secondary btn-sm">Find Parking</Link>
            </div>
          ) : (
            <table className="ps-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map(b => {
                  const s = statusColors[b.status] || statusColors.pending;
                  return (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontFamily: "var(--font-headline)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--ps-on-surface)" }}>
                          {b.parkingLot?.name || "Unknown Lot"}
                        </div>
                        <div className="label-code" style={{ color: "var(--ps-on-surface-variant)", marginTop: 2 }}>
                          Slot {b.slot?.slotNumber || "—"}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.875rem" }}>{new Date(b.startTime).toLocaleDateString()}</div>
                        <div className="label-code" style={{ color: "var(--ps-on-surface-variant)" }}>{new Date(b.startTime).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</div>
                      </td>
                      <td>
                        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.9375rem" }}>
                          ₹{(b.totalAmount || 0).toFixed(0)}
                        </div>
                      </td>
                      <td>
                        <span className="ps-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommuterDashboard;
