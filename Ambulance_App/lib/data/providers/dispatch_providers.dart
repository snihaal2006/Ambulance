import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/ambulance_model.dart';
import '../models/emergency_case_model.dart';
import '../models/dispatch_assignment.dart';
import '../services/dispatch_service.dart';

final dispatchServiceProvider = Provider<DispatchService>((ref) {
  return DispatchService();
});

// Demo Data for Ambulances
final availableAmbulancesProvider = StateProvider<List<AmbulanceModel>>((ref) {
  return [
    AmbulanceModel(
      id: 'AMB-101',
      plateNumber: 'TN 01 AB 4521',
      driverName: 'Demo Driver 1',
      lat: 13.0450,
      lng: 80.2000,
      status: AmbulanceStatus.available,
    ),
    AmbulanceModel(
      id: 'AMB-102',
      plateNumber: 'TN 01 AB 7812',
      driverName: 'Demo Driver 2',
      lat: 13.0210,
      lng: 80.2200,
      status: AmbulanceStatus.available,
    ),
    AmbulanceModel(
      id: 'AMB-103',
      plateNumber: 'TN 01 AB 3291',
      driverName: 'Demo Driver 3',
      lat: 13.0600,
      lng: 80.2500,
      status: AmbulanceStatus.busy,
    ),
  ];
});

final currentEmergencyProvider = StateProvider<EmergencyCaseModel?>((ref) => null);
final dispatchAssignmentProvider = StateProvider<DispatchAssignment?>((ref) => null);
final assignedAmbulanceProvider = StateProvider<AmbulanceModel?>((ref) => null);
