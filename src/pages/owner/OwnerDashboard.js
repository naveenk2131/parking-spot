import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";
import api from "../../services/api";

const StatCard = ({ icon, label, value, sub, accentColor = "var(--ps-secondary)" }) => (
  <div className="ps-stat-card">
    <div className="d-flex align-items-center justify-content-between">
      <div className="stat-label">{label}</div>
      <div className="stat-icon" style={{ background: accentColor + "15", color: accentColor }}>{icon}</div>
    </div>
    <div className="stat-value mt-2">{value}</div>
    {sub && <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--ps-secondary)", marginTop: 4 }}>{sub}</div>}
  </div>
);

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ health: {}, insights: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics/health")
      .then(res => setData(res.data.data))
      .catch(err => console.error("Analytics failed", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "40vh" }}>
      <div className="text-center">
        <div className="spinner-border mb-3" style={{ color: "var(--ps-secondary)" }}></div>
        <div className="label-code" style={{ color: "var(--ps-on-surface-variant)" }}>Loading dashboard...</div>
      </div>
    </div>
  );

  const health = data?.health || {};
  const insights = data?.insights || [];

  return (
    <div className="animate-fade-in pb-4">
      {/* Page Header */}
      <div className="ps-page-header d-flex align-items-start justify-content-between flex-wrap gap-3">
        <div>
          <div className="label-code mb-1" style={{ color: "var(--ps-secondary)" }}>
            <span className="live-dot me-2"></span>
            LIVE TELEMETRY SYNCED
          </div>
          <h1>Parking Health Overview</h1>
          <p className="mb-0">Welcome back, {user?.firstName}. Real-time health of your parking infrastructure.</p>
        </div>
        <Link to="/owner/parking-lots" className="btn btn-secondary" id="owner-add-lot-btn">
          <i className="bi bi-plus-lg me-2"></i>Add Parking Lot
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard icon={<i className="bi bi-p-square-fill"></i>} label="Total Slots" value={health.totalSlots || 0} />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<i className="bi bi-pie-chart-fill"></i>} label="Occupancy Rate" value={`${health.occupancyRate || 0}%`} accentColor="#7c5800" sub="Live data" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<i className="bi bi-person-x-fill"></i>} label="No-Show Rate" value={`${health.noShowRate || 0}%`} accentColor="var(--ps-on-surface-variant)" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<i className="bi bi-x-circle-fill"></i>} label="Cancellation Rate" value={`${health.cancellationRate || 0}%`} accentColor="var(--ps-occupied)" />
        </div>
      </div>

      <div className="row g-4">
        {/* Insights */}
        <div className="col-lg-8">
          <div className="ps-card h-100">
            <div className="ps-card-header d-flex align-items-center gap-2">
              <i className="bi bi-cpu-fill" style={{ color: "var(--ps-secondary)" }}></i>
              Operational Intelligence
            </div>
            <div className="ps-card-body">
              {insights && insights.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {insights.map((insight, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--ps-surface-container-low)" }}>
                      <i className="bi bi-arrow-right-short" style={{ color: "var(--ps-secondary)", fontSize: "1.1rem", flexShrink: 0, marginTop: 2 }}></i>
                      <span style={{ fontSize: "0.9375rem", color: "var(--ps-on-surface)" }}>{insight}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-bar-chart" style={{ fontSize: "2.5rem", color: "var(--ps-outline)" }}></i>
                  <div className="mt-3" style={{ fontFamily: "var(--font-headline)", fontWeight: 600, color: "var(--ps-on-surface)" }}>No insights yet</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--ps-on-surface-variant)" }}>Insights appear once booking activity begins.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="col-lg-4">
          <div style={{ background: "var(--ps-primary-container)", borderRadius: "var(--radius-lg)", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="label-code" style={{ color: "var(--ps-primary-fixed-dim)" }}>PLATFORM REVENUE</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem", textAlign: "center" }}>
              <div className="label-code mb-2" style={{ color: "var(--ps-secondary-fixed-dim)" }}>TOTAL EARNED</div>
              <div style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", fontWeight: 700, color: "white", letterSpacing: "-0.025em", lineHeight: 1.1 }}>
                ₹{(health.totalRevenue || 0).toFixed(0)}
              </div>
              {health.overstayRevenue > 0 && (
                <div style={{ marginTop: "1.25rem", background: "rgba(255,255,255,0.08)", borderRadius: "var(--radius-md)", padding: "0.5rem 1rem" }}>
                  <div className="label-code" style={{ color: "var(--ps-secondary-fixed-dim)" }}>OVERSTAY FEES</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--ps-secondary-fixed)", fontSize: "1.125rem" }}>
                    ₹{health.overstayRevenue.toFixed(0)}
                  </div>
                </div>
              )}
              <Link to="/owner/revenue" className="btn btn-sm mt-4" style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", fontFamily: "var(--font-headline)", fontWeight: 600 }}>
                View Revenue Report
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
