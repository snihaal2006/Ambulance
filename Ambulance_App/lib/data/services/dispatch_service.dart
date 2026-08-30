import 'dart:math' as math;
import '../models/ambulance_model.dart';
import '../models/emergency_case_model.dart';
import '../models/dispatch_assignment.dart';
import 'package:intl/intl.dart';

class DispatchService {
  // Haversine formula to calculate geographic distance between two points in km
  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const R = 6371.0; // Radius of the Earth in km
    final dLat = _deg2rad(lat2 - lat1);
    final dLon = _deg2rad(lon2 - lon1);
    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_deg2rad(lat1)) * math.cos(_deg2rad(lat2)) *
        math.sin(dLon / 2) * math.sin(dLon / 2);
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return R * c;
  }

  double _deg2rad(double deg) {
    return deg * (math.pi / 180);
  }

  EmergencyCaseModel createEmergency({
    required String address,
    required double incidentLat,
    required double incidentLng,
    required String complaint,
    required String callerPhone,
  }) {
    final randomId = 'EM-${100 + math.Random().nextInt(900)}';
    final currentTime = DateFormat('HH:mm:ss').format(DateTime.now());

    return EmergencyCaseModel(
      caseId: randomId,
      callerName: 'Emergency Caller',
      callerPhone: callerPhone,
      address: address,
      incidentLat: incidentLat,
      incidentLng: incidentLng,
      startLat: incidentLat, // Will be updated when ambulance is assigned
      startLng: incidentLng,
      complaint: complaint,
      dispatchedTime: currentTime,
      status: CaseStatus.created,
    );
  }

  AmbulanceModel? findNearestAvailableAmbulance({
    required double incidentLat,
    required double incidentLng,
    required List<AmbulanceModel> ambulances,
  }) {
    AmbulanceModel? nearestAmbulance;
    double minDistance = double.infinity;

    for (var ambulance in ambulances) {
      if (ambulance.status == AmbulanceStatus.available) {
        final distance = _calculateDistance(
          incidentLat,
          incidentLng,
          ambulance.lat,
          ambulance.lng,
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestAmbulance = ambulance;
        }
      }
    }

    return nearestAmbulance;
  }

  double getDistance(AmbulanceModel ambulance, EmergencyCaseModel emergency) {
    return _calculateDistance(
      ambulance.lat,
      ambulance.lng,
      emergency.incidentLat,
      emergency.incidentLng,
    );
  }

  DispatchAssignment assignAmbulance({
    required EmergencyCaseModel emergency,
    required AmbulanceModel ambulance,
  }) {
    final distance = getDistance(ambulance, emergency);
    
    // Update emergency
    emergency.startLat = ambulance.lat;
    emergency.startLng = ambulance.lng;
    emergency.distanceKm = double.parse(distance.toStringAsFixed(1));
    emergency.etaMinutes = (distance / 0.5).ceil(); // Rough estimate: 30km/h = 0.5km/min
    emergency.status = CaseStatus.dispatched;

    // Update ambulance status
    ambulance.status = AmbulanceStatus.assigned;

    final assignmentId = 'DISP-${1000 + math.Random().nextInt(9000)}';
    return DispatchAssignment(
      id: assignmentId,
      emergencyId: emergency.caseId,
      ambulanceId: ambulance.id,
      assignedAt: DateTime.now(),
    );
  }
}
