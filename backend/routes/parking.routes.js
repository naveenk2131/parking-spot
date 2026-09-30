const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const parkingController = require('../controllers/parking.controller');

// ── Owner / Lot CRUD ─────────────────────────────────────────────────────────
// NOTE: frontend uses both /api/parking/my-lots  AND  /api/parking/:id
//       We keep both variants so no frontend changes break things.

router.get('/my-lots',
  protect, authorize('owner', 'admin'),
  parkingController.getOwnerParkingLots);

// POST /api/parking  — create a new parking lot (frontend uses this form)
router.post('/',
  protect, authorize('owner', 'admin'),
  parkingController.createParkingLot);

// Also honour /api/parking/lots for legacy/alternative calls
router.post('/lots',
  protect, authorize('owner', 'admin'),
  parkingController.createParkingLot);

// GET /api/parking/:id — public details (commuter, owner, admin)
router.get('/:id',
  protect, authorize('owner', 'admin', 'commuter'),
  parkingController.getParkingLot);

// PUT /api/parking/:id — update
router.put('/:id',
  protect, authorize('owner', 'admin'),
  parkingController.updateParkingLot);

// PATCH /api/parking/:id/deactivate
router.patch('/:id/deactivate',
  protect, authorize('owner', 'admin'),
  parkingController.deactivateParkingLot);

// ── Floors ───────────────────────────────────────────────────────────────────
// GET  /api/parking/:lotId/floors
router.get('/:lotId/floors',
  protect, authorize('owner', 'admin', 'commuter'),
  parkingController.getFloors);

// POST /api/parking/floors  — create floor (body contains parkingLot id)
router.post('/floors/create',
  protect, authorize('owner', 'admin'),
  parkingController.createFloor);

// Also accept the old path the frontend already uses
router.post('/floors',
  protect, authorize('owner', 'admin'),
  parkingController.createFloor);

// ── Slots ────────────────────────────────────────────────────────────────────
// GET  /api/parking/floors/:floorId/slots
router.get('/floors/:floorId/slots',
  protect, authorize('owner', 'admin', 'commuter'),
  parkingController.getSlots);

// POST /api/parking/slots  — create slot (body contains floor id)
router.post('/slots',
  protect, authorize('owner', 'admin'),
  parkingController.createSlot);

// PATCH /api/parking/slots/:id — update slot status
router.patch('/slots/:id',
  protect, authorize('owner', 'admin'),
  parkingController.updateSlot);

module.exports = router;
