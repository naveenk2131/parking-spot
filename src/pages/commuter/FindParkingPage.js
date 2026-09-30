import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from "@react-google-maps/api";
import EmptyState from "../../components/EmptyState";

const mapContainerStyle = { width: "100%", height: "100%", position: "absolute", top: 0, left: 0 };
// Bengaluru center — where our demo lots are
const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };
const LIBRARIES = ["places"];

const STATUS_COLORS = {
  available: "#006a61",
  reserved:  "#7c5800",
  occupied:  "#ba1a1a",
};

function ParkingCard({ lot, onView }) {
  const avail = lot.availableSlots || 0;
  const total = lot.totalCapacity || 1;
  const occPct = Math.round(((total - avail) / total) * 100);
  const matchScore = lot.smartMatch?.score || 75;

  return (
    <div className="ps-card mb-3 border-0 shadow-sm" style={{ cursor: "pointer" }}>
      {lot.images?.[0] && (
        <div style={{ height: 120, overflow: "hidden", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }}>
          <img src={lot.images[0]} alt={lot.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => e.target.style.display = "none"} />
        </div>
      )}
      <div className="ps-card-body p-3">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "0.9375rem", color: "var(--ps-on-surface)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {lot.name}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--ps-on-surface-variant)" }}>
              <i className="bi bi-geo-alt-fill me-1" style={{ color: "var(--ps-secondary)" }}></i>
              {lot.address?.city}
            </div>
          </div>
          <div className="text-end ms-3">
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.125rem", color: "var(--ps-secondary)" }}>
              ₹{lot.pricing?.basePrice || 40}
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--ps-on-surface-variant)" }}>/ hour</div>
          </div>
        </div>

        {/* Smart Match + Availability */}
        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
          <span style={{ background: `rgba(0,106,97,0.1)`, color: "var(--ps-secondary)", border: "1px solid rgba(0,106,97,0.2)", borderRadius: 20, padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            {matchScore}% Match
          </span>
          <span style={{ background: avail > 0 ? "rgba(0,106,97,0.1)" : "rgba(186,26,26,0.1)", color: avail > 0 ? STATUS_COLORS.available : STATUS_COLORS.occupied, border: `1px solid ${avail > 0 ? "rgba(0,106,97,0.2)" : "rgba(186,26,26,0.2)"}`, borderRadius: 20, padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            {avail} available
          </span>
          {lot.isVerified && (
            <span style={{ background: "rgba(11,28,48,0.05)", color: "var(--ps-primary)", borderRadius: 20, padding: "2px 8px", fontSize: "0.6875rem", fontWeight: 600 }}>
              <i className="bi bi-patch-check-fill me-1" style={{ color: "#4f9cf9" }}></i>Verified
            </span>
          )}
        </div>

        {/* Occupancy bar */}
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ height: 4, background: "var(--ps-surface-container-highest)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${occPct}%`, background: occPct > 80 ? STATUS_COLORS.occupied : occPct > 50 ? STATUS_COLORS.reserved : STATUS_COLORS.available, transition: "width 0.3s ease", borderRadius: 2 }}></div>
          </div>
          <div style={{ fontSize: "0.6875rem", color: "var(--ps-on-surface-variant)", marginTop: 2 }}>{occPct}% occupied</div>
        </div>

        {/* Amenities */}
        {lot.amenities?.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-2">
            {lot.amenities.slice(0, 4).map(a => (
              <span key={a} style={{ background: "var(--ps-surface-container-low)", borderRadius: 4, padding: "1px 6px", fontSize: "0.6875rem", color: "var(--ps-on-surface-variant)", textTransform: "capitalize" }}>
                {a.replace("_", " ")}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        {lot.rating?.average > 0 && (
          <div style={{ fontSize: "0.8125rem", color: "var(--ps-on-surface-variant)", marginBottom: "0.75rem" }}>
            <i className="bi bi-star-fill me-1" style={{ color: "#f59e0b" }}></i>
            <strong>{lot.rating.average.toFixed(1)}</strong>
            <span style={{ marginLeft: 4 }}>({lot.rating.count} reviews)</span>
          </div>
        )}

        {/* Actions */}
        <div className="d-flex gap-2">
          <button className="btn btn-secondary btn-sm flex-grow-1 fw-bold"
            onClick={(e) => { e.stopPropagation(); onView(lot._id); }}>
            <i className="bi bi-calendar-check me-1"></i>Reserve
          </button>
          <button className="btn btn-outline-secondary btn-sm flex-grow-1"
            onClick={(e) => { e.stopPropagation(); onView(lot._id); }}>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FindParkingPage() {
  const navigate = useNavigate();
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [selectedLot, setSelectedLot] = useState(null);
  const [mapError, setMapError] = useState(false);
  const [filters, setFilters] = useState({
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    maxDistance: "10000",
    type: "cars"
  });

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES
  });

  useEffect(() => { if (loadError) setMapError(true); }, [loadError]);

  // Try geolocation, but always load demo lots
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setMapCenter(loc);
          setFilters(prev => ({ ...prev, lat: loc.lat, lng: loc.lng }));
        },
        () => {} // Silent — keep Bengaluru defaults
      );
    }
    fetchParking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchParking = useCallback(async (overrideFilters) => {
    setLoading(true);
    try {
      const f = overrideFilters || filters;
      const params = new URLSearchParams();
      if (f.lat) params.append("lat", f.lat);
      if (f.lng) params.append("lng", f.lng);
      if (f.maxDistance) params.append("maxDistance", f.maxDistance);
      const res = await api.get(`/search?${params.toString()}`);
      setParkingLots(res.data.data?.parkingLots || []);
    } catch (err) {
      console.error("Search failed", err);
      setParkingLots([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    fetchParking(updated);
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const updated = { ...filters, lat, lng };
        setMapCenter({ lat, lng });
        setFilters(updated);
        fetchParking(updated);
      }
    }
  };

  const navigateToDetails = (id) => navigate(`/commuter/parking/${id}`);

  return (
    <div className="animate-fade-in d-flex flex-column" style={{ height: "calc(100vh - 72px)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "var(--ps-surface)", borderBottom: "1px solid var(--ps-outline-variant)", padding: "0.75rem 1.25rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "1.125rem", color: "var(--ps-on-surface)" }}>Find Parking</div>
          <div style={{ fontSize: "0.8125rem", color: "var(--ps-on-surface-variant)" }}>Discover and reserve guaranteed spots near you.</div>
        </div>
        <div style={{ flex: "1 1 280px", maxWidth: 400 }}>
          {isLoaded && !mapError ? (
            <Autocomplete onLoad={ref => autocompleteRef.current = ref} onPlaceChanged={onPlaceChanged}>
              <input type="text" className="form-control" placeholder="Search destination..." />
            </Autocomplete>
          ) : (
            <input type="text" className="form-control" placeholder="Enter destination..." onChange={() => {}} />
          )}
        </div>
      </div>

      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Sidebar list */}
        <div className="d-flex flex-column border-end" style={{ width: "100%", maxWidth: 420, background: "var(--ps-background)", zIndex: 10, flexShrink: 0 }}>
          {/* Filters */}
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--ps-outline-variant)", background: "var(--ps-surface)" }}>
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label small mb-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--ps-on-surface-variant)", letterSpacing: "0.04em" }}>VEHICLE TYPE</label>
                <select className="form-select form-select-sm" name="type" value={filters.type} onChange={handleFilterChange}>
                  <option value="cars">Cars</option>
                  <option value="ev">Electric Vehicles</option>
                  <option value="accessible">Accessible</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label small mb-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--ps-on-surface-variant)", letterSpacing: "0.04em" }}>MAX DISTANCE</label>
                <select className="form-select form-select-sm" name="maxDistance" value={filters.maxDistance} onChange={handleFilterChange}>
                  <option value="1000">1 km</option>
                  <option value="3000">3 km</option>
                  <option value="5000">5 km</option>
                  <option value="10000">10 km</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-grow-1 overflow-auto p-3">
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border" style={{ color: "var(--ps-secondary)" }}></div>
                <div className="mt-2" style={{ fontSize: "0.875rem", color: "var(--ps-on-surface-variant)" }}>Finding parking...</div>
              </div>
            ) : parkingLots.length === 0 ? (
              <EmptyState
                icon="bi-geo-alt-fill"
                title="No parking lots found"
                description="Try increasing the search radius or changing filters."
              />
            ) : (
              <>
                <div className="label-code mb-3" style={{ color: "var(--ps-on-surface-variant)" }}>
                  {parkingLots.length} LOCATION{parkingLots.length !== 1 ? "S" : ""} FOUND
                </div>
                {parkingLots.map(lot => (
                  <ParkingCard key={lot._id} lot={lot} onView={navigateToDetails} />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-grow-1 position-relative">
          {mapError ? (
            <div className="d-flex align-items-center justify-content-center h-100 flex-column text-center p-4" style={{ background: "var(--ps-surface-container-low)" }}>
              <i className="bi bi-map" style={{ fontSize: "3rem", color: "var(--ps-outline)" }}></i>
              <div className="mt-3" style={{ fontFamily: "var(--font-headline)", fontWeight: 600 }}>Map Unavailable</div>
              <p style={{ color: "var(--ps-on-surface-variant)", fontSize: "0.875rem" }}>Configure Google Maps API key to see map. Use the list to find parking.</p>
            </div>
          ) : isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={13}
              options={{ disableDefaultUI: true, zoomControl: true, styles: [] }}
              onLoad={map => mapRef.current = map}
            >
              {/* Parking lot markers */}
              {parkingLots.map(lot => {
                if (!lot.location?.coordinates) return null;
                const pos = { lat: lot.location.coordinates[1], lng: lot.location.coordinates[0] };
                return (
                  <Marker
                    key={lot._id}
                    position={pos}
                    title={lot.name}
                    onClick={() => { setSelectedLot(lot); setMapCenter(pos); }}
                  />
                );
              })}

              {/* Info window */}
              {selectedLot?.location && (
                <InfoWindow
                  position={{ lat: selectedLot.location.coordinates[1], lng: selectedLot.location.coordinates[0] }}
                  onCloseClick={() => setSelectedLot(null)}
                >
                  <div style={{ maxWidth: 220, fontFamily: "var(--font-headline)" }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, fontSize: "0.9375rem" }}>{selectedLot.name}</div>
                    <div style={{ color: "#006a61", fontWeight: 700, marginBottom: 4 }}>{selectedLot.availableSlots} slots available</div>
                    <div style={{ marginBottom: 8, fontSize: "0.875rem" }}>₹{selectedLot.pricing?.basePrice}/hr</div>
                    <button
                      className="btn btn-sm w-100"
                      style={{ background: "#006a61", color: "white", border: "none", fontWeight: 600 }}
                      onClick={() => navigateToDetails(selectedLot._id)}>
                      View &amp; Reserve
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="spinner-border" style={{ color: "var(--ps-secondary)" }}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
