/**
 * PULSE ROUTER — Clean Active Dispatch View
 * Displays only the ambulance that took the case, live status updates, and a direct Call Crew button.
 */

import { Store } from './state.js';

class DispatchController {
  constructor() {}

  render(container) {
    if (!container) return;

    const activeCases = Store.activeCases;

    container.innerHTML = `
      <div class="space-y-4 max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold font-mono text-slate-900 uppercase">ACTIVE DISPATCHED EMERGENCIES (${activeCases.length})</h2>
            <p class="text-xs text-slate-500">Live operational tracking & direct crew communication</p>
          </div>
          <button type="button" onclick="window.PulseRouter.triggerIncomingCall()" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs font-mono rounded-xl shadow-sm transition">
            + INTAKE EMERGENCY
          </button>
        </div>

        ${activeCases.length === 0 ? `
          <div class="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs text-slate-500 font-mono space-y-2">
            <span class="text-2xl">✓</span>
            <div class="font-bold text-slate-700">NO ACTIVE DISPATCHES IN PROGRESS</div>
            <p class="text-slate-400">All emergency response units are available.</p>
          </div>
        ` : `
          <div class="space-y-4">
            ${activeCases.map(c => {
              const ambulance = Store.getAmbulanceById(c.assignedAmbulanceId);
              const hospital = Store.getHospitalById(c.assignedHospitalId);

              return `
                <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  
                  <!-- Top Case Bar -->
                  <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div class="flex items-center gap-2.5 font-mono">
                      <span class="text-base font-bold text-rose-600">${c.caseId}</span>
                      <span class="px-2 py-0.5 rounded-full ${c.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'} text-[10px] font-bold">
                        ● ${c.priority}
                      </span>
                      <span class="text-xs font-sans font-bold text-slate-900 uppercase">${c.title}</span>
                    </div>

                    <div class="flex items-center gap-2">
                      <span class="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold text-xs rounded-full uppercase">
                        ● ${c.state.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <!-- Assigned Ambulance & Crew Card -->
                  <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    
                    <!-- Crew & Unit Info (7 Cols) -->
                    <div class="md:col-span-7 space-y-1.5">
                      <div class="flex items-center gap-2">
                        <span class="text-base font-mono font-black text-slate-900">${ambulance?.id || c.assignedAmbulanceId || 'DISPATCHED'}</span>
                        <span class="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">${ambulance?.registration || 'TN 01 AB 4521'}</span>
                        <span class="text-xs text-emerald-600 font-mono font-bold">● GPS ACTIVE</span>
                      </div>
                      
                      <div class="text-xs text-slate-700">
                        Driver & Crew: <strong class="text-slate-900">${ambulance?.driverName || c.assignedDriver?.name || 'Assigned Paramedic'}</strong>
                      </div>
                      
                      <div class="text-xs text-slate-500">
                        Incident Location: <span class="text-slate-800 font-medium">${c.location.address}</span>
                      </div>

                      ${hospital ? `
                        <div class="text-xs text-slate-500">
                          Destination Hospital: <strong class="text-sky-700">${hospital.name} (${hospital.icuBeds} ICU Beds)</strong>
                        </div>
                      ` : ''}
                    </div>

                    <!-- Direct Crew Call Option & ETA (5 Cols) -->
                    <div class="md:col-span-5 flex flex-col justify-center gap-2 text-right font-mono">
                      <div>
                        <span class="text-[10px] text-slate-400 block uppercase">ESTIMATED ARRIVAL</span>
                        <strong class="text-emerald-600 text-lg font-bold">${c.etaMinutes} MIN (${c.distanceKm} km)</strong>
                      </div>

                      <!-- Direct Call Option to the Crew -->
                      <a href="tel:${ambulance?.driverPhone || '+919840122345'}" 
                        class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 font-mono">
                        <span>📞</span>
                        <span>CALL CREW (${ambulance?.driverPhone || '+91 98401 22345'})</span>
                      </a>
                    </div>

                  </div>

                  <!-- Live Updates Timeline -->
                  <div class="space-y-1.5 pt-1">
                    <div class="text-[11px] font-mono font-bold text-slate-400 uppercase">LIVE INCIDENT UPDATES:</div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                      ${c.timeline.slice(-3).map(evt => `
                        <div class="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                          <div class="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                            <span>UPDATE</span>
                            <span>${evt.time}</span>
                          </div>
                          <strong class="text-slate-800 font-sans block text-xs">${evt.label}</strong>
                          ${evt.desc ? `<p class="text-[10.5px] text-slate-500 font-sans truncate">${evt.desc}</p>` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        `}

      </div>
    `;
  }
}

export const Dispatch = new DispatchController();
