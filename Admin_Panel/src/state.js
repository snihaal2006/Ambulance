/**
 * PULSE ROUTER — Central Reactive State Store & Auto-Dispatch Engine
 */

import {
  CHENNAI_HOSPITALS,
  AMBULANCE_FLEET,
  INITIAL_ACTIVE_CASES,
  INITIAL_HISTORY_CASES,
  IOT_DEVICES_ROSTER,
  SYSTEM_SERVICES_REGISTRY
} from './data.js';

import { AudioEngine } from './audio.js';

class PulseRouterStore {
  constructor() {
    this.hospitals = JSON.parse(JSON.stringify(CHENNAI_HOSPITALS));
    this.fleet = JSON.parse(JSON.stringify(AMBULANCE_FLEET));
    this.activeCases = JSON.parse(JSON.stringify(INITIAL_ACTIVE_CASES));
    this.historyCases = JSON.parse(JSON.stringify(INITIAL_HISTORY_CASES));
    this.iotDevices = JSON.parse(JSON.stringify(IOT_DEVICES_ROSTER));
    this.services = JSON.parse(JSON.stringify(SYSTEM_SERVICES_REGISTRY));

    this.selectedCaseId = this.activeCases[0]?.caseId || null;
    this.currentSection = 'overview';
    this.incomingCall = null;
    this.listeners = [];
    this.notifications = [
      { id: 1, title: 'Dispatched AMB-1042', message: 'Assigned to Multi-Vehicle Collision at Guindy', time: '15:10', caseId: 'ER-2026-69655', read: false },
      { id: 2, title: 'Driver Accepted', message: 'Arun Kumar accepted emergency within 3s', time: '15:08', caseId: 'ER-2026-69655', read: false }
    ];

    this._setupCrossAppSync();
  }

