/**
 * PULSE ROUTER — Main Application Router & Shell Controller
 */

import { Store } from './state.js';
import { AudioEngine } from './audio.js';
import { IntakeController } from './intake.js';
import { Dispatch } from './dispatch.js';
import { Views } from './views.js';
import { MapEngine } from './map.js';

class PulseRouterAdminApp {
  constructor() {
    this.currentSection = 'overview';
  }

  init() {
    window.PulseRouter = this;

    this._startLiveClock();

    Store.subscribe((eventKey) => {
      this.updateTopBarStats();
    this.startCloudSync();

      if (this.currentSection === 'overview' && eventKey !== 'incoming_call') {
        // Map engine updates internally
      } else if (this.currentSection === 'dispatch') {
        const container = document.getElementById('mainContentArea');
        if (container) Dispatch.render(container);
      }
    });

    this.navigate('overview');
    this.updateTopBarStats();
    this.startCloudSync();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        IntakeController.closeModal();
        const reportModal = document.getElementById('dispatchReportModal');
        if (reportModal) reportModal.classList.add('hidden');
      }
    });
  }

  _startLiveClock() {
    const clockEl = document.getElementById('topLiveClock');
    const update = () => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      if (clockEl) clockEl.textContent = timeStr;
    };
    update();
    setInterval(update, 1000);
  }


  startCloudSync() {
    setInterval(async () => {
      try {
        const resAmb = await fetch('https://closure-fantastic-pos-coleman.trycloudflare.com/api/ambulances');
        if (resAmb.ok) {
          const liveAmbs = await resAmb.json();
          const newFleet = [];
          for (const la of liveAmbs) {
            if (la.ambulanceCode !== 'AMB-1042') continue; // Hide other mock ambulances
            if (la.status === 'OFF_DUTY') continue; // Hide signed-out ambulances
            const existing = Store.fleet.find(a => a.id === la.ambulanceCode) || {
              id: la.ambulanceCode,
              registration: 'TN 38 AB 4521',
              type: 'ALS (Advanced Life Support)',
              typeCode: 'ALS',
              dutyStatus: 'ON_DUTY',
              baseStation: 'Coimbatore Hub',
              speed: 0
            };
            existing.lat = la.latitude;
            existing.lng = la.longitude;
            existing.status = la.status;
            existing.driverName = la.driverName || existing.driverName;
            newFleet.push(existing);
          }
          Store.fleet = newFleet;
          if (this.currentSection === 'overview') MapEngine.render(Store);
          this.updateTopBarStats();
    this.startCloudSync();
        }

        // Fetch Hospitals
        const resHosp = await fetch('https://closure-fantastic-pos-coleman.trycloudflare.com/api/hospitals');
        if (resHosp.ok) {
          const liveHosp = await resHosp.json();
          const newHosp = [];
          for (const lh of liveHosp) {
            const existing = Store.hospitals.find(h => h.id === lh.id) || {
              id: lh.id,
              name: lh.name,
              shortName: lh.shortName,
              address: 'Coimbatore',
              zone: 'Coimbatore',
              lat: lh.lat,
              lng: lh.lng,
              phone: '+91 422 222 2222',
              totalIcuBeds: 20,
              wardBeds: 40,
              otAvailable: true,
              ctScanReady: true,
              cathLabActive: true,
              capabilities: lh.capabilities,
              specialties: [],
              tags: []
            };
            existing.erStatus = lh.erStatus;
            existing.icuBeds = lh.icuBeds;
            newHosp.push(existing);
          }
          Store.hospitals = newHosp;
          if (this.currentSection === 'hospitals') {
             const container = document.getElementById('mainContentArea');
             if (container) Views.renderHospitals(container);
          }
        }
        
        const resCases = await fetch('https://closure-fantastic-pos-coleman.trycloudflare.com/api/emergencies/active');
        if (resCases.ok) {
          const liveCases = await resCases.json();
          const newCases = [];
          for (const lc of liveCases) {
            const existing = Store.activeCases.find(c => c.caseId === lc.caseNumber) || {
              caseId: lc.caseNumber,
              priority: lc.severity || 'CRITICAL',
              caller: { name: lc.callerName, phone: lc.callerPhone },
              patientDetails: { name: lc.patientName },
              title: lc.emergencyType || 'EMERGENCY',
              location: { address: lc.incidentAddress, latitude: lc.latitude, longitude: lc.longitude },
              state: lc.status,
              assignedAmbulanceId: lc.assignedAmbulanceId == 1 ? 'AMB-1042' : 'AMB-1042',
              timeline: [],
              etaMinutes: 5,
              distanceKm: 2.5
            };
            
            // Calculate real distance if we have ambulance
            const amb = Store.fleet.find(a => a.id === existing.assignedAmbulanceId);
            if (amb && existing.location.latitude && amb.lat) {
               // Haversine
               const R = 6371; // km
               const dLat = (existing.location.latitude - amb.lat) * Math.PI / 180;
               const dLon = (existing.location.longitude - amb.lng) * Math.PI / 180;
               const lat1 = amb.lat * Math.PI / 180;
               const lat2 = existing.location.latitude * Math.PI / 180;
               const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                         Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
               const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
               existing.distanceKm = (R * c).toFixed(1);
               existing.etaMinutes = Math.max(1, Math.round((existing.distanceKm / 40) * 60)); // assuming 40 km/h
            }

            
            if (lc.status === 'ACCEPTED' && existing.state !== 'ACCEPTED') {
               existing.timeline.push({ step: 'ACCEPTED', label: 'Driver Accepted Case' });
            }
            existing.state = lc.status;
            newCases.push(existing);
          }
          Store.activeCases = newCases;
          if (this.currentSection === 'dispatch') {
             const container = document.getElementById('mainContentArea');
             if (container) Dispatch.render(container);
          }
          this.updateTopBarStats();
    this.startCloudSync();
        }
      } catch (e) {
        console.error("Cloud Sync Error", e);
      }
    }, 2000);
  }

  updateTopBarStats() {
    const ambCounter = document.getElementById('topAmbOnlineCount');
    if (ambCounter) ambCounter.textContent = `${Store.fleet.filter(a => a.dutyStatus === 'ON_DUTY').length} ONLINE`;

    const casesCounter = document.getElementById('topActiveCasesCount');
    if (casesCounter) casesCounter.textContent = String(Store.getActiveEmergenciesCount()).padStart(2, '0');
  }

  navigate(section) {
    this.currentSection = section;
    Store.currentSection = section;

    document.querySelectorAll('.nav-btn').forEach(btn => {
      const target = btn.getAttribute('data-section');
      if (target === section) {
        btn.className = 'nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200 text-left transition';
      } else {
        btn.className = 'nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-left transition';
      }
    });

    const mainContainer = document.getElementById('mainContentArea');
    if (!mainContainer) return;

    switch (section) {
      case 'overview':
        Views.renderOverview(mainContainer);
        break;
      case 'dispatch':
        Dispatch.render(mainContainer);
        break;
      case 'hospitals':
        Views.renderHospitals(mainContainer);
        break;
      case 'history':
        Views.renderHistory(mainContainer);
        break;
      default:
        Views.renderOverview(mainContainer);
        break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openCase(caseId) {
    Store.selectedCaseId = caseId;
    this.navigate('dispatch');
  }

  // --- INTAKE EMERGENCY DIRECT OPENER ---
  triggerIncomingCall(preset = null) {
    // Open Intake Modal directly on screen
    IntakeController.openWorkspace(preset);
  }

  answerIncomingCall() {
    const preset = Store.incomingCall?.presetData;
    Store.dismissIncomingCall();
    IntakeController.openWorkspace(preset);
  }

  dismissIncomingCall() {
    Store.dismissIncomingCall();
  }

  closeIntakeModal() {
    IntakeController.closeModal();
  }

  setIntakeCategory(catId) {
    IntakeController.setCategory(catId);
  }

  loadScenarioIntake(index) {
    IntakeController.loadScenario(index);
  }

  submitIntakeAndCreateCase() {
    IntakeController.submitAndCreateCase();
  }

  simulateFlutterDriverAccept(caseId) {
    fetch('/api/v1/driver/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: caseId,
        ambulanceId: 'AMB-1042',
        driverName: 'Arun Kumar',
        status: 'ACCEPTED',
        responseSeconds: 2
      })
    }).then(res => res.json()).then(data => {
      Store.handleDriverAcceptance(caseId, 'AMB-1042', 'Arun Kumar');
      IntakeController.showDispatchReportModal(caseId, data.data);
    }).catch(() => {
      Store.handleDriverAcceptance(caseId, 'AMB-1042', 'Arun Kumar');
      IntakeController.showDispatchReportModal(caseId);
    });
  }

  // History & Hospital Controls
  filterHistory() {
    const query = document.getElementById('historySearchInput')?.value.toLowerCase() || '';

    const filtered = Store.historyCases.filter(c => {
      return c.caseId.toLowerCase().includes(query) ||
             (c.title || '').toLowerCase().includes(query) ||
             (c.driver || '').toLowerCase().includes(query) ||
             (c.ambulance || '').toLowerCase().includes(query) ||
             (c.location || '').toLowerCase().includes(query);
    });

    const tbody = document.getElementById('historyTableBody');
    if (tbody) {
      tbody.innerHTML = filtered.map(item => `
        <tr class="hover:bg-slate-50 transition">
          <td class="py-3 px-3.5 text-rose-600 font-bold">${item.caseId}</td>
          <td class="py-3 px-3.5 text-slate-500">${item.date} ${item.time}</td>
          <td class="py-3 px-3.5">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${item.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
              ${item.priority}
            </span>
          </td>
          <td class="py-3 px-3.5 text-slate-900 font-sans font-semibold">${item.title || item.incidentType}<br><span class="text-[10px] text-slate-400 font-mono">${item.location}</span></td>
          <td class="py-3 px-3.5 text-slate-700">${item.ambulance} (${item.driver})</td>
          <td class="py-3 px-3.5 text-slate-900 font-sans">${item.hospital} ${item.hospitalChanged ? '<span class="text-[9px] font-mono text-amber-600 font-bold bg-amber-50 px-1 rounded">[REROUTED]</span>' : ''}</td>
          <td class="py-3 px-3.5 text-slate-600">${item.totalResponseTime}</td>
          <td class="py-3 px-3.5 text-emerald-600 font-bold">● ${item.status}</td>
          <td class="py-3 px-3.5 text-right">
            <button type="button" onclick="window.PulseRouter.openHistoryDetailModal('${item.caseId}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold transition">
              Log
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  openHistoryDetailModal(caseId) {
    Views.openHistoryModal(caseId);
  }

  adjustHospitalIcu(hospitalId, delta) {
    const hosp = Store.getHospitalById(hospitalId);
    if (hosp) {
      hosp.icuBeds = Math.max(0, hosp.icuBeds + delta);
      hosp.erStatus = hosp.icuBeds === 0 ? 'DIVERT' : 'OPEN';
      Store.notify('hospital_capacity_change');
      if (this.currentSection === 'hospitals') {
        const container = document.getElementById('mainContentArea');
        if (container) Views.renderHospitals(container);
      }
    }
  }

  simulateHospitalSaturation(hospitalId) {
    fetch(`https://closure-fantastic-pos-coleman.trycloudflare.com/api/hospitals/${hospitalId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ erStatus: 'DIVERT', icuBeds: 0 })
    });
    // Optimistic update
    const h = Store.getHospitalById(hospitalId);
    if (h) {
      h.erStatus = 'DIVERT';
      h.icuBeds = 0;
    }
    if (this.currentSection === 'hospitals') {
      const container = document.getElementById('mainContentArea');
      if (container) Views.renderHospitals(container);
    }
  }

  handleLogout() {
    this.navigate('overview');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new PulseRouterAdminApp();
  app.init();
});
