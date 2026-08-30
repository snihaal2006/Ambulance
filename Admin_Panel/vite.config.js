import { defineConfig } from 'vite';

let activeEmergencies = [
  {
    caseId: "EM-6965",
    incidentType: "ROAD_ACCIDENT",
    priority: "CRITICAL",
    callerName: "Senthil Nathan",
    callerPhone: "+91 94441 23456",
    alternatePhone: "+91 98400 55667",
    patientDetails: {
      name: "Ramesh Kumar",
      age: "34 yrs",
      gender: "Male",
      count: 1,
      condition: "Two-wheeler collision, active limb bleed",
      avpu: "Pain (P)",
      breathing: "Labored",
      severeBleeding: "Yes"
    },
    location: {
      address: "NSR Road, Sai Baba Colony, Coimbatore",
      landmark: "Near Avila Convent & Ganga Hospital",
      latitude: 11.0275,
      longitude: 76.9430,
      lat: 11.0275,
      lng: 76.9430,
      accessNotes: "Peak evening traffic on NSR Road"
    },
    assignedAmbulanceId: "AMB-1042",
    assignedDriver: {
      id: "DRV-1042",
      name: "Arun Kumar",
      phone: "+91 98401 22345",
      reg: "TN 38 AB 4521"
    },
    distanceKm: 1.2,
    etaMinutes: 3,
    state: "NAVIGATING_TO_INCIDENT",
    hospitalId: "hosp-ganga",
    hospitalName: "Ganga Hospital & Trauma Centre, Coimbatore",
    createdAt: new Date().toISOString(),
    acceptedAt: new Date().toISOString(),
    responseSeconds: 3
  }
];

let activeIncomingCall = null;

