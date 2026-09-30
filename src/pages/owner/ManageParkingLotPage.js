import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";

export default function ManageParkingLotPage() {
  const { id } = useParams();
  const [lot, setLot] = useState(null);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [floorData, setFloorData] = useState({ floorNumber: "", label: "", totalSlots: "" });
  const [slotData, setSlotData] = useState({ slotNumber: "", type: "standard", status: "available" });
  const [floorError, setFloorError] = useState("");
  const [slotError, setSlotError] = useState("");
  const [floorLoading, setFloorLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);

  const fetchLotData = useCallback(async () => {
    try {
      const [lotRes, floorsRes] = await Promise.all([
        api.get(`/parking/${id}`),
        api.get(`/parking/${id}/floors`)
      ]);
      setLot(lotRes.data.data.parkingLot);
      const floorList = floorsRes.data.data.floors || [];
      setFloors(floorList);
      if (floorList.length > 0 && !selectedFloor) {
        setSelectedFloor(floorList[0]);
      }
    } catch (err) {
      console.error("Error fetching lot data", err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSlots = useCallback(async (floorId) => {
    try {
      const res = await api.get(`/parking/floors/${floorId}/slots`);
      setSlots(res.data.data.slots || []);
    } catch (err) {
      console.error("Error fetching slots", err);
    }
  }, []);

  useEffect(() => { fetchLotData(); }, [fetchLotData]);
  useEffect(() => { if (selectedFloor) fetchSlots(selectedFloor._id); }, [selectedFloor, fetchSlots]);

  const handleCreateFloor = async (e) => {
    e.preventDefault();
    setFloorError("");
    setFloorLoading(true);
    try {
      await api.post("/parking/floors", {
        ...floorData,
        floorNumber: Number(floorData.floorNumber),
        totalSlots: Number(floorData.totalSlots),
        availableSlots: Number(floorData.totalSlots),
        parkingLot: id
      });
      setShowFloorModal(false);
      setFloorData({ floorNumber: "", label: "", totalSlots: "" });
      await fetchLotData();
    } catch (err) {
      setFloorError(err.response?.data?.message || "Failed to create floor. Check if floor number is unique.");
    } finally {
      setFloorLoading(false);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!selectedFloor) return;
    setSlotError("");
    setSlotLoading(true);
    try {
      await api.post("/parking/slots", { ...slotData, floor: selectedFloor._id });
      setShowSlotModal(false);
      setSlotData({ slotNumber: "", type: "standard", status: "available" });
      await fetchSlots(selectedFloor._id);
    } catch (err) {
      setSlotError(err.response?.data?.message || "Failed to create slot.");
    } finally {
      setSlotLoading(false);
    }
  };

  const updateSlotStatus = async (slotId, newStatus) => {
    try {
      await api.patch(`/parking/slots/${slotId}`, { status: newStatus });
      fetchSlots(selectedFloor._id);
    } catch (err) {
      alert("Failed to update slot status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available": return "var(--ps-available)";
      case "occupied": return "var(--ps-occupied)";
      case "reserved": return "var(--ps-reserved)";
      case "maintenance": return "var(--ps-on-surface-variant)";
      default: return "inherit";
    }
  };

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "40vh" }}>
      <div className="spinner-border" style={{ color: "var(--ps-secondary)" }}></div>
    </div>
  );

  if (!lot) return (
    <div className="ps-card">
      <div className="ps-card-body text-center py-5">
        <div>Parking lot not found.</div>
        <Link to="/owner/parking-lots" className="btn btn-secondary mt-3">Back to My Lots</Link>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="ps-page-header d-flex align-items-start justify-content-between flex-wrap gap-3">
        <div>
          <Link to="/owner/parking-lots" className="btn btn-ghost btn-sm mb-2 ps-0">
            <i className="bi bi-arrow-left me-1"></i>Back to My Lots
          </Link>
          <h1 style={{ fontSize: "1.375rem" }}>{lot.name}</h1>
          <p className="mb-0">{lot.address?.street}, {lot.address?.city}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowFloorModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>Add Floor
        </button>
      </div>

      {/* Lot Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: "TOTAL CAPACITY", val: lot.totalCapacity, icon: "bi-p-square" },
          { label: "AVAILABLE SLOTS", val: lot.availableSlots, icon: "bi-car-front", color: "var(--ps-available)" },
          { label: "FLOORS", val: floors.length, icon: "bi-layers" },
          { label: "BASE PRICE", val: `₹${lot.pricing?.basePrice || 0}/hr`, icon: "bi-tag" },
        ].map((stat, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="ps-card">
              <div className="ps-card-body d-flex align-items-center gap-3">
                <i className={`bi ${stat.icon} fs-3`} style={{ color: stat.color || "var(--ps-secondary)", opacity: 0.85 }}></i>
                <div>
                  <div className="label-code">{stat.label}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.375rem", color: stat.color || "var(--ps-on-surface)" }}>{stat.val}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {floors.length === 0 ? (
        <div className="ps-card">
          <div className="ps-card-body text-center py-5">
            <i className="bi bi-layers" style={{ fontSize: "3rem", color: "var(--ps-outline)", marginBottom: "0.75rem", display: "block" }}></i>
            <div style={{ fontFamily: "var(--font-headline)", fontWeight: 600 }}>No floors created yet</div>
            <p style={{ color: "var(--ps-on-surface-variant)" }}>Start by adding a floor to this parking lot.</p>
            <button className="btn btn-secondary" onClick={() => setShowFloorModal(true)}>
              <i className="bi bi-plus me-2"></i>Add First Floor
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Floor List */}
          <div className="col-md-3">
            <div className="ps-card">
              <div className="ps-card-header">
                <div style={{ fontFamily: "var(--font-headline)", fontWeight: 700 }}>Floors</div>
              </div>
              <div className="list-group list-group-flush">
                {floors.map(floor => (
                  <button
                    key={floor._id}
                    className={`list-group-item list-group-item-action border-0 py-3`}
                    style={{ background: selectedFloor?._id === floor._id ? "var(--ps-secondary-container)" : "transparent", color: selectedFloor?._id === floor._id ? "var(--ps-on-secondary-container)" : "var(--ps-on-surface)" }}
                    onClick={() => setSelectedFloor(floor)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <strong style={{ fontFamily: "var(--font-headline)" }}>{floor.label}</strong>
                      <span className="badge" style={{ background: "var(--ps-available)", color: "white", fontSize: "0.6875rem" }}>
                        {floor.availableSlots}/{floor.totalSlots}
                      </span>
                    </div>
                    <small style={{ color: "var(--ps-on-surface-variant)" }}>Level {floor.floorNumber}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Slot Grid */}
          <div className="col-md-9">
            {selectedFloor && (
              <div className="ps-card">
                <div className="ps-card-header d-flex justify-content-between align-items-center">
                  <div style={{ fontFamily: "var(--font-headline)", fontWeight: 700 }}>Slots on {selectedFloor.label}</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowSlotModal(true)}>
                    <i className="bi bi-plus me-1"></i>Add Slot
                  </button>
                </div>
                <div className="ps-card-body">
                  {slots.length === 0 ? (
                    <div className="text-center py-4" style={{ color: "var(--ps-on-surface-variant)" }}>
                      No slots on this floor yet.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead>
                          <tr>
                            <th>Slot #</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Update</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slots.map(slot => (
                            <tr key={slot._id}>
                              <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{slot.slotNumber}</td>
                              <td>
                                <span className="badge" style={{ background: "var(--ps-surface-container-highest)", color: "var(--ps-on-surface)", textTransform: "capitalize" }}>
                                  {slot.type}
                                </span>
                              </td>
                              <td>
                                <span className="badge" style={{ background: getStatusColor(slot.status), color: "white", textTransform: "capitalize", fontSize: "0.75rem", padding: "0.35em 0.65em" }}>
                                  {slot.status}
                                </span>
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm w-auto"
                                  value={slot.status}
                                  onChange={(e) => updateSlotStatus(slot._id, e.target.value)}
                                  style={{ fontSize: "0.8125rem" }}
                                >
                                  <option value="available">Available</option>
                                  <option value="reserved">Reserved</option>
                                  <option value="occupied">Occupied</option>
                                  <option value="maintenance">Maintenance</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floor Modal */}
      {showFloorModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content ps-card border-0 shadow-lg">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold">Add Floor</h5>
                  <button type="button" className="btn-close" onClick={() => setShowFloorModal(false)}></button>
                </div>
                <form onSubmit={handleCreateFloor}>
                  <div className="modal-body p-4">
                    {floorError && <div className="alert alert-danger py-2">{floorError}</div>}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Floor Label <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" required value={floorData.label}
                        onChange={e => setFloorData({...floorData, label: e.target.value})}
                        placeholder='e.g. "Ground Floor", "B1", "Level 2"' />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Floor Number <span className="text-danger">*</span></label>
                      <input type="number" className="form-control" required value={floorData.floorNumber}
                        onChange={e => setFloorData({...floorData, floorNumber: e.target.value})}
                        placeholder="0 = Ground, -1 = B1, 1 = Level 1" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Total Slots Capacity <span className="text-danger">*</span></label>
                      <input type="number" className="form-control" required min="1" value={floorData.totalSlots}
                        onChange={e => setFloorData({...floorData, totalSlots: e.target.value})}
                        placeholder="e.g. 20" />
                    </div>
                  </div>
                  <div className="modal-footer border-top">
                    <button type="button" className="btn btn-ghost" onClick={() => setShowFloorModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-secondary" disabled={floorLoading}>
                      {floorLoading ? "Creating..." : "Create Floor"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Slot Modal */}
      {showSlotModal && selectedFloor && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content ps-card border-0 shadow-lg">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold">Add Slot to {selectedFloor.label}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowSlotModal(false)}></button>
                </div>
                <form onSubmit={handleCreateSlot}>
                  <div className="modal-body p-4">
                    {slotError && <div className="alert alert-danger py-2">{slotError}</div>}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Slot Number <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" required value={slotData.slotNumber}
                        onChange={e => setSlotData({...slotData, slotNumber: e.target.value})}
                        placeholder='e.g. "A-01", "G-15"' />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Slot Type</label>
                      <select className="form-select" value={slotData.type}
                        onChange={e => setSlotData({...slotData, type: e.target.value})}>
                        <option value="standard">Standard</option>
                        <option value="compact">Compact</option>
                        <option value="accessible">Accessible</option>
                        <option value="ev">EV Charging</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Initial Status</label>
                      <select className="form-select" value={slotData.status}
                        onChange={e => setSlotData({...slotData, status: e.target.value})}>
                        <option value="available">Available</option>
                        <option value="maintenance">Under Maintenance</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer border-top">
                    <button type="button" className="btn btn-ghost" onClick={() => setShowSlotModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-secondary" disabled={slotLoading}>
                      {slotLoading ? "Adding..." : "Add Slot"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
