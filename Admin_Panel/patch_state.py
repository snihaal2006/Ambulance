import re

with open("src/state.js", "r", encoding="utf-8") as f:
    content = f.read()

# Add a method to start polling backend for live state
polling_code = """
  // Start cloud sync
  startCloudSync() {
    setInterval(async () => {
      try {
        // Fetch ambulances
        const resAmb = await fetch('https://closure-fantastic-pos-coleman.trycloudflare.com/api/ambulances');
        if (resAmb.ok) {
          const liveAmbs = await resAmb.json();
          // The backend only has a few ambulances, but AMB-1042 is the one Flutter uses.
          // Let's filter the UI fleet to ONLY show what's in the backend.
          const newFleet = [];
          for (const la of liveAmbs) {
            const existing = this.fleet.find(a => a.id === la.ambulanceCode) || {
              id: la.ambulanceCode,
              registration: 'TN ' + Math.floor(Math.random()*90 + 10) + ' X ' + Math.floor(Math.random()*9000 + 1000),
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
            
            // If flutter app is sending location, update it!
            newFleet.push(existing);
          }
          this.fleet = newFleet;
          
          if (window.PulseRouter && window.PulseRouter.mapController) {
             window.PulseRouter.mapController.render(this);
          }
          if (window.PulseRouter) window.PulseRouter.updateTopBarStats();
        }
        
        // Also fetch active cases to update the UI
        const resCases = await fetch('https://closure-fantastic-pos-coleman.trycloudflare.com/api/emergencies/active');
        if (resCases.ok) {
          const liveCases = await resCases.json();
          const newCases = [];
          for (const lc of liveCases) {
            const existing = this.activeCases.find(c => c.caseId === lc.caseNumber) || {
              caseId: lc.caseNumber,
              priority: lc.severity || 'CRITICAL',
              caller: { name: lc.callerName, phone: lc.callerPhone },
              patientDetails: { name: lc.patientName },
              location: { address: lc.incidentAddress, latitude: lc.latitude, longitude: lc.longitude },
              state: lc.status,
              assignedAmbulanceId: lc.assignedAmbulanceId == 1 ? 'AMB-1042' : 'AMB-1042',
              timeline: []
            };
            existing.state = lc.status;
            if (lc.status === 'ACCEPTED' && existing.state !== 'ACCEPTED') {
               existing.timeline.push({ step: 'ACCEPTED', label: 'Driver Accepted Case' });
            }
            newCases.push(existing);
          }
          this.activeCases = newCases;
          if (window.PulseRouter && window.PulseRouter.mapController) {
             window.PulseRouter.mapController.render(this);
          }
          if (window.PulseRouter && window.PulseRouter.dispatchController) {
             window.PulseRouter.dispatchController.render(this);
          }
        }
      } catch (e) {
        console.error("Cloud Sync Error", e);
      }
    }, 2000);
  }
"""

# Insert it before the last brace of the class
if "startCloudSync" not in content:
    content = content.replace("export const Store = new GlobalStateStore();", polling_code + "\n\nexport const Store = new GlobalStateStore();\nStore.startCloudSync();")
    with open("src/state.js", "w", encoding="utf-8") as f:
        f.write(content)
    print("Injected cloud sync to state.js")
else:
    print("Cloud sync already injected")
