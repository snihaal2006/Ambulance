/**
 * PULSE ROUTER — Clean White Theme 3-Column Case Detail View
 */

import { Store } from './state.js';
import { MEDICAL_INCIDENT_CATEGORIES } from './data.js';
import { LiveMapEngine } from './map.js';

class CaseDetailViewController {
  constructor() {
    this.caseMapEngine = null;
  }

  render(container, caseId) {
    if (!container) return;

    const activeCase = Store.getCaseById(caseId) || Store.activeCases[0];
    if (!activeCase) return;

    const category = MEDICAL_INCIDENT_CATEGORIES[activeCase.incidentType] || MEDICAL_INCIDENT_CATEGORIES.TRAUMA;
    const ambulance = Store.getAmbulanceById(activeCase.assignedAmbulanceId);
    const assignedHospital = Store.getHospitalById(activeCase.assignedHospitalId);

    container.innerHTML = `
      <div class="space-y-4">
        
        <!-- Header -->
        <div class="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button type="button" onclick="window.PulseRouter.navigate('active-emergencies')" class="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 font-mono text-xs font-bold transition">
              ← BACK
            </button>
            <div class="flex items-center gap-2 font-mono">
              <span class="text-sm font-bold text-rose-600">${activeCase.caseId}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${activeCase.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'} uppercase">${activeCase.priority}</span>
              <span class="text-xs text-slate-900 font-bold font-sans uppercase">${activeCase.title || category.label}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs font-mono">
            <div class="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 font-bold uppercase text-[11px]">
              ● ${activeCase.state.replace(/_/g, ' ')}
            </div>
            <button type="button" onclick="window.PulseRouter.openManualOverrideModal('${activeCase.caseId}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono font-bold transition">
              Reassign
            </button>
            <button type="button" onclick="window.PulseRouter.completeCase('${activeCase.caseId}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg font-mono shadow transition">
              Complete Case
            </button>
          </div>
        </div>

        <!-- 3-Column Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          <!-- Col 1 (Left 3 cols): Timeline -->
          <div class="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div class="text-xs font-mono font-bold text-slate-700 border-b border-slate-100 pb-2 uppercase">
              CASE TIMELINE (${activeCase.timeline.length})
            </div>

            <div class="space-y-3 max-h-[580px] overflow-y-auto pr-1 text-xs">
              ${activeCase.timeline.map((evt, idx) => {
                const isLast = idx === activeCase.timeline.length - 1;
                return `
                  <div class="border-l-2 ${isLast ? 'border-emerald-500' : 'border-slate-200'} pl-3 space-y-0.5">
                    <div class="flex items-center justify-between text-xs">
                      <strong class="${isLast ? 'text-emerald-700 font-bold' : 'text-slate-900'} font-sans">${evt.label}</strong>
                      <span class="font-mono text-[10px] text-slate-400">${evt.time}</span>
                    </div>
                    ${evt.desc ? `<p class="text-[11px] text-slate-500 leading-tight">${evt.desc}</p>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Col 2 (Center 5.5 cols): Live Tracking Map & State Machine -->
          <div class="lg:col-span-5 space-y-4">
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
              <div id="caseDetailMap" class="w-full h-[400px]"></div>

              <div class="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                <div class="truncate text-slate-600 text-xs">${activeCase.location.address}</div>
                <div class="flex items-center gap-3 shrink-0">
                  <span class="text-slate-800 font-bold">${activeCase.distanceKm} km</span>
                  <span class="text-emerald-600 font-bold">ETA: ${activeCase.etaMinutes} min</span>
                </div>
              </div>
            </div>

            <!-- Workflow Simulators -->
            <div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2">
              <div class="text-[10px] font-mono text-slate-400 uppercase font-bold">SIMULATE LIFECYCLE STEP:</div>
              <div class="grid grid-cols-3 gap-1.5 text-xs font-mono">
                <button type="button" onclick="window.PulseRouter.simulateDriverAcceptance('${activeCase.caseId}')" class="py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg">
                  1. Accept
                </button>
                <button type="button" onclick="window.PulseRouter.simulateArrivalAtIncident('${activeCase.caseId}')" class="py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg">
                  2. Arrive Scene
                </button>
                <button type="button" onclick="window.PulseRouter.simulateIoTTelemetry('${activeCase.caseId}')" class="py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg">
                  3. Stream IoT
                </button>
                <button type="button" onclick="window.PulseRouter.triggerHospitalReroute('${activeCase.caseId}')" class="py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg">
                  4. Reroute Hosp
                </button>
                <button type="button" onclick="window.PulseRouter.simulateArrivalAtHospital('${activeCase.caseId}')" class="py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg">
                  5. Arrive Hosp
                </button>
                <button type="button" onclick="window.PulseRouter.simulatePatientHandover('${activeCase.caseId}')" class="py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg">
                  6. Handover Pt
                </button>
              </div>
            </div>
          </div>

          <!-- Col 3 (Right 3.5 cols): Current Response Info -->
          <div class="lg:col-span-4 space-y-4 text-xs">
            
            <!-- Assigned Ambulance -->
            <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
              <div class="flex items-center justify-between border-b border-slate-100 pb-1.5 text-xs font-mono">
                <span class="text-slate-500 uppercase font-bold">ASSIGNED AMBULANCE</span>
                <span class="text-emerald-600 font-bold">● GPS ACTIVE</span>
              </div>
              ${ambulance ? `
                <div class="font-mono space-y-1.5">
                  <div class="flex justify-between"><strong class="text-slate-900 text-sm">${ambulance.id}</strong> <span class="text-slate-500">${ambulance.registration}</span></div>
                  <div class="flex justify-between text-slate-600"><span class="text-slate-400">Driver:</span> <strong class="text-slate-900 font-sans">${ambulance.driverName}</strong></div>
                  <div class="flex justify-between text-slate-600"><span class="text-slate-400">Station:</span> <span>${ambulance.baseStation}</span></div>
                  <div class="flex justify-between text-slate-600"><span class="text-slate-400">Contact:</span> <a href="tel:${ambulance.driverPhone}" class="text-emerald-600 font-bold hover:underline">${ambulance.driverPhone}</a></div>
                </div>
              ` : '<div class="text-slate-400">Pending assignment</div>'}
            </div>

            <!-- Caller & Patient -->
            <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 font-mono text-xs">
              <div class="text-xs font-mono font-bold text-slate-700 border-b border-slate-100 pb-1.5 uppercase">PATIENT & CALLER</div>
              <div class="flex justify-between"><span class="text-slate-400">Caller:</span> <strong class="text-slate-900">${activeCase.caller.phone}</strong></div>
              <div class="flex justify-between"><span class="text-slate-400">Patients:</span> <strong class="text-slate-900">${activeCase.patientDetails.count}</strong></div>
              <div class="pt-1 text-xs text-slate-700 font-sans">
                <span class="text-slate-400 font-mono block text-[10px] uppercase">Condition:</span>
                ${activeCase.patientDetails.condition}
              </div>
            </div>

            <!-- External IoT Telemetry -->
            <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <div class="flex items-center justify-between border-b border-slate-100 pb-1.5 text-xs font-mono">
                <span class="text-slate-700 uppercase font-bold">VEHICLE IOT TELEMETRY</span>
                <span class="text-emerald-600 font-bold">● LIVE</span>
              </div>
              ${activeCase.iotData ? `
                <div class="grid grid-cols-3 gap-2 font-mono text-center text-xs">
                  <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span class="text-[9px] text-slate-400 block">HEART RATE</span>
                    <strong class="text-rose-600 text-sm">${activeCase.iotData.heartRate}</strong>
                    <span class="text-[8px] text-slate-400 block">BPM</span>
                  </div>
                  <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span class="text-[9px] text-slate-400 block">NIBP</span>
                    <strong class="text-slate-900 text-xs">${activeCase.iotData.bloodPressure}</strong>
                    <span class="text-[8px] text-slate-400 block">mmHg</span>
                  </div>
                  <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span class="text-[9px] text-slate-400 block">SpO2</span>
                    <strong class="text-sky-600 text-sm">${activeCase.iotData.spo2}%</strong>
                    <span class="text-[8px] text-slate-400 block">O2</span>
                  </div>
                </div>
                <div class="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
                  <span class="text-slate-400 block text-[10px]">ECG ANALYSIS:</span>
                  ${activeCase.iotData.ecgClassification}
                </div>
              ` : `
                <div class="text-center py-2 text-xs text-slate-400 font-mono">Awaiting triage telemetry link</div>
              `}
            </div>

            <!-- Hospital Destination -->
            <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2.5">
              <div class="flex items-center justify-between border-b border-slate-100 pb-1.5 text-xs font-mono">
                <span class="text-slate-700 uppercase font-bold">ASSIGNED HOSPITAL</span>
                <span class="text-sky-600 font-bold">24/7 SYNC</span>
              </div>
              ${assignedHospital ? `
                <div class="space-y-2">
                  <strong class="text-slate-900 text-xs block font-sans">${assignedHospital.name}</strong>
                  <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div><span class="text-slate-400">ICU:</span> <strong class="text-emerald-600">${assignedHospital.icuBeds} Free</strong></div>
                    <div><span class="text-slate-400">ER:</span> <strong class="text-emerald-600">${assignedHospital.erStatus}</strong></div>
                  </div>
                  ${activeCase.hospitalChanged ? `
                    <div class="p-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono rounded-lg">
                      REROUTED: ${activeCase.hospitalRerouteReason}
                    </div>
                  ` : ''}
                </div>
              ` : `
                <div class="text-center py-2 text-xs text-slate-400 font-mono">Hospital selection pending</div>
              `}
            </div>

          </div>

        </div>

      </div>
    `;

    setTimeout(() => {
      this._initCaseMap(activeCase);
    }, 100);
  }

  _initCaseMap(activeCase) {
    const mapContainer = document.getElementById('caseDetailMap');
    if (!mapContainer) return;

    this.caseMapEngine = new LiveMapEngine();
    this.caseMapEngine.init('caseDetailMap', [activeCase.location.latitude, activeCase.location.longitude], 14);
    this.caseMapEngine.render(Store, activeCase.caseId);
  }
}

export const CaseDetailView = new CaseDetailViewController();
