import re

with open("src/app.js", "r", encoding="utf-8") as f:
    content = f.read()

# Add hospital sync to startCloudSync loop
old_sync = """        const resCases = await fetch('https://closure-fantastic-pos-coleman.trycloudflare.com/api/emergencies/active');"""

new_sync = """        // Fetch Hospitals
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
             if (container) window.PulseRouter.Views.renderHospitals(container);
          }
        }
        
        const resCases = await fetch('https://closure-fantastic-pos-coleman.trycloudflare.com/api/emergencies/active');"""

content = content.replace(old_sync, new_sync)

# Also fix the `simulateHospitalSaturation` method in app.js
old_sim = """  simulateHospitalSaturation(hospitalId) {
    Store.triggerHospitalCapacityChange(hospitalId, 0, 'DIVERT');"""

new_sim = """  simulateHospitalSaturation(hospitalId) {
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
    }"""

content = content.replace(old_sim, new_sim)

with open("src/app.js", "w", encoding="utf-8") as f:
    f.write(content)
