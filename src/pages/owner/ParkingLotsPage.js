import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function ParkingLotsPage() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "", description: "", street: "", city: "",
    state: "", postalCode: "", country: "India",
    totalCapacity: "", lat: "", lng: "",
    pricing_basePrice: "40", amenities: []
  });

  useEffect(() => { fetchLots(); }, []);

  const fetchLots = async () => {
    try {
      const res = await api.get("/parking/my-lots");
      setLots(res.data.data.parkingLots || []);
    } catch (err) {
      console.error("Failed to fetch lots", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAmenity = (val) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(val)
        ? prev.amenities.filter(a => a !== val)
        : [...prev.amenities, val]
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "", description: "", street: "", city: "",
      state: "", postalCode: "", country: "India",
      totalCapacity: "", lat: "", lng: "",
      pricing_basePrice: "40", amenities: []
    });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim() || "India",
        },
        totalCapacity: Number(formData.totalCapacity),
        pricing: { basePrice: Number(formData.pricing_basePrice) || 40 },
        amenities: formData.amenities,
        status: "active",
      };
      if (formData.lat && formData.lng) {
        payload.lat = Number(formData.lat);
        payload.lng = Number(formData.lng);
      }

      await api.post("/parking", payload);
      setShowModal(false);
      resetForm();
      await fetchLots();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create parking lot. Please try all required fields.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const AMENITY_OPTIONS = [
    { value: "covered", label: "Covered" },
    { value: "security", label: "Security Guard" },
    { value: "ev_charging", label: "EV Charging" },
    { value: "cctv", label: "CCTV" },
    { value: "accessible", label: "Accessible" },
    { value: "valet", label: "Valet" },
    { value: "car_wash", label: "Car Wash" },
    { value: "premium_spaces", label: "Premium Spaces" },
  ];

  const getOccupancyColor = (lot) => {
    const occ = lot.totalCapacity > 0 ? ((lot.totalCapacity - lot.availableSlots) / lot.totalCapacity) * 100 : 0;
    if (occ >= 80) return "var(--ps-occupied)";
    if (occ >= 50) return "var(--ps-reserved)";
    return "var(--ps-available)";
  };

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "40vh" }}>
      <div className="spinner-border" style={{ color: "var(--ps-secondary)" }}></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="ps-page-header d-flex align-items-start justify-content-between flex-wrap gap-3">
        <div>
          <h1>My Parking Lots</h1>
          <p className="mb-0">Manage your parking infrastructure and create new lots.</p>
        </div>
        <button className="btn btn-secondary" id="add-lot-btn" onClick={() => { resetForm(); setShowModal(true); }}>
          <i className="bi bi-plus-lg me-2"></i>Add Parking Lot
        </button>
      </div>

      {lots.length === 0 ? (
        <div className="ps-card">
          <div className="ps-card-body text-center py-5">
            <i className="bi bi-p-square" style={{ fontSize: "3rem", color: "var(--ps-outline)" }}></i>
            <div className="mt-3" style={{ fontFamily: "var(--font-headline)", fontWeight: 600, fontSize: "1.125rem" }}>No parking lots yet</div>
            <p style={{ color: "var(--ps-on-surface-variant)" }}>Create your first parking lot to start earning.</p>
            <button className="btn btn-secondary" onClick={() => { resetForm(); setShowModal(true); }}>
              <i className="bi bi-plus-lg me-2"></i>Create First Lot
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {lots.map(lot => (
            <div key={lot._id} className="col-md-6 col-xl-4">
              <div className="ps-card h-100">
                {lot.images?.[0] && (
                  <div style={{ height: 140, overflow: "hidden", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }}>
                    <img src={lot.images[0]} alt={lot.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                  </div>
                )}
                <div className="ps-card-header d-flex justify-content-between align-items-center">
                  <div style={{ fontFamily: "var(--font-headline)", fontWeight: 600, fontSize: "1rem", color: "var(--ps-on-surface)" }}>{lot.name}</div>
                  <span className={`ps-badge ${lot.status === "active" ? "ps-badge-available" : "ps-badge-reserved"}`}>
                    {lot.status}
                  </span>
                </div>
                <div className="ps-card-body">
                  <div className="d-flex align-items-center gap-2 mb-3" style={{ fontSize: "0.8125rem", color: "var(--ps-on-surface-variant)" }}>
                    <i className="bi bi-geo-alt" style={{ color: "var(--ps-secondary)" }}></i>
                    <span>{lot.address?.street}, {lot.address?.city}</span>
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <div style={{ background: "var(--ps-surface-container-low)", borderRadius: "var(--radius-md)", padding: "0.5rem 0.75rem" }}>
                        <div className="label-code" style={{ color: "var(--ps-on-surface-variant)" }}>CAPACITY</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.25rem" }}>{lot.totalCapacity}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div style={{ background: "var(--ps-surface-container-low)", borderRadius: "var(--radius-md)", padding: "0.5rem 0.75rem" }}>
                        <div className="label-code" style={{ color: "var(--ps-on-surface-variant)" }}>AVAILABLE</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.25rem", color: getOccupancyColor(lot) }}>{lot.availableSlots}</div>
                      </div>
                    </div>
                  </div>
                  {lot.pricing?.basePrice && (
                    <div className="mt-2" style={{ fontSize: "0.875rem", color: "var(--ps-on-surface-variant)" }}>
                      Starting at <strong style={{ color: "var(--ps-secondary)" }}>₹{lot.pricing.basePrice}/hr</strong>
                    </div>
                  )}
                </div>
                <div className="ps-card-footer bg-transparent border-top">
                  <Link to={`/owner/parking-lots/${lot._id}`} className="btn btn-outline-primary w-100">
                    <i className="bi bi-tools me-2"></i>Manage Infrastructure
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Lot Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050, overflowY: "auto" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <form className="modal-content ps-card border-0 shadow-lg" onSubmit={handleSubmit}>
                <div className="modal-header border-bottom">
                  <h5 className="modal-title" style={{ fontFamily: "var(--font-headline)", fontWeight: 700 }}>
                    <i className="bi bi-plus-square me-2 text-secondary"></i>Add New Parking Lot
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                    {formError && (
                      <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-bold">Lot Name <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="name" value={formData.name}
                          onChange={handleChange} required placeholder="e.g. Koramangala Central Parking" />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" name="description" value={formData.description}
                          onChange={handleChange} rows="2" placeholder="Brief description of your parking facility..."></textarea>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">Street Address <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="street" value={formData.street}
                          onChange={handleChange} required placeholder="e.g. 80 Feet Road, 5th Block" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">City <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="city" value={formData.city}
                          onChange={handleChange} required placeholder="e.g. Bengaluru" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">State <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="state" value={formData.state}
                          onChange={handleChange} required placeholder="e.g. Karnataka" />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-bold">Postal Code <span className="text-danger">*</span></label>
                        <input type="text" className="form-control" name="postalCode" value={formData.postalCode}
                          onChange={handleChange} required placeholder="e.g. 560034" />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-bold">Total Capacity <span className="text-danger">*</span></label>
                        <input type="number" className="form-control" name="totalCapacity" value={formData.totalCapacity}
                          onChange={handleChange} required min="1" placeholder="e.g. 50" />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-bold">Base Price (₹/hr) <span className="text-danger">*</span></label>
                        <input type="number" className="form-control" name="pricing_basePrice" value={formData.pricing_basePrice}
                          onChange={handleChange} required min="1" placeholder="e.g. 40" />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Location Coordinates <span className="text-muted">(Optional — for map display)</span></label>
                        <div className="row g-2">
                          <div className="col-6">
                            <input type="number" step="any" className="form-control" name="lat" value={formData.lat}
                              onChange={handleChange} placeholder="Latitude e.g. 12.9352" />
                          </div>
                          <div className="col-6">
                            <input type="number" step="any" className="form-control" name="lng" value={formData.lng}
                              onChange={handleChange} placeholder="Longitude e.g. 77.6244" />
                          </div>
                        </div>
                        <div className="form-text">Find coordinates at maps.google.com — right-click your location.</div>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Amenities</label>
                        <div className="d-flex flex-wrap gap-2">
                          {AMENITY_OPTIONS.map(a => (
                            <button type="button" key={a.value}
                              className={`btn btn-sm ${formData.amenities.includes(a.value) ? "btn-secondary" : "btn-outline-secondary"}`}
                              onClick={() => toggleAmenity(a.value)}>
                              {formData.amenities.includes(a.value) && <i className="bi bi-check me-1"></i>}
                              {a.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-top">
                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-secondary" disabled={submitting}>
                      {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</> : <>
                        <i className="bi bi-check-lg me-2"></i>Create Lot
                      </>}
                    </button>
                  </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
