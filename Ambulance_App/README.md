# Pulse Route (Medical VIT) 🚑

An end-to-end Ambulance Emergency Response application built with Flutter. **Pulse Route** is designed to assist ambulance drivers and emergency medical technicians (EMTs) in managing emergency calls, navigating to incident locations, coordinating drop-offs with hospitals, and maintaining a history of completed trips.

## 🌟 Key Features

* **Real-time Navigation & Routing:** Integrated with `flutter_map` and `latlong2` to provide accurate GPS-based navigation to incident sites and hospitals.
* **Emergency Dispatch Workflow:** Structured screen flows covering the entire emergency lifecycle:
  * 🟢 **On Duty / Waiting:** Status dashboard for active shifts.
  * 🚨 **Incoming Call:** Real-time dispatch alerts with incident details.
  * 🗺️ **Navigation to Incident:** Turn-by-turn guidance to the patient.
  * 🏥 **Hospital Rerouting:** Navigation to the nearest or most equipped hospital, including handling live rerouting.
  * 📋 **Trip Reporting:** End-of-trip summary and logging.
* **Bilingual Support:** Full multilingual support out of the box (English and Tamil).
* **Duty & Shift Management:** Track shift history, completed cases, and driver profile.
* **Responsive Mobile UI:** A dark-themed, robust interface customized for high-stress emergency environments.

## 🛠️ Tech Stack

* **Framework:** [Flutter](https://flutter.dev/) (Dart ^3.6.0)
* **Maps & Navigation:** `flutter_map`, `latlong2`
* **Typography & Icons:** `google_fonts`, `cupertino_icons`
* **System Integration:** `url_launcher` for external intents.
* **Internationalization:** `intl` package for localization and date formatting.

## 🚀 Getting Started

### Prerequisites
* Flutter SDK (>= 3.6.0)
* Dart SDK (>= 3.6.0)
* Android Studio / Xcode for emulators and device deployment

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/snihaal2006/Ambulance.git
   cd Ambulance
   ```
2. **Install dependencies:**
   ```bash
   flutter pub get
   ```
3. **Run the application:**
   ```bash
   flutter run
   ```

## 📱 App Flow (Screens)
The application architecture is cleanly divided into specific stages of the emergency response:
1. `Screen1Login`: Driver authentication.
2. `Screen2Waiting`: Active duty standby dashboard.
3. `Screen3IncomingCall`: Critical alert popups from central dispatch.
4. `Screen4Navigation`: Route tracking to the incident.
5. `Screen5ArrivedIncident`: On-scene medical assessment and patient pickup status.
6. `Screen6HospitalNav`: Routing to the designated hospital.
7. `Screen7TripReport`: Final summary of the emergency case.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/snihaal2006/Ambulance/issues).
