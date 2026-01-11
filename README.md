# 🚀 Smart IoT Platform

![Version](https://img.shields.io/badge/version-v1.1.5-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![Database](https://img.shields.io/badge/database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)
![Deployed](https://img.shields.io/badge/deployed-Render-46E3B7?logo=render&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)
![Status](https://img.shields.io/badge/status-stable-success.svg)

A **production-ready Full Stack IoT Platform** for managing devices, controlling hardware features (bulbs, switches, fans), and synchronizing real hardware state using **Desired vs Reported State architecture**.

This system is designed with **real IoT constraints in mind**, not just UI toggles.

---

## ✨ Key Features

### 🔐 Authentication & Security
- Device authentication via deviceId + secret
- Secrets never exposed in plaintext UI
- User-scoped device access
- Firmware cannot access user routes
- JWT-based auth for all user APIs
- 
### 📡 Device Management
- Register devices with unique `deviceId`
- Online / Offline detection via heartbeat
- Human-friendly `Last Seen` timestamps
- Automatic offline marking

### ⚙️ Feature Control (Core IoT Logic)
- Bulbs / Switches (Digital GPIO)
- Fans with **PWM speed control**
- GPIO type enforcement (DIGITAL vs PWM)
- Safe feature add / edit / delete
- GPIO mapping visible in UI

### 🔁 Desired vs Reported State (Industry Pattern)
- `desiredState` / `desiredLevel` set by UI
- `reportedState` / `reportedLevel` confirmed by firmware
- **Pending state UI** while device syncs
- Optimistic UI with rollback on failure

### 🎚️ Fan Speed Control
- PWM-based fan levels (0–5)
- Slider auto-sync with backend
- Level `0` = OFF logic handled correctly

### 🧠 Smart UI/UX
- Disabled controls when device is offline
- Pending badges for unsynced actions
- Mobile-friendly responsive layout
- Centralized color system (`COLORS`)
- Clean, readable dashboards

---

## 🧱 Architecture Overview
> ⚠️ Note:
> Current implementation primarily uses HTTP polling + heartbeat.
> WebSocket-based real-time sync is partially implemented and planned
> as a future stable enhancement after firmware-side confirmation.

```
  Frontend (React)
   ├── Dashboard (Devices Overview)
   ├── DeviceDetails (Feature Control)
   ├── Auth Pages (Login/Register)
   └── Services (API, timeAgo, constants)
  
  Backend (Node.js + Express)
   ├── Auth (JWT)
   ├── Device Controller
   ├── Feature Controller
   ├── Heartbeat & Status Logic
   └── MongoDB Models
  
  Firmware (ESP8266 / ESP32)
   ├── Heartbeat loop
   ├── Command polling
   ├── GPIO control
   └── Reported state updates
```
  ---

## 🔁 Device State Flow

  ```
  UI Action
     ↓
  desiredState / desiredLevel
     ↓
  Backend API
     ↓
  Device polls commands
     ↓
  Hardware changes
     ↓
  reportedState / reportedLevel
     ↓
  UI shows SYNCED
  
  ```
  ---

```md

  This guarantees **real hardware confirmation** and prevents false UI states.
  
  ---
  
  ## 🛠️ Tech Stack
  
  ### Frontend
  - React (Hooks)
  - React Router
  - Axios
  - Inline CSS + Centralized Color System
  
  ### Backend
  - Node.js
  - Express.js
  - MongoDB + Mongoose
  - JWT Authentication
  - REST APIs
  
  ### Firmware
  - ESP8266 / ESP32
  - Arduino Framework
  - PWM & Digital GPIO handling
  - JSON-based command protocol
  
  ---
  
  ## ⚙️ Environment Setup
  
  ### Backend `.env`
  ```env
  PORT=5000
  MONGO_URI=your_mongodb_uri
  JWT_SECRET=your_secret_key

```
---
### 🧑‍💻 Frontend
```
npm install
npm run dev || npm start

```
### 🛢️ Backend
```
npm install
npm run dev
```
---
## 📂 Project structure
```

smart-iot/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── utils/
│   └── index.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── constants/
│   │   └── styles/
│   └── main.jsx
│
└── README.md


```


## Dependencies
```
npm install express mongoose dotenv cors jsonwebtoken bcrypt node-cron
npm install --save-dev nodemon
```



---



## 🚦 Status Handling

  ```
  State              Meaning
  ---
  🟢 Online          Device recently heartbeated
  ---
  🔴 Offline         Device missed heartbeat
  ---
  ⏳ Pending         Desired ≠ Reported
  ---
  ✅ Synced          Desired = Reported
  ---
  ```
## 🔮 Future Enhancements

 - WebSocket / MQTT live updates
 - Telemetry graphs
 - OTA firmware updates
 - Role-based access (Admin / Viewer)
 - Device grouping & automation scenes

## 📜 License

 - Licensed under the **MIT License**.
 
## 👤 Author

- **Study1122**
- Full Stack + IoT Engineer
- Smart IoT Platform
 
## ⭐ Final Note
 - This is not a demo dashboard.
 - It is a real IoT control system built with correct     synchronization, safety, and scalability principles.

