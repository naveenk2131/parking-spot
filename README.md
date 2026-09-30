# ParkingSpot 🚗

**Guaranteed parking, without the circling.**

ParkingSpot is a serious mobility, payments, and urban-infrastructure platform designed to eliminate parking inefficiencies. We connect commuters with guaranteed spots while providing parking owners with enterprise-grade operational intelligence, dynamic pricing, and comprehensive revenue tools.

---

## 🎯 Problem Statement

1. **Drivers** waste immense amounts of time and fuel circling for available parking spots, contributing to urban congestion and emissions.
2. **Parking Operators** struggle to optimize utilization, predict demand, and implement flexible pricing models due to outdated manual operations and disconnected data systems.

## 💡 Solution

ParkingSpot provides a dual-sided marketplace:
* **For Commuters:** Guaranteed exact-slot parking reservations with price locks, seamless digital checkout, and QR-based digital passes.
* **For Operators (B2B):** A comprehensive SaaS dashboard to manage infrastructure, track live occupancy, automatically adjust pricing based on demand (Parking Intelligence), process waitlists, and enforce no-show/overstay policies.

---

## ✨ Key Features & Innovation

* **Guaranteed Spot:** Reserve the exact slot (e.g., Slot 1A-04) rather than just general admission.
* **Live Occupancy Dashboard:** Real-time visualization of floor layouts and slot status (Available, Occupied, Reserved, Maintenance).
* **Parking Intelligence (Smart Pricing):** Dynamic rate recommendations based on live saturation (e.g., >80% occupancy triggers peak pricing).
* **Smart Waitlist:** Automatic queuing for fully booked lots with notification routing.
* **Overstay & No-Show Management:** Configurable grace periods that trigger automatic penalties and free up stagnant inventory.
* **Enterprise Revenue Dashboard:** MongoDB aggregation pipelines generating real-time analytics on revenue, utilization, average booking duration, and cancellation rates.

---

## 💼 Business Model

ParkingSpot employs a diversified monetization strategy:
1. **B2C Booking Commission:** A standard configurable platform fee (e.g., 12%) deducted from every successful reservation.
2. **B2B Owner SaaS (Subscriptions):** Tiers (FREE, PRO, BUSINESS) unlocking advanced analytics, multiple locations, and APIs.
3. **Corporate Parking:** B2B integration allowing companies to block-book slots for employee allocations.
4. **Premium Upgrades:** Surcharges for EV charging slots, VIP/Premium sizing, and accessibility optimizations.

---

## 🛠 Technology Stack & Architecture

**Frontend:**
* **React.js** (Component-driven architecture)
* **Bootstrap 5** (Layout & grid mechanics)
* **Custom CSS** (Bespoke startup branding, rejecting default templates)
* **React Router** (Protected routing by role)
* **Axios** (API communication)
* **Leaflet/OpenStreetMap** (Geospatial visualization)

**Backend:**
* **Node.js & Express.js** (REST API framework)
* **MongoDB & Mongoose** (NoSQL Data persistence)
* **MongoDB Aggregation Framework** (Heavy analytics and reporting)
* **JWT & bcryptjs** (Secure authentication)
* **QRCode & UUID** (Secure digital pass generation)

---

## 📂 Project Structure

```text
parkingspot/
├── backend/
│   ├── config/       (Database & Auth config)
│   ├── controllers/  (Business logic: auth, booking, analytics, waitlist)
│   ├── middleware/   (JWT auth, Role guards)
│   ├── models/       (Mongoose Schemas)
│   ├── routes/       (API endpoints)
│   ├── utils/        (Response formatting)
│   ├── seed.js       (Database seeder)
│   └── server.js     (Express entry point)
└── frontend/
    ├── src/
    │   ├── components/ (Reusable UI: Navbar, Sidebar, Modals)
    │   ├── layouts/    (Role-based UI wrappers)
    │   ├── pages/      (Commuter, Owner, and Admin views)
    │   ├── App.js      (Routing and Auth guarding)
    │   └── index.css   (Global design system)
```

---

## 🚀 Setup Instructions

1. **Clone the repository.**
2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/parkingspot
   JWT_SECRET=your_super_secret_key
   CLIENT_URL=http://localhost:3000
   ```
3. **Run Seed Data:**
   ```bash
   node seed.js
   ```
4. **Start Backend:**
   ```bash
   npm run dev
   ```
5. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Demo Accounts
- **Admin**: admin@parkingspot.com / password123
- **Owner**: owner@parkingspot.com / password123
- **Commuter**: john@example.com / password123

---

## 📊 Database Collections & Relationships

* **User**: Core identity. Roles (`commuter`, `owner`, `admin`). Owners have a `subscription` tier.
* **ParkingLot**: Owned by `User`. Stores geospatial index `location`, pricing configurations, and platform commission rates.
* **ParkingFloor**: Belongs to `ParkingLot`. Categorizes infrastructure vertically.
* **ParkingSlot**: Belongs to `ParkingFloor`. Tracks exact status (`available`, `occupied`) and type (`standard`, `ev`, `premium`).
* **Reservation**: Joins `User`, `ParkingLot`, `ParkingSlot`, and `Vehicle`. Stores price locks, overstay fees, and secure `passCode`.
* **Payment**: Financial ledger linking `Reservation` to transaction records.
* **Waitlist**: Queue mechanism mapping `User` to `ParkingLot` limits.

---

## 🌐 Core API Endpoints

* **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
* **Search (Geo)**: `GET /api/search?lat=X&lng=Y&maxDistance=Z`
* **Booking**: `POST /api/bookings` (Creates & verifies overlap), `POST /api/bookings/:id/pay`, `POST /api/bookings/:id/extend`
* **Analytics**: `GET /api/analytics/dashboard` (Aggregation stats), `GET /api/analytics/:lotId/pricing-recommendation`
* **Management**: `POST /api/analytics/:lotId/no-shows` (Triggers penalties), `POST /api/bookings/check-in` (QR validation)

---

## 🔮 Future Enhancements

* Hardware IoT Integration for boom barriers and automated slot-sensors.
* ML-driven predictive demand modeling.
* Third-party integrations for valet management and car wash premium services.
* Corporate HR API integrations for employee fleet parking subsidies.