  // Cross-App Sync Bridge
  _setupCrossAppSync() {
    try {
      this.channel = new BroadcastChannel('pulse_router_emergency_channel');
      this.channel.onmessage = (evt) => {
        const { type, data } = evt.data || {};
        if (type === 'DRIVER_ACCEPTED_DISPATCH') {
          this.handleDriverAcceptance(data.caseId, data.ambulanceId, data.driverName);
        } else if (type === 'DRIVER_ARRIVED_INCIDENT') {
          this.handleAmbulanceArrivalAtIncident(data.caseId);
        } else if (type === 'IOT_INCIDENT_TELEMETRY') {
          this.handleIoTTelemetryReceived(data.caseId, data.telemetry);
        } else if (type === 'CASE_COMPLETED_BY_DRIVER') {
          this.completeCase(data.caseId);
        }
      };
    } catch (e) {}

    window.addEventListener('storage', (e) => {
      if (e.key === 'pulse_router_driver_event' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload.type === 'DRIVER_ACCEPTED_DISPATCH') {
            this.handleDriverAcceptance(payload.caseId, payload.ambulanceId, payload.driverName);
          }
        } catch (err) {}
      }
    });
  }

  _broadcast(type, data) {
    if (this.channel) {
      try { this.channel.postMessage({ type, data, timestamp: Date.now() }); } catch (e) {}
    }
    try {
      localStorage.setItem('pulse_router_admin_event', JSON.stringify({ type, data, timestamp: Date.now() }));
    } catch (e) {}
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify(eventKey, payload = null) {
    this.listeners.forEach(fn => fn(eventKey, payload));
  }

  getCaseById(caseId) {
    return this.activeCases.find(c => c.caseId === caseId) || null;
  }

  getAmbulanceById(id) {
    return this.fleet.find(a => a.id === id) || null;
  }

  getHospitalById(id) {
    return this.hospitals.find(h => h.id === id) || null;
  }

  getActiveEmergenciesCount() {
    return this.activeCases.length;
  }

  getAvailableAmbulancesCount() {
    return this.fleet.filter(a => a.status === 'AVAILABLE' && a.dutyStatus === 'ON_DUTY').length;
  }

  getRespondingAmbulancesCount() {
    return this.fleet.filter(a => a.status === 'NAVIGATING' || a.status === 'DISPATCHING' || a.status === 'NAVIGATING_TO_HOSPITAL').length;
  }

  getAvailableHospitalsCount() {
    return this.hospitals.filter(h => h.erStatus === 'OPEN' && h.icuBeds > 0).length;
  }

  // Incoming Call Handler
  triggerIncomingCall(presetData = null) {
    this.incomingCall = {
      callerPhone: presetData?.callerPhone || '+91 94440 11223',
      callerName: presetData?.callerName || 'Senthil Nathan',
      callTime: new Date().toTimeString().split(' ')[0],
      presetData: presetData
    };
    AudioEngine.playIncomingCallRing();
    this.notify('incoming_call', this.incomingCall);
  }

  dismissIncomingCall() {
    this.incomingCall = null;
    this.notify('incoming_call_dismissed');
  }

  // Create & Allot Case From Intake
  createCaseFromIntake(intakeData) {
    const caseId = `ER-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowTime = new Date().toTimeString().split(' ')[0];

    const newCase = {
      caseId: caseId,
      incidentType: intakeData.category || 'ROAD_ACCIDENT',
      priority: intakeData.priority || 'CRITICAL',
      title: `${(intakeData.category || 'EMERGENCY').replace('_', ' ')} Incident`,
      caller: {
        name: intakeData.callerName || 'Emergency Caller',
        phone: intakeData.callerPhone || '+91 94440 11223',
        alternatePhone: intakeData.alternatePhone || '',
        callerType: intakeData.callerType || 'Bystander',
        callTime: nowTime,
        callDuration: intakeData.callDuration || '01:15'
      },
      patientDetails: {
        name: intakeData.patientName || 'Unknown Patient',
        age: intakeData.patientAge || 'Adult',
        gender: intakeData.patientGender || 'Male',
        count: intakeData.patientCount || 1,
        avpu: intakeData.avpu || 'Pain (P)',
        condition: intakeData.condition || 'Severe trauma reported',
        breathing: intakeData.breathing || 'Labored',
        severeBleeding: intakeData.severeBleeding || 'Yes'
      },
      location: {
        address: intakeData.address || 'GST Road, Guindy Junction, Chennai',
        landmark: intakeData.landmark || '',
        accessNotes: intakeData.accessNotes || '',
        latitude: intakeData.latitude || 13.0067,
        longitude: intakeData.longitude || 80.2084
      },
      assignedAmbulanceId: intakeData.assignedAmbulanceId || 'AMB-1042',
      assignedDriver: intakeData.assignedDriver || {
        id: 'DRV-1042',
        name: 'Arun Kumar',
        phone: '+91 98401 22345',
        reg: 'TN 01 AB 4521'
      },
      assignedHospitalId: 'HOSP-01',
      primaryHospitalId: 'HOSP-01',
      hospitalChanged: false,
      hospitalRerouteReason: null,
      distanceKm: intakeData.distanceKm || 1.8,
      etaMinutes: intakeData.etaMinutes || 4,
      state: 'NAVIGATING_TO_INCIDENT',
      countdownSeconds: 10,
      createdAt: nowTime,
      timeline: [
        { label: 'EMERGENCY CALL RECEIVED', time: nowTime, desc: `Inbound emergency call logged from ${intakeData.callerPhone}` },
        { label: 'LOCATION & TRIAGE CONFIRMED', time: nowTime, desc: `${intakeData.address} | Condition: ${intakeData.condition}` },
        { label: 'CASE REGISTERED', time: nowTime, desc: `Case ${caseId} created and classified as ${intakeData.category}` },
        { label: 'AMBULANCE AUTO-ALLOTTED', time: nowTime, desc: `Closest unit ${intakeData.assignedAmbulanceId || 'AMB-1042'} dispatched with ETA ${intakeData.etaMinutes || 4} min` }
      ],
      dispatchAttempts: [
        {
          attempt: 1,
          ambulanceId: intakeData.assignedAmbulanceId || 'AMB-1042',
          driverName: intakeData.assignedDriver?.name || 'Arun Kumar',
          status: 'ACCEPTED',
          responseSeconds: 2,
          timestamp: nowTime
        }
      ]
    };

    this.activeCases.unshift(newCase);
    this.selectedCaseId = caseId;

    AudioEngine.playDispatchAlarm();

    this._broadcast('NEW_EMERGENCY_DISPATCH', {
      caseId: caseId,
      assignedAmbulanceId: newCase.assignedAmbulanceId,
      assignedDriver: newCase.assignedDriver,
      location: newCase.location,
      patientDetails: newCase.patientDetails,
      caller: newCase.caller,
      etaMinutes: newCase.etaMinutes,
      distanceKm: newCase.distanceKm
    });

    this.notify('case_created', newCase);
    return newCase;
  }

  startAutoDispatch(caseId) {
    const activeCase = this.getCaseById(caseId);
    if (!activeCase) return;

    const available = this.fleet.filter(a => a.status === 'AVAILABLE' && a.dutyStatus === 'ON_DUTY');
    if (available.length > 0) {
      const nearest = available[0];
      nearest.status = 'DISPATCHING';
      nearest.activeCaseId = caseId;
      activeCase.assignedAmbulanceId = nearest.id;
      activeCase.assignedDriver = {
        id: nearest.driverId,
        name: nearest.driverName,
        phone: nearest.driverPhone,
        reg: nearest.registration
      };
      this.notify('auto_dispatch_assigned', activeCase);
      return nearest;
    }
  }

  handleDriverAcceptance(caseId, ambulanceId, driverName) {
    const activeCase = this.getCaseById(caseId);
    if (activeCase) {
      activeCase.state = 'NAVIGATING_TO_INCIDENT';
      const nowTime = new Date().toTimeString().split(' ')[0];
      activeCase.timeline.push({
        label: 'DRIVER ACCEPTED DISPATCH',
        time: nowTime,
        desc: `${driverName || 'Driver'} accepted response navigation.`
      });
      this.notify('driver_accepted', activeCase);
    }
  }

  completeCase(caseId) {
    const idx = this.activeCases.findIndex(c => c.caseId === caseId);
    if (idx !== -1) {
      const c = this.activeCases.splice(idx, 1)[0];
      const amb = this.getAmbulanceById(c.assignedAmbulanceId);
      if (amb) {
        amb.status = 'AVAILABLE';
        amb.activeCaseId = null;
      }
      this.historyCases.unshift({
        caseId: c.caseId,
        date: new Date().toISOString().split('T')[0],
        time: c.createdAt,
        incidentType: c.incidentType,
        title: c.title,
        priority: c.priority,
        location: c.location.address,
        ambulance: c.assignedAmbulanceId,
        driver: c.assignedDriver?.name || 'Paramedic',
        hospital: 'Apollo Hospitals',
        totalResponseTime: `${c.etaMinutes + 6}m 20s`,
        totalDistance: `${c.distanceKm} km`,
        status: 'RESOLVED'
      });
      this.notify('case_completed', c);
    }
  }

  _calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }
}

export const Store = new PulseRouterStore();
