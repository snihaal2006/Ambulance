/**
 * PULSE ROUTER — Real-Time Emergency Call Dispatch & Multi-Device Sync Engine
 */

import { Store } from './state.js';
import { MEDICAL_INCIDENT_CATEGORIES, DEMO_PRESET_SCENARIOS } from './data.js';
import { AudioEngine } from './audio.js';

class EmergencyIntakeController {
  constructor() {
    this.selectedCategory = 'ROAD_ACCIDENT';
    this.callDurationSeconds = 0;
    this.callTimerInterval = null;
    this.miniMap = null;
    this.miniMarker = null;
    this.selectedCoords = { lat: 11.0270, lng: 76.9460 };
    this.pollingInterval = null;
    this.waitingTimerInterval = null;
    this.waitingSeconds = 0;
    this.currentPendingCaseId = null;
  }

  openWorkspace(presetData = null) {
    const modal = document.getElementById('emergencyIntakeModal');
    if (!modal) return;

    const callerPhone = presetData?.callerPhone || '+91 94440 11223';
    const callerName = presetData?.callerName || 'Senthil Nathan';

    this.selectedCategory = presetData?.category || 'ROAD_ACCIDENT';
    this.selectedCoords = {
      lat: presetData?.latitude || 11.0270,
      lng: presetData?.longitude || 76.9460
    };

    this.callDurationSeconds = 0;
    if (this.callTimerInterval) clearInterval(this.callTimerInterval);
    this.callTimerInterval = setInterval(() => {
      this.callDurationSeconds++;
      const min = String(Math.floor(this.callDurationSeconds / 60)).padStart(2, '0');
      const sec = String(this.callDurationSeconds % 60).padStart(2, '0');
      const timerEl = document.getElementById('intakeCallDuration');
      if (timerEl) timerEl.textContent = `${min}:${sec}`;
    }, 1000);

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="fixed inset-0 z-[1000] flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
        <div class="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl text-slate-900 flex flex-col max-h-[92vh] overflow-hidden">
          
          <!-- Top Bar -->
          <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-mono font-bold text-xs shadow-sm shadow-rose-600/30">
                🚨
              </div>
              <div>
                <span class="text-xs font-mono font-bold text-rose-600 uppercase block leading-tight">EMERGENCY CALL INTAKE (SAI BABA COLONY)</span>
                <span class="text-xs font-mono text-slate-900 font-bold">Caller: ${callerPhone}</span>
              </div>
            </div>

            <div class="flex items-center gap-4 text-xs font-mono">
              <div class="text-slate-500">LIVE CALL: <strong id="intakeCallDuration" class="text-emerald-600">00:00</strong></div>
              <button type="button" onclick="window.PulseRouter.closeIntakeModal()" class="text-slate-400 hover:text-slate-700 font-bold text-lg px-2">✕</button>
            </div>
          </div>

          <!-- Body: Comprehensive Details Form -->
          <div class="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
            
            <!-- Quick Preset Scenarios -->
            <div class="flex items-center gap-2 pb-2 border-b border-slate-100 font-mono">
              <span class="text-[11px] text-slate-500 font-bold">QUICK TEST PRESETS:</span>
              ${DEMO_PRESET_SCENARIOS.map((sc, idx) => `
                <button type="button" onclick="window.PulseRouter.loadScenarioIntake(${idx})" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-bold">
                  ${sc.category.replace('_', ' ')}
                </button>
              `).join('')}
            </div>

            <!-- SECTION 1: CALLER & CONTACT DETAILS -->
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div class="text-[11px] font-mono font-bold text-slate-700 uppercase flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <span>📞</span>
                <span>1. CALLER INFORMATION</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label class="text-[10px] text-slate-500 font-mono block mb-1">CALLER FULL NAME</label>
                  <input type="text" id="intakeCallerName" value="${callerName}"
                    class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-medium">
                </div>

                <div>
                  <label class="text-[10px] text-slate-500 font-mono block mb-1">PRIMARY PHONE</label>
                  <input type="text" id="intakeCallerPhone" value="${callerPhone}"
                    class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-rose-500 font-bold">
                </div>

                <div>
                  <label class="text-[10px] text-slate-500 font-mono block mb-1">ALTERNATE PHONE</label>
                  <input type="text" id="intakeAlternatePhone" value="+91 98400 55667"
                    class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-rose-500">
                </div>

                <div>
                  <label class="text-[10px] text-slate-500 font-mono block mb-1">CALLER TYPE</label>
                  <select id="intakeCallerType" class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none">
                    <option value="Bystander">Bystander / Witness</option>
                    <option value="Patient">Patient (Self)</option>
                    <option value="Family">Family Member / Relative</option>
                    <option value="Police">Traffic Police</option>
                    <option value="Doctor">Doctor / Clinic</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- SECTION 2: PATIENT MEDICAL TRIAGE & SYMPTOMS -->
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div class="text-[11px] font-mono font-bold text-slate-700 uppercase flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <span>🏥</span>
                <span>2. PATIENT TRIAGE & MEDICAL ASSESSMENT</span>
              </div>

              <!-- Incident Category Grid -->
              <div>
                <label class="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1.5">SELECT EMERGENCY CATEGORY</label>
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  ${Object.values(MEDICAL_INCIDENT_CATEGORIES).map(cat => `
                    <button type="button" onclick="window.PulseRouter.setIntakeCategory('${cat.id}')"
                      id="catBtn_${cat.id}"
                      class="p-2 rounded-lg border text-left font-sans transition ${cat.id === this.selectedCategory ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}">
                      <div class="text-xs leading-tight">${cat.label}</div>
                      <div class="text-[9px] font-mono mt-0.5 ${cat.priority === 'CRITICAL' ? 'text-rose-600 font-bold' : 'text-amber-600 font-bold'}">${cat.priority}</div>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Patient Profile Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label class="text-[10px] text-slate-500 font-mono block mb-1">PATIENT NAME</label>
                  <input type="text" id="intakePatientName" value="Ramesh Kumar"
                    class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-medium">
                </div>

                <div>
                  <label class="text-[10px] text-slate-500 font-mono block mb-1">AGE & GENDER</label>
                  <div class="grid grid-cols-2 gap-1">
                    <input type="text" id="intakePatientAge" value="34 yrs"
                      class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none">
                    <select id="intakePatientGender" class="w-full bg-white border border-slate-200 rounded-lg px-1.5 py-1.5 text-xs text-slate-800">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="text-[10px] text-slate-500 font-mono block mb-1">PATIENT COUNT</label>
                  <select id="intakePatientCount" class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-mono">
                    <option value="1">1 Patient</option>
                    <option value="2">2 Patients</option>
                    <option value="3">3 Patients</option>
                    <option value="4+">4+ Multiple Casualties (MCI)</option>
                  </select>
                </div>

                <div>
                  <label class="text-[10px] text-slate-500 font-mono block mb-1">CONSCIOUSNESS (AVPU)</label>
                  <select id="intakeAvpu" class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono font-bold text-rose-700">
                    <option value="Pain (P)">P - Responds to Pain Only</option>
                    <option value="Alert (A)">A - Alert & Conscious</option>
                    <option value="Verbal (V)">V - Responds to Verbal</option>
                    <option value="Unresponsive (U)">U - Completely Unresponsive</option>
                  </select>
                </div>
              </div>

              <!-- Symptoms & Checks -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div class="sm:col-span-2">
                  <label class="text-[10px] text-slate-500 font-mono block mb-1">CHIEF COMPLAINT / SYMPTOMS</label>
                  <input type="text" id="intakeCondition" value="Two-wheeler collision, active limb bleed and concussion"
                    class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-medium">
                </div>

                <div>
                  <label class="text-[10px] text-slate-500 font-mono block mb-1">BREATHING & BLEEDING</label>
                  <div class="grid grid-cols-2 gap-1 font-mono text-xs">
                    <select id="intakeBreathing" class="w-full bg-white border border-slate-200 rounded-lg px-1.5 py-1.5 text-xs text-slate-800">
                      <option value="Labored">Breathing: Labored</option>
                      <option value="Normal">Breathing: Normal</option>
                      <option value="Rapid">Breathing: Rapid</option>
                      <option value="Absent">Breathing: Absent / Agonal</option>
                    </select>
                    <select id="intakeBleeding" class="w-full bg-white border border-slate-200 rounded-lg px-1.5 py-1.5 text-xs text-rose-700 font-bold">
                      <option value="Yes">Bleeding: YES</option>
                      <option value="No">Bleeding: No</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 3: LOCATION & MAP PIN -->
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div class="text-[11px] font-mono font-bold text-slate-700 uppercase flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <span>📍</span>
                <span>3. INCIDENT LOCATION (COIMBATORE)</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label class="text-[10px] text-slate-500 font-mono block mb-1">PRIMARY STREET ADDRESS</label>
                  <input type="text" id="intakeAddress" value="${presetData?.address || 'NSR Road, Sai Baba Colony, Coimbatore'}"
                    class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-medium">
                </div>

                <div>
                  <label class="text-[10px] text-slate-500 font-mono block mb-1">LANDMARK</label>
                  <input type="text" id="intakeLandmark" value="${presetData?.landmark || 'Near Avila Convent & Ganga Hospital'}"
                    class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500">
                </div>

                <div>
                  <label class="text-[10px] text-slate-500 font-mono block mb-1">ACCESS NOTES</label>
                  <input type="text" id="intakeAccessNotes" value="Peak evening traffic on NSR Road"
                    class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none">
                </div>
              </div>

              <div class="h-36 rounded-xl border border-slate-200 bg-white overflow-hidden relative">
                <div id="miniIntakeMap" class="w-full h-full"></div>
                <div class="absolute bottom-1.5 left-2 bg-white/95 px-2 py-0.5 rounded text-[10px] font-mono text-slate-700 border border-slate-200 z-[400] shadow-sm">
                  COORDINATES: <span id="miniMapCoordsText" class="text-slate-900 font-bold">${this.selectedCoords.lat.toFixed(4)}, ${this.selectedCoords.lng.toFixed(4)}</span>
                </div>
              </div>
            </div>

            <!-- ACTION: CONFIRM & AUTOMATICALLY INITIATE EMERGENCY CALL -->
            <div class="pt-2">
              <button type="button" id="btnConfirmAndTransmit" onclick="window.PulseRouter.submitIntakeAndCreateCase()" 
                class="w-full py-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-sm uppercase tracking-wider rounded-xl font-mono shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer">
                <span>📞</span>
                <span>CONFIRM & INITIATE EMERGENCY CALL TO DRIVER APP →</span>
              </button>
              <div class="text-[10px] text-slate-400 text-center font-mono mt-1.5">
                Automatically initiates emergency phone ring & siren on the nearest ambulance device in Sai Baba Colony
              </div>
            </div>

          </div>

        </div>
      </div>
    `;

    setTimeout(() => {
      this._initMiniMap();
      
      const confirmBtn = document.getElementById('btnConfirmAndTransmit');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          this.submitIntakeAndCreateCase();
        });
      }
    }, 100);
  }

  _initMiniMap() {
    const container = document.getElementById('miniIntakeMap');
    if (!container) return;

    try {
      if (this.miniMap) {
        this.miniMap.remove();
        this.miniMap = null;
      }

      this.miniMap = L.map('miniIntakeMap', {
        center: [this.selectedCoords.lat, this.selectedCoords.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.miniMap);

      const pinIcon = L.divIcon({
        html: `<div class="w-4 h-4 rounded-full bg-rose-600 border-2 border-white shadow-md"></div>`,
        className: 'custom-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      this.miniMarker = L.marker([this.selectedCoords.lat, this.selectedCoords.lng], { draggable: true, icon: pinIcon }).addTo(this.miniMap);

      this.miniMarker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        this.selectedCoords = { lat: pos.lat, lng: pos.lng };
        const coordEl = document.getElementById('miniMapCoordsText');
        if (coordEl) coordEl.textContent = `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
      });
    } catch (e) {
      console.warn('Mini map safely caught:', e);
    }
  }

  setCategory(catId) {
    this.selectedCategory = catId;
    Object.keys(MEDICAL_INCIDENT_CATEGORIES).forEach(id => {
      const btn = document.getElementById(`catBtn_${id}`);
      if (btn) {
        if (id === catId) {
          btn.className = 'p-2 rounded-lg border text-left font-sans transition bg-rose-50 border-rose-500 text-rose-900 font-bold';
        } else {
          btn.className = 'p-2 rounded-lg border text-left font-sans transition bg-white border-slate-200 text-slate-700 hover:bg-slate-100';
        }
      }
    });
  }

  loadScenario(index) {
    const scenario = DEMO_PRESET_SCENARIOS[index];
    if (scenario) this.openWorkspace(scenario);
  }

  closeModal() {
    if (this.callTimerInterval) clearInterval(this.callTimerInterval);
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.waitingTimerInterval) clearInterval(this.waitingTimerInterval);

    const modal = document.getElementById('emergencyIntakeModal');
    if (modal) modal.classList.add('hidden');
    const reportModal = document.getElementById('dispatchReportModal');
    if (reportModal) reportModal.classList.add('hidden');

    Store.dismissIncomingCall();
  }

  // --- SUBMIT INTAKE & AUTOMATICALLY INITIATE EMERGENCY CALL ---
  async submitIntakeAndCreateCase() {
    try {
      if (this.callTimerInterval) clearInterval(this.callTimerInterval);

      const callerName = document.getElementById('intakeCallerName')?.value || 'Emergency Caller';
      const callerPhone = document.getElementById('intakeCallerPhone')?.value || '+91 94440 11223';
      const alternatePhone = document.getElementById('intakeAlternatePhone')?.value || '';
      const callerType = document.getElementById('intakeCallerType')?.value || 'Bystander';

      const patientName = document.getElementById('intakePatientName')?.value || 'Ramesh Kumar';
      const patientAge = document.getElementById('intakePatientAge')?.value || '34 yrs';
      const patientGender = document.getElementById('intakePatientGender')?.value || 'Male';
      const patientCount = document.getElementById('intakePatientCount')?.value || '1';
      const avpu = document.getElementById('intakeAvpu')?.value || 'Pain (P)';
      const condition = document.getElementById('intakeCondition')?.value || 'Two-wheeler collision, active limb bleed';
      const breathing = document.getElementById('intakeBreathing')?.value || 'Labored';
      const severeBleeding = document.getElementById('intakeBleeding')?.value || 'Yes';

      const address = document.getElementById('intakeAddress')?.value || 'NSR Road, Sai Baba Colony, Coimbatore';
      const landmark = document.getElementById('intakeLandmark')?.value || 'Near Avila Convent & Ganga Hospital';
      const accessNotes = document.getElementById('intakeAccessNotes')?.value || 'Peak evening traffic on NSR Road';

      const min = String(Math.floor(this.callDurationSeconds / 60)).padStart(2, '0');
      const sec = String(this.callDurationSeconds % 60).padStart(2, '0');

      // 1. Calculate closest ambulance in Sai Baba Colony
      const availableAmbulances = Store.fleet.filter(a => a.dutyStatus === 'ON_DUTY');
      let nearestAmbulance = availableAmbulances[0];
      let shortestDist = 999;

      const targetLat = this.selectedCoords?.lat || 11.0270;
      const targetLng = this.selectedCoords?.lng || 76.9460;

      availableAmbulances.forEach(amb => {
        const dist = Store._calculateHaversineDistance(targetLat, targetLng, amb.lat, amb.lng);
        if (dist < shortestDist && amb.status === 'AVAILABLE') {
          shortestDist = dist;
          nearestAmbulance = amb;
        }
      });

      const calculatedEta = Math.max(2, Math.round(shortestDist * 2.2 + 1));
      
      let backendCaseId = null;
      try {
          const req = await fetch('https://closure-fantastic-pos-coleman.trycloudflare.com/api/emergencies', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  callerName: callerName,
                  callerPhone: callerPhone,
                  patientName: patientName,
                  emergencyType: this.selectedCategory || 'ROAD_ACCIDENT',
                  severity: 'CRITICAL',
                  incidentAddress: address,
                  latitude: targetLat,
                  longitude: targetLng,
                  notes: condition + ". " + accessNotes
              })
          });
          if(!req.ok) throw new Error('Backend failed');
          const res = await req.json();
          backendCaseId = res.caseNumber;
          await fetch('https://closure-fantastic-pos-coleman.trycloudflare.com/api/emergencies/' + res.id + '/dispatch', { method: 'POST', headers: { 'Bypass-Tunnel-Reminder': 'true' } });
      } catch(err) {
          alert('BACKEND UNAVAILABLE');
          return;
      }

      // 2. Create case object
      const newCase = Store.createCaseFromIntake({
        category: this.selectedCategory,
        callerName,
        callerPhone,
        alternatePhone,
        callerType,
        patientName,
        patientAge,
        patientGender,
        patientCount,
        avpu,
        condition,
        breathing,
        severeBleeding,
        address,
        landmark,
        accessNotes,
        latitude: targetLat,
        longitude: targetLng,
        callDuration: `${min}:${sec}`,
        assignedAmbulanceId: nearestAmbulance?.id || 'AMB-1042',
        assignedDriver: {
          id: nearestAmbulance?.driverId || 'DRV-1042',
          name: nearestAmbulance?.driverName || 'Arun Kumar',
          phone: nearestAmbulance?.driverPhone || '+91 98401 22345',
          reg: nearestAmbulance?.registration || 'TN 38 AB 4521'
        },
        distanceKm: shortestDist < 900 ? shortestDist : 1.2,
        etaMinutes: calculatedEta,
        state: 'PENDING_DRIVER_ACCEPTANCE'
      });
      
      newCase.caseId = backendCaseId || newCase.caseId;

      this.currentPendingCaseId = newCase.caseId;

      if (nearestAmbulance) {
        nearestAmbulance.status = 'DISPATCHING';
        nearestAmbulance.activeCaseId = newCase.caseId;
      }

      // 4. DISPLAY THE LIVE OUTGOING EMERGENCY CALL SCREEN
      this.renderLiveOutgoingEmergencyCallPage(newCase.caseId, nearestAmbulance, newCase);

      // 5. Start real-time polling listener
      this._startRealtimeDriverSync(newCase.caseId);

    } catch (err) {
      console.error('Error during emergency call initiation:', err);
    }
  }

  // --- OUTGOING EMERGENCY CALL RINGING SCREEN ---
  renderLiveOutgoingEmergencyCallPage(caseId, ambulance, caseData) {
    const modal = document.getElementById('emergencyIntakeModal');
    if (!modal) return;

    this.waitingSeconds = 0;
    if (this.waitingTimerInterval) clearInterval(this.waitingTimerInterval);
    this.waitingTimerInterval = setInterval(() => {
      this.waitingSeconds++;
      const timerEl = document.getElementById('liveCallRingingTimer');
      if (timerEl) timerEl.textContent = `${String(this.waitingSeconds).padStart(2, '0')}s`;
    }, 1000);

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div class="bg-white border-2 border-emerald-500/40 rounded-3xl w-full max-w-lg p-7 shadow-2xl text-slate-900 space-y-6 text-center">
          
          <!-- Top Call Indicator -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 font-mono text-xs">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <strong class="text-emerald-700 font-bold uppercase tracking-wider">LIVE CALL INITIATED</strong>
            </div>
            <span class="text-slate-500 font-bold">${caseId}</span>
          </div>

          <!-- Pulsing Phone Call Waves Graphic -->
          <div class="relative w-24 h-24 mx-auto my-2 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping" style="animation-duration: 1.5s;"></div>
            <div class="absolute w-20 h-20 rounded-full border border-emerald-500/50 animate-pulse"></div>
            <div class="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl shadow-xl shadow-emerald-600/40 font-mono">
              📞
            </div>
          </div>

          <!-- Call Status -->
          <div class="space-y-1.5">
            <h2 class="text-lg font-mono font-black text-slate-900 uppercase tracking-tight">CALLING AMBULANCE CREW</h2>
            <p class="text-xs text-slate-600 font-sans">
              Ringing Driver <strong class="text-slate-900 font-bold">${ambulance?.driverName || 'Arun Kumar'}</strong> on Flutter Mobile Device...
            </p>
            <div class="text-sm font-mono font-bold text-emerald-700 pt-1">
              ${ambulance?.driverPhone || '+91 98401 22345'}
            </div>
          </div>

          <!-- Live Step Cards -->
          <div class="space-y-2 text-left font-mono text-xs">
            
            <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-slate-700">
              <div class="flex items-center gap-2">
                <span class="text-base">📍</span>
                <div>
                  <span class="text-slate-400 block text-[10px]">INCIDENT PICKUP</span>
                  <strong class="text-slate-900 font-sans text-xs">${caseData.location.address}</strong>
                </div>
              </div>
              <span class="text-emerald-600 font-bold">${caseData.distanceKm} km</span>
            </div>

            <div class="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-900 animate-pulse">
              <div class="flex items-center gap-2.5">
                <span class="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">●</span>
                <div class="text-xs">
                  <span class="font-bold block">Ringing Driver Device & Sounding Siren...</span>
                  <span class="text-[10.5px] text-emerald-700 font-sans">Unit: ${ambulance?.id || 'AMB-1042'} (${ambulance?.registration || 'TN 38 AB 4521'})</span>
                </div>
              </div>
              <span id="liveCallRingingTimer" class="text-sm font-bold text-emerald-800 font-mono">00s</span>
            </div>

          </div>

          <!-- Immediate Test Simulation Button -->
          <div class="pt-2 space-y-2">
            <button type="button" onclick="window.PulseRouter.simulateFlutterDriverAccept('${caseId}')" 
              class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl font-mono shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer">
              <span>⚡</span>
              <span>SIMULATE DRIVER ANSWERS CALL & ACCEPTS</span>
            </button>

            <button type="button" onclick="window.PulseRouter.closeIntakeModal()" class="text-slate-400 hover:text-slate-600 text-[11px] font-mono">
              ✕ Cancel Call / Close Screen
            </button>
          </div>

        </div>
      </div>
    `;
  }

  // --- REAL-TIME LISTENER FOR CALL ANSWER ---
  _startRealtimeDriverSync(caseId) {
    if (this.pollingInterval) clearInterval(this.pollingInterval);

    this.pollingInterval = setInterval(async () => {
      try {
        const res = await fetch('https://closure-fantastic-pos-coleman.trycloudflare.com/api/emergencies/active');
        if (res.ok) {
          const json = await res.json();
          const target = json.find(c => c.caseNumber === caseId);
          const isAnswered = target?.status === 'ACCEPTED';

          if (target && isAnswered) {
            if (this.pollingInterval) clearInterval(this.pollingInterval);
            if (this.waitingTimerInterval) clearInterval(this.waitingTimerInterval);
            this.pollingInterval = null;
            this.waitingTimerInterval = null;

            try { AudioEngine.playDriverAcceptedChime(); } catch (e) {}

            Store.handleDriverAcceptance(caseId, target.assignedAmbulanceId, target.assignedDriver?.name);
            this.showDispatchReportModal(caseId, target);
          }
        }
      } catch (e) {}
    }, 800);
  }

  // --- DISPATCH CONFIRMED REPORT POP-UP ---
  showDispatchReportModal(caseId, apiData = null) {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.waitingTimerInterval) clearInterval(this.waitingTimerInterval);

    const modal = document.getElementById('emergencyIntakeModal');
    if (!modal) return;

    const activeCase = Store.getCaseById(caseId) || apiData;
    if (!activeCase) return;

    const ambulance = Store.getAmbulanceById(activeCase.assignedAmbulanceId);
    const hospital = Store.getHospitalById(activeCase.assignedHospitalId || 'hosp-ganga');

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="fixed inset-0 z-[1000] flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-bounce-short">
        <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl text-slate-900 space-y-4 max-h-[90vh] overflow-y-auto">
          
          <!-- Top Confirmation Status -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span class="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">CALL CONNECTED • CASE ACCEPTED</span>
            </div>
            <button type="button" onclick="window.PulseRouter.closeIntakeModal()" class="text-slate-400 hover:text-slate-700 font-bold">✕</button>
          </div>

          <!-- Who Took The Case Card -->
          <div class="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-xl font-mono font-black text-slate-900">${ambulance?.id || activeCase.assignedAmbulanceId}</h3>
                  <span class="text-[10px] font-mono bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">✓ CALL ANSWERED</span>
                  <span class="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">${ambulance?.typeCode || 'ALS'}</span>
                </div>
                <p class="text-xs text-slate-700">Driver / Crew: <strong class="text-slate-900 font-bold font-sans">${ambulance?.driverName || activeCase.assignedDriver?.name}</strong></p>
                <p class="text-xs text-slate-500 font-mono">${ambulance?.registration || 'TN 38 AB 4521'} • Base: ${ambulance?.baseStation || 'Sai Baba Colony Hub'}</p>
              </div>

              <div class="text-right font-mono">
                <span class="text-[10px] text-slate-400 block uppercase font-bold">ESTIMATED ETA</span>
                <strong class="text-emerald-600 text-xl font-bold">${activeCase.etaMinutes} MIN</strong>
                <span class="text-xs text-slate-500 block">${activeCase.distanceKm} km away</span>
              </div>
            </div>

            <!-- Direct Call Option to Crew -->
            <a href="tel:${ambulance?.driverPhone || activeCase.assignedDriver?.phone || '+919840122345'}" 
              class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl font-mono shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2">
              <span>📞</span>
              <span>CALL AMBULANCE CREW (${ambulance?.driverPhone || activeCase.assignedDriver?.phone || '+91 98401 22345'})</span>
            </a>
          </div>

          <!-- Comprehensive Operational Summary -->
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs font-mono">
            <div class="text-[11px] uppercase text-slate-400 font-bold border-b border-slate-200 pb-1.5 flex justify-between">
              <span>OPERATIONAL DISPATCH REPORT</span>
              <span class="text-rose-600 font-bold">${activeCase.caseId}</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-slate-700 pt-1">
              <div><span class="text-slate-400">Caller:</span> <strong class="text-slate-900">${activeCase.caller?.name || 'Emergency Caller'}</strong></div>
              <div><span class="text-slate-400">Caller Phone:</span> <strong class="text-slate-900">${activeCase.caller?.phone || '+91 94440 11223'}</strong></div>
              <div><span class="text-slate-400">Patient:</span> <span class="text-slate-900">${activeCase.patientDetails?.name || 'Ramesh (34M)'}</span></div>
              <div><span class="text-slate-400">AVPU Status:</span> <strong class="text-rose-600">${activeCase.patientDetails?.avpu || 'Pain (P)'}</strong></div>
              <div><span class="text-slate-400">Breathing:</span> <span>${activeCase.patientDetails?.breathing || 'Labored'}</span></div>
              <div><span class="text-slate-400">Severe Bleeding:</span> <strong class="text-rose-600">${activeCase.patientDetails?.severeBleeding || 'Yes'}</strong></div>
            </div>

            <div class="pt-1.5 border-t border-slate-200 text-slate-700 font-sans">
              <span class="text-slate-400 font-mono text-[10px] uppercase block">Location:</span>
              <strong class="text-slate-900 text-xs">${activeCase.location.address}</strong>
              ${activeCase.location.landmark ? `<span class="text-slate-500 text-xs block">Landmark: ${activeCase.location.landmark}</span>` : ''}
            </div>

            ${hospital ? `
              <div class="pt-1.5 border-t border-slate-200 flex items-center justify-between text-slate-700">
                <span>Assigned Hospital:</span>
                <strong class="text-sky-700">${hospital.name} (${hospital.icuBeds} ICU Beds)</strong>
              </div>
            ` : ''}
          </div>

          <!-- Bottom Navigation Actions -->
          <div class="flex items-center gap-2 pt-1">
            <button type="button" onclick="window.PulseRouter.closeIntakeModal(); window.PulseRouter.navigate('overview');" 
              class="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-mono rounded-xl transition">
              🗺️ TRACK LIVE ON MAP
            </button>
            <button type="button" onclick="window.PulseRouter.closeIntakeModal(); window.PulseRouter.navigate('dispatch');" 
              class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs font-mono rounded-xl transition">
              VIEW ACTIVE DISPATCH →
            </button>
          </div>

        </div>
      </div>
    `;
  }
}

export const IntakeController = new EmergencyIntakeController();
