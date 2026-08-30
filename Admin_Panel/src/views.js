/**
 * PULSE ROUTER — Clean Operations Dashboard Views (No Overlaps, Clean White Theme)
 */

import { Store } from './state.js';
import { MapEngine } from './map.js';

export const Views = {
  
  // 1. OVERVIEW — FULL BLEED LIVE MAP WITHOUT HEADER CONFLICTS
  renderOverview(container) {
    const activeCount = Store.getActiveEmergenciesCount();
    const availAmbCount = Store.getAvailableAmbulancesCount();

    container.innerHTML = `
      <div class="relative w-full h-[calc(100vh-92px)] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
        
        <!-- Live Map Engine -->
        <div id="liveMapContainer" class="w-full h-full z-0"></div>

        <!-- Top Left Floating Status Indicator (Clean, No Duplicate Buttons) -->
        <div class="absolute top-3.5 left-3.5 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-mono flex items-center gap-3 select-none pointer-events-auto">
          <div class="flex items-center gap-1.5 pr-3 border-r border-slate-200">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <strong class="text-slate-800">${availAmbCount} AVAILABLE</strong>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <strong class="text-rose-600">${activeCount} ACTIVE EMERGENCIES</strong>
          </div>
        </div>

        <!-- Bottom Left Floating Quick Legend -->
        <div class="absolute bottom-3.5 left-3.5 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow border border-slate-200 text-[10px] font-mono text-slate-600 flex items-center gap-3 select-none pointer-events-auto">
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Available Cab</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Emergency</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded bg-sky-600"></span>
            <span>Hospital</span>
          </div>
        </div>

      </div>
    `;

    setTimeout(() => {
      MapEngine.init('liveMapContainer');
      MapEngine.render(Store);
    }, 100);
  },

  // 2. HOSPITALS DIRECTORY
  renderHospitals(container) {
    const hospitals = Store.hospitals;

    container.innerHTML = `
      <div class="space-y-4">
        <div class="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between font-mono">
          <div>
            <h2 class="text-sm font-bold text-slate-900 uppercase">TERTIARY HOSPITAL TRAUMA NETWORK (${hospitals.length})</h2>
            <p class="text-xs text-slate-500 font-sans">Real-time ICU bed availability & emergency status</p>
          </div>
          <span class="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold">
            ${hospitals.filter(h => h.erStatus === 'OPEN').length} OPEN FOR ADMISSIONS
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          ${hospitals.map(hosp => `
            <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 text-xs">
              <div class="flex items-start justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 class="font-bold text-slate-900 text-xs">${hosp.name}</h3>
                  <span class="text-[10px] text-slate-400 font-mono">${hosp.zone}</span>
                </div>
                <span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${hosp.erStatus === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                  ● ER ${hosp.erStatus}
                </span>
              </div>

              <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between font-mono">
                <span class="text-xs text-slate-500 font-bold">AVAILABLE ICU BEDS:</span>
                <div class="flex items-center gap-1.5">
                  <button type="button" onclick="window.PulseRouter.adjustHospitalIcu('${hosp.id}', -1)" class="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center justify-center">-</button>
                  <strong class="text-sm ${hosp.icuBeds === 0 ? 'text-rose-600' : 'text-emerald-600'}">${hosp.icuBeds} Free</strong>
                  <button type="button" onclick="window.PulseRouter.adjustHospitalIcu('${hosp.id}', 1)" class="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center justify-center">+</button>
                </div>
              </div>

              <div class="text-[11px] text-slate-500 font-mono">
                SPECIALTIES: <span class="text-slate-800 font-sans">${hosp.capabilities.join(', ')}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 3. HISTORY ARCHIVE
  renderHistory(container) {
    const history = Store.historyCases;

    container.innerHTML = `
      <div class="space-y-4">
        <div class="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between font-mono">
          <h2 class="text-sm font-bold text-slate-900 uppercase">EMERGENCY OPERATIONS MASTER ARCHIVE (${history.length})</h2>
          <input type="text" id="historySearchInput" oninput="window.PulseRouter.filterHistory()" placeholder="Search..."
            class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 w-56">
        </div>

        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table class="w-full text-left text-xs font-mono">
            <thead class="bg-slate-50 text-[10px] text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th class="py-3 px-3.5">CASE ID</th>
                <th class="py-3 px-3.5">DATE/TIME</th>
                <th class="py-3 px-3.5">PRIORITY</th>
                <th class="py-3 px-3.5">INCIDENT</th>
                <th class="py-3 px-3.5">AMBULANCE</th>
                <th class="py-3 px-3.5">HOSPITAL</th>
                <th class="py-3 px-3.5">DURATION</th>
                <th class="py-3 px-3.5">STATUS</th>
                <th class="py-3 px-3.5 text-right">AUDIT</th>
              </tr>
            </thead>
            <tbody id="historyTableBody" class="divide-y divide-slate-100 text-[11px]">
              ${history.map(item => `
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-3 px-3.5 text-rose-600 font-bold">${item.caseId}</td>
                  <td class="py-3 px-3.5 text-slate-500">${item.date} ${item.time}</td>
                  <td class="py-3 px-3.5">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${item.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                      ${item.priority}
                    </span>
                  </td>
                  <td class="py-3 px-3.5 text-slate-900 font-sans font-semibold">${item.title || item.incidentType}</td>
                  <td class="py-3 px-3.5 text-slate-700">${item.ambulance} (${item.driver})</td>
                  <td class="py-3 px-3.5 text-slate-900 font-sans">${item.hospital}</td>
                  <td class="py-3 px-3.5 text-slate-600">${item.totalResponseTime}</td>
                  <td class="py-3 px-3.5 text-emerald-600 font-bold">● ${item.status}</td>
                  <td class="py-3 px-3.5 text-right">
                    <button type="button" onclick="window.PulseRouter.openHistoryDetailModal('${item.caseId}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold transition">
                      Log
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div id="historyDetailModalContainer" class="hidden"></div>
    `;
  },

  openHistoryModal(caseId) {
    const container = document.getElementById('historyDetailModalContainer');
    if (!container) return;

    const item = Store.historyCases.find(c => c.caseId === caseId);
    if (!item) return;

    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-5 space-y-3 text-xs text-slate-900 shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2 font-mono">
            <strong class="text-rose-600 text-sm">${item.caseId}</strong>
            <button type="button" onclick="document.getElementById('historyDetailModalContainer').classList.add('hidden')" class="text-slate-400 hover:text-slate-700 font-bold">✕</button>
          </div>

          <div class="space-y-1 text-slate-700 font-mono">
            <div>Incident: <strong class="text-slate-900 font-sans">${item.title}</strong></div>
            <div>Location: <span>${item.location}</span></div>
            <div>Ambulance: <strong class="text-emerald-600">${item.ambulance} (${item.driver})</strong></div>
            <div>Hospital: <strong>${item.hospital}</strong></div>
            <div>Total Duration: <strong>${item.totalResponseTime}</strong></div>
          </div>
        </div>
      </div>
    `;
  }

};
