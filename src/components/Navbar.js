import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { getInitials, getRoleInfo } from "../utilities/helpers";

const PublicNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="ps-navbar">
      <div className="container-fluid px-4 d-flex align-items-center justify-content-between h-100">
        <Link className="ps-navbar-brand" to="/">
          <i className="bi bi-car-front-fill" style={{ color: "var(--ps-secondary-fixed-dim)", fontSize: "1.5rem" }}></i>
          ParkingSpot
        </Link>
        <div className="d-none d-lg-flex align-items-center gap-1">
          <a href="#how-it-works" className="ps-nav-link">How It Works</a>
          <Link to="/register?role=owner" className="ps-nav-link">List Your Space</Link>
        </div>
        <div className="d-none d-lg-flex align-items-center gap-2">
          <Link to="/login" className="ps-nav-link">Sign In</Link>
          <Link to="/register" className="btn btn-secondary btn-sm">Get Started</Link>
        </div>
        <button className="d-lg-none btn btn-ghost border-0 p-1" onClick={() => setMenuOpen(o => !o)} style={{ color: "var(--ps-on-primary)" }}>
          <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"} fs-4`}></i>
        </button>
      </div>
      {menuOpen && (
        <div style={{ background: "var(--ps-primary-container)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "1rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <a href="#how-it-works" className="ps-nav-link" onClick={() => setMenuOpen(false)}>How It Works</a>
          <Link to="/register?role=owner" className="ps-nav-link" onClick={() => setMenuOpen(false)}>List Your Space</Link>
          <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "0.75rem 0" }} />
          <Link to="/login" className="ps-nav-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
          <Link to="/register" className="btn btn-secondary mt-1" onClick={() => setMenuOpen(false)}>Create Account</Link>
        </div>
      )}
    </nav>
  );
};

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const roleInfo = getRoleInfo(user?.role);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => { document.removeEventListener("mousedown", handleOutside); document.removeEventListener("touchstart", handleOutside); };
  }, []);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const handleLogout = async () => { setIsOpen(false); await logout(); navigate("/"); };

  const getDashboardPath = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "owner") return "/owner";
    return "/commuter";
  };

  const initials = getInitials(user?.firstName, user?.lastName);

  return (
    <nav className="ps-navbar">
      <div className="container-fluid px-4 d-flex align-items-center justify-content-between h-100">
        <Link className="ps-navbar-brand" to={getDashboardPath()}>
          <i className="bi bi-car-front-fill" style={{ color: "var(--ps-secondary-fixed-dim)", fontSize: "1.5rem" }}></i>
          ParkingSpot
        </Link>
        <div className="d-flex align-items-center gap-2 ms-auto">
          <Link to={`${getDashboardPath()}/notifications`} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, color: "var(--ps-primary-fixed-dim)", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
            <i className="bi bi-bell" style={{ fontSize: "1.2rem" }}></i>
            <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: "var(--ps-error)", border: "1.5px solid var(--ps-primary-container)" }}></span>
          </Link>
          <div ref={wrapperRef} style={{ position: "relative" }}>
            <button type="button" aria-haspopup="true" aria-expanded={isOpen} onClick={() => setIsOpen(prev => !prev)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: isOpen ? "rgba(255,255,255,0.1)" : "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius-lg)", padding: "0.25rem 0.625rem 0.25rem 0.25rem", cursor: "pointer", transition: "all 0.15s", userSelect: "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--ps-secondary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.8125rem", flexShrink: 0 }}>{initials}</div>
              <div className="d-none d-md-block" style={{ lineHeight: 1.15, textAlign: "left" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ps-on-primary)", fontFamily: "var(--font-headline)" }}>{user?.firstName}</div>
                <div style={{ fontSize: "0.6875rem", color: "var(--ps-primary-fixed-dim)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{roleInfo.label}</div>
              </div>
              <i className="bi bi-chevron-down" style={{ fontSize: "0.75rem", color: "var(--ps-primary-fixed-dim)", transition: "transform 0.2s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}></i>
            </button>
            {isOpen && (
              <div className="ps-profile-dropdown">
                <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--ps-outline-variant)", background: "var(--ps-surface-container-low)" }}>
                  <div style={{ fontFamily: "var(--font-headline)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--ps-on-surface)" }}>{user?.firstName} {user?.lastName}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--ps-on-surface-variant)", marginTop: 2 }}>{user?.email}</div>
                </div>
                <Link to={`${getDashboardPath()}/profile`} className="ps-profile-dropdown-item" onClick={() => setIsOpen(false)}>
                  <i className="bi bi-person"></i> Profile Settings
                </Link>
                <Link to={getDashboardPath()} className="ps-profile-dropdown-item" onClick={() => setIsOpen(false)}>
                  <i className="bi bi-speedometer2"></i> Dashboard
                </Link>
                <div style={{ borderTop: "1px solid var(--ps-outline-variant)", margin: "4px 0" }}></div>
                <button className="ps-profile-dropdown-item" style={{ color: "var(--ps-error)" }} onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right" style={{ color: "var(--ps-error)" }}></i> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export { PublicNavbar, AppNavbar };
