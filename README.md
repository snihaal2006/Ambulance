# PulseRoute - Emergency Response Ecosystem

Welcome to the PulseRoute Hackathon Submission! This repository contains the complete ecosystem for our Next-Gen Ambulance Routing and Emergency Dispatch system.

## Project Structure

This monorepo contains three distinct applications that work together in real-time:

1. **`Admin_Panel/`** (Frontend - Web)
   - A Vite/Vanilla JS dashboard used by the central dispatch team.
   - Features: Live real-time map tracking, hospital capacity management (Simulate Overloads), emergency intake, and active dispatch monitoring.

2. **`Ambulance_App/`** (Frontend - Mobile)
   - A Flutter application used by ambulance drivers.
   - Features: Real-time duty toggle, case acceptance, turn-by-turn navigation, and AI-powered hospital rerouting based on live hospital capacity.

3. **`Backend/`** (Backend - API & Database)
   - A Spring Boot (Java 17) REST API with a MySQL Database running via Docker.
   - Features: Centralized state management, Cloudflare Tunnel integration for public internet access, and real-time endpoints for hospital capacity and active emergencies.

## How to Run

### 1. Backend
```bash
cd Backend
docker compose up --build -d
```
*The backend will automatically start and expose the API on port 8080.*

### 2. Admin Panel
```bash
cd Admin_Panel
npm install
npm run dev
```

### 3. Ambulance App
```bash
cd Ambulance_App
flutter pub get
flutter run
```

---
*Built during the 48-hour hackathon.*
