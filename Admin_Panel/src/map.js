/**
 * PULSE ROUTER — Clean OpenStreetMap Live Engine (No Watermark, Proper Z-Index)
 */

import { Store } from './state.js';

export class LiveMapEngine {
  constructor() {
    this.map = null;
    this.markersGroup = null;
    this.routesGroup = null;
    this.ambulanceMarkers = new Map();
    this.isInitialized = false;
    this.movementInterval = null;
  }

  init(containerId = 'liveMapContainer', center = [11.0270, 76.9460], zoom = 14) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.map) {
      try { this.map.remove(); } catch (e) {}
      this.map = null;
    }

    this.map = L.map(containerId, {
      center: center,
      zoom: zoom,
      zoomControl: false,
      attributionControl: false
    });

    // 100% Free OpenStreetMap Clean Tiles (Zero Watermarks)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.routesGroup = L.layerGroup().addTo(this.map);
    this.markersGroup = L.layerGroup().addTo(this.map);

    this.isInitialized = true;

    this._startLiveVehicleMovement();

    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 150);

    return this.map;
  }

  _startLiveVehicleMovement() {
    if (this.movementInterval) clearInterval(this.movementInterval);
    
    this.movementInterval = setInterval(() => {
      Store.fleet.forEach(amb => {
        if (amb.status === 'AVAILABLE' && amb.dutyStatus === 'ON_DUTY') {
          const deltaLat = (Math.random() - 0.5) * 0.0003;
          const deltaLng = (Math.random() - 0.5) * 0.0003;
          amb.lat += deltaLat;
          amb.lng += deltaLng;

          const marker = this.ambulanceMarkers.get(amb.id);
          if (marker) {
            marker.setLatLng([amb.lat, amb.lng]);
          }
        }
      });
    }, 3000);
  }

  // --- Rapido / Uber Style Top-Down Ambulance Vehicle Marker ---
  _createVehicleIcon(ambulance) {
    const isAvailable = ambulance.status === 'AVAILABLE';
    const isDispatching = ambulance.status === 'DISPATCHING';
    const isEnRoute = ambulance.status === 'NAVIGATING' || ambulance.status === 'NAVIGATING_TO_HOSPITAL';

    const statusBg = isAvailable ? '#10B981' : isDispatching ? '#F59E0B' : isEnRoute ? '#E11D48' : '#8B5CF6';

    const html = `
      <div class="vehicle-marker-container cursor-pointer flex flex-col items-center select-none">
        
        <!-- Unit Badge -->
        <div class="px-1.5 py-0.5 rounded-full bg-white border border-slate-300 shadow flex items-center gap-1 font-mono text-[9px] font-bold text-slate-800 mb-0.5 whitespace-nowrap">
          <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${statusBg};"></span>
          <span>${ambulance.id}</span>
        </div>

        <!-- Top-Down Ambulance Vehicle SVG -->
        <div class="relative w-7 h-10 flex items-center justify-center">
          <svg width="28" height="40" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="26" height="42" rx="7" fill="black" fill-opacity="0.2" />
            <rect x="2" y="2" width="28" height="44" rx="7" fill="#FFFFFF" stroke="#64748B" stroke-width="1.5" />
            <path d="M6 12C6 9.5 8 7.5 10.5 7.5H21.5C24 7.5 26 9.5 26 12V15H6V12Z" fill="#1E293B" />
            <path d="M6 38V36C6 34.5 7.5 33 9 33H23C24.5 33 26 34.5 26 36V38C26 39.5 24.5 41 23 41H9C7.5 41 6 39.5 6 38Z" fill="#334155" />
            <rect x="4" y="17" width="2" height="13" rx="1" fill="#475569" />
            <rect x="26" y="17" width="2" height="13" rx="1" fill="#475569" />
            <rect x="13.5" y="20" width="5" height="11" rx="0.5" fill="#E11D48" />
            <rect x="10.5" y="23" width="11" height="5" rx="0.5" fill="#E11D48" />
            <rect x="8" y="15" width="6" height="2" rx="1" fill="#E11D48" />
            <rect x="18" y="15" width="6" height="2" rx="1" fill="#0284C7" />
            <circle cx="6" cy="4" r="1.5" fill="#FDE047" />
            <circle cx="26" cy="4" r="1.5" fill="#FDE047" />
          </svg>
        </div>

      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'custom-marker',
      iconSize: [40, 52],
      iconAnchor: [20, 38]
    });
  }

  // --- Clean Emergency Incident Marker ---
  _createEmergencyIcon(activeCase) {
    const html = `
      <div class="emergency-pin-pulse cursor-pointer flex flex-col items-center select-none">
        <div class="px-2 py-0.5 rounded bg-rose-600 border border-white text-white shadow-md flex items-center gap-1 font-mono text-[10px] font-bold">
          <span>🚨</span>
          <span>${activeCase.caseId.replace('ER-2026-', '')}</span>
        </div>
        <div class="w-2 h-2 bg-rose-600 rotate-45 -mt-1 border-r border-b border-white"></div>
      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'custom-marker',
      iconSize: [70, 26],
      iconAnchor: [35, 26]
    });
  }

  // --- Clean Hospital Pin ---
  _createHospitalIcon(hospital) {
    const isFull = hospital.icuBeds === 0 || hospital.erStatus === 'DIVERT';

    const html = `
      <div class="cursor-pointer flex items-center gap-1 bg-white border border-slate-300 px-1.5 py-0.5 rounded shadow font-sans text-[10px] select-none">
        <span class="w-3.5 h-3.5 rounded bg-sky-600 text-white font-bold flex items-center justify-center text-[9px]">H</span>
        <span class="font-bold text-slate-800 text-[10px] truncate max-w-[70px]">${hospital.shortName.split(' ')[0]}</span>
        <span class="font-mono text-[9px] font-bold ${isFull ? 'text-rose-600' : 'text-emerald-600'}">
          ${isFull ? 'FULL' : `${hospital.icuBeds}`}
        </span>
      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'custom-marker',
      iconSize: [95, 20],
      iconAnchor: [47, 10]
    });
  }

  render(store = Store, focusCaseId = null) {
    if (!this.map || !this.isInitialized) return;

    this.markersGroup.clearLayers();
    this.routesGroup.clearLayers();
    this.ambulanceMarkers.clear();

    // 1. Render Hospitals
    store.hospitals.forEach(hospital => {
      const marker = L.marker([hospital.lat, hospital.lng], {
        icon: this._createHospitalIcon(hospital)
      });

      marker.bindPopup(`
        <div class="p-2.5 text-xs font-sans max-w-[200px]">
          <div class="flex items-center justify-between border-b border-slate-100 pb-1 mb-1.5">
            <strong class="text-slate-900 text-xs">${hospital.name}</strong>
            <span class="font-mono text-[10px] font-bold text-emerald-600">ER ${hospital.erStatus}</span>
          </div>
          <p class="text-[11px] text-slate-500 mb-1.5">${hospital.address}</p>
          <div class="text-[11px] font-mono bg-slate-50 p-1.5 rounded border border-slate-200">
            <div>ICU Beds: <strong class="text-emerald-600">${hospital.icuBeds} Free</strong></div>
          </div>
        </div>
      `, { offset: [0, -6] });

      this.markersGroup.addLayer(marker);
    });

    // 2. Render Ambulances
    store.fleet.forEach(ambulance => {
      const marker = L.marker([ambulance.lat, ambulance.lng], {
        icon: this._createVehicleIcon(ambulance)
      });

      this.ambulanceMarkers.set(ambulance.id, marker);

      marker.bindPopup(`
        <div class="p-3 text-xs font-sans min-w-[200px]">
          <div class="flex items-center justify-between border-b border-slate-100 pb-1 mb-1.5 font-mono">
            <strong class="text-slate-900 font-bold text-sm">${ambulance.id}</strong>
            <span class="text-[10px] font-bold ${ambulance.status === 'AVAILABLE' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-1.5 py-0.2 rounded">
              ● ${ambulance.status}
            </span>
          </div>

          <div class="space-y-1 text-[11px] text-slate-600 mb-2 font-mono">
            <div class="flex justify-between"><span class="text-slate-400">Driver:</span> <strong class="text-slate-900 font-sans">${ambulance.driverName}</strong></div>
            <div class="flex justify-between"><span class="text-slate-400">Vehicle:</span> <span>${ambulance.registration}</span></div>
            <div class="flex justify-between"><span class="text-slate-400">Phone:</span> <a href="tel:${ambulance.driverPhone}" class="text-emerald-600 font-bold">${ambulance.driverPhone}</a></div>
          </div>

          <a href="tel:${ambulance.driverPhone}" class="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded font-mono transition flex items-center justify-center gap-1.5">
            <span>📞</span> <span>CALL DRIVER</span>
          </a>
        </div>
      `, { offset: [0, -15] });

      this.markersGroup.addLayer(marker);
    });

    // 3. Render Emergencies & Routes
    store.activeCases.forEach(activeCase => {
      const marker = L.marker([activeCase.location.latitude, activeCase.location.longitude], {
        icon: this._createEmergencyIcon(activeCase)
      });

      marker.bindPopup(`
        <div class="p-2.5 text-xs font-sans min-w-[200px]">
          <div class="flex items-center justify-between border-b border-slate-100 pb-1 mb-1 font-mono">
            <strong class="text-rose-600">${activeCase.caseId}</strong>
            <span class="text-[9px] font-bold text-rose-600">${activeCase.priority}</span>
          </div>
          <div class="font-bold text-slate-800 text-xs mb-0.5">${activeCase.title}</div>
          <div class="text-[11px] text-slate-500 mb-2 truncate">${activeCase.location.address}</div>
          <button onclick="window.PulseRouter.openCase('${activeCase.caseId}')" class="w-full py-1 bg-rose-600 text-white font-bold text-[11px] rounded font-mono">
            VIEW DISPATCH →
          </button>
        </div>
      `, { offset: [0, -8] });

      this.markersGroup.addLayer(marker);

      if (activeCase.assignedAmbulanceId) {
        const amb = store.getAmbulanceById(activeCase.assignedAmbulanceId);
        if (amb) {
          const points = [
            [amb.lat, amb.lng],
            [(amb.lat + activeCase.location.latitude) / 2 + 0.0005, (amb.lng + activeCase.location.longitude) / 2],
            [activeCase.location.latitude, activeCase.location.longitude]
          ];
          const routeLine = L.polyline(points, {
            color: '#E11D48',
            weight: 3,
            opacity: 0.9,
            dashArray: '6, 6',
            className: 'animated-route-line'
          });
          this.routesGroup.addLayer(routeLine);
        }
      }
    });

    if (focusCaseId) {
      this.focusOnCase(focusCaseId, store);
    }
  }

  focusOnCase(caseId, store = Store) {
    const activeCase = store.getCaseById(caseId);
    if (!activeCase || !this.map) return;
    this.map.flyTo([activeCase.location.latitude, activeCase.location.longitude], 14, { duration: 0.8 });
  }
}

export const MapEngine = new LiveMapEngine();