export default defineConfig({
  server: {
    port: 3000,
    host: true,
  },
  plugins: [
    {
      name: 'pulse-router-flutter-api-plugin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const rawUrl = req.originalUrl || req.url || '';

          if (!rawUrl.includes('/api/')) {
            return next();
          }

          // Enable CORS for Flutter mobile/web app and external dispatch clients
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }

          // 1. POST /api/v1/dispatch or /api/v1/dispatch/emergency (Trigger Emergency Call)
          if ((rawUrl.includes('/dispatch') || rawUrl.includes('/emergency')) && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body || '{}');
                const newCaseId = payload.caseId || `EM-${Math.floor(1000 + Math.random() * 9000)}`;

                const lat = payload.location?.lat || payload.location?.latitude || payload.latitude || 11.0275;
                const lng = payload.location?.lng || payload.location?.longitude || payload.longitude || 76.9430;
                const address = payload.location?.address || payload.address || 'NSR Road, Sai Baba Colony, Coimbatore';
                const patientName = payload.patientDetails?.name || payload.patientName || 'Emergency Patient';
                const condition = payload.patientDetails?.condition || payload.condition || 'Severe emergency reported';
                const callerPhone = payload.callerPhone || '+91 9876543210';

                const newEmergency = {
                  caseId: newCaseId,
                  incidentType: payload.category || payload.incidentType || 'TRAUMA',
                  priority: payload.priority || 'CRITICAL',
                  callerName: payload.callerName || 'Emergency Caller',
                  callerPhone: callerPhone,
                  alternatePhone: payload.alternatePhone || '',
                  patientDetails: {
                    name: patientName,
                    age: payload.patientDetails?.age || payload.patientAge || 'Adult',
                    gender: payload.patientDetails?.gender || payload.patientGender || 'Unspecified',
                    count: payload.patientDetails?.count || 1,
                    condition: condition,
                    avpu: payload.patientDetails?.avpu || 'Pain (P)',
                    breathing: payload.patientDetails?.breathing || 'Labored',
                    severeBleeding: payload.patientDetails?.severeBleeding || 'Yes'
                  },
                  location: {
                    address: address,
                    landmark: payload.location?.landmark || payload.landmark || 'Near Avila Convent',
                    latitude: lat,
                    longitude: lng,
                    lat: lat,
                    lng: lng,
                    accessNotes: payload.accessNotes || ''
                  },
                  assignedAmbulanceId: payload.assignedAmbulanceId || 'AMB-1042',
                  assignedDriver: payload.assignedDriver || {
                    id: 'DRV-1042',
                    name: 'Arun Kumar',
                    phone: '+91 98401 22345',
                    reg: 'TN 38 AB 4521'
                  },
                  distanceKm: payload.distanceKm || 1.2,
                  etaMinutes: payload.etaMinutes || 3,
                  state: 'PENDING_DRIVER_ACCEPTANCE',
                  hospitalId: 'hosp-ganga',
                  hospitalName: 'Ganga Hospital & Trauma Centre, Coimbatore',
                  createdAt: new Date().toISOString()
                };

                activeEmergencies.unshift(newEmergency);

                // ACTIVELY INITIATE LIVE EMERGENCY CALL FOR FLUTTER APP
                activeIncomingCall = {
                  callId: `CALL-${Date.now()}`,
                  caseId: newEmergency.caseId,
                  ambulanceId: newEmergency.assignedAmbulanceId,
                  driverId: newEmergency.assignedDriver.id,
                  driverName: newEmergency.assignedDriver.name,
                  driverPhone: newEmergency.assignedDriver.phone,
                  callerPhone: callerPhone,
                  incidentType: newEmergency.incidentType,
                  address: address,
                  location: newEmergency.location,
                  patientDetails: newEmergency.patientDetails,
                  patientCondition: condition,
                  isRinging: true,
                  answered: false,
                  initiatedAt: new Date().toISOString()
                };

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  message: "🚨 Emergency Call Initiated! Flutter app is now ringing.",
                  caseId: newEmergency.caseId,
                  incomingCall: activeIncomingCall,
                  data: newEmergency
                }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: "Invalid JSON payload" }));
              }
            });
            return;
          }

          // 2. GET /api/v1/driver/:driverId/incoming-call (Flutter Driver App Polls this)
          if (rawUrl.includes('/incoming-call') && req.method === 'GET') {
            const parts = rawUrl.split('?')[0].split('/');
            const driverId = parts[parts.indexOf('driver') + 1] || 'AMB-1042';

            const call = activeIncomingCall;
            const hasCall = call && (call.ambulanceId === driverId || call.driverId === driverId || !call.answered);

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              hasIncomingCall: !!hasCall,
              data: hasCall ? call : null
            }));
            return;
          }

          // 3. GET /api/v1/driver/:driverId/assigned-case
          if (rawUrl.includes('/assigned-case') && req.method === 'GET') {
            const parts = rawUrl.split('?')[0].split('/');
            const driverId = parts[parts.indexOf('driver') + 1] || 'AMB-1042';

            const assigned = activeEmergencies.find(c => 
              c.assignedDriver?.id === driverId || 
              c.assignedAmbulanceId === driverId ||
              c.assignedDriver?.phone?.includes(driverId) ||
              c.state === 'PENDING_DRIVER_ACCEPTANCE'
            ) || activeEmergencies[0];

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              message: "Assigned emergency dispatch fetched successfully",
              data: assigned || null,
              hasIncomingCall: !!(activeIncomingCall && !activeIncomingCall.answered)
            }));
            return;
          }

          // 4. POST /api/v1/driver/call/answer or /api/v1/driver/accept (Driver answers call in Flutter)
          if ((rawUrl.includes('/call/answer') || rawUrl.includes('/driver/accept') || rawUrl.includes('/driver/status-update')) && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body || '{}');
                const targetCase = activeEmergencies.find(c => c.caseId === payload.caseId) || activeEmergencies[0];

                if (targetCase) {
                  targetCase.state = payload.status || 'ACCEPTED';
                  targetCase.acceptedAt = new Date().toISOString();
                  targetCase.responseSeconds = payload.responseSeconds || 3;
                  if (payload.driverName) targetCase.assignedDriver.name = payload.driverName;
                  if (payload.ambulanceId) targetCase.assignedAmbulanceId = payload.ambulanceId;
                }

                if (activeIncomingCall) {
                  activeIncomingCall.answered = true;
                  activeIncomingCall.answeredAt = new Date().toISOString();
                }

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  message: "Emergency call answered & dispatch accepted",
                  data: targetCase
                }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: "Invalid payload" }));
              }
            });
            return;
          }

          // 5. GET /api/v1/cases/active or /api/v1/dispatch
          if ((rawUrl.includes('/cases/active') || rawUrl.endsWith('/api/v1/dispatch') || rawUrl.includes('/api/v1/dispatch?')) && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              count: activeEmergencies.length,
              data: activeEmergencies,
              incomingCall: activeIncomingCall
            }));
            return;
          }

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 404;
          res.end(JSON.stringify({ error: "Endpoint not found" }));
        });
      }
    }
  ]
});
