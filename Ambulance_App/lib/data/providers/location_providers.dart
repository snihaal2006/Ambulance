import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/maps/location_point.dart';
import '../../core/maps/map_config.dart';
import '../../core/services/location_service.dart';
import '../../core/services/demo_location_service.dart';
import 'dispatch_providers.dart';

final locationServiceProvider = Provider<LocationService>((ref) {
  return DemoLocationService();
});

final ambulanceLocationStreamProvider = StreamProvider<LocationPoint>((ref) {
  return ref.watch(locationServiceProvider).getLocationStream();
});

final ambulanceLocationProvider = Provider<LocationPoint?>((ref) {
  return ref.watch(ambulanceLocationStreamProvider).valueOrNull;
});

final patientLocationProvider = Provider<LocationPoint?>((ref) {
  final emergency = ref.watch(currentEmergencyProvider);
  if (emergency != null) {
    return LocationPoint(
      id: emergency.caseId,
      latitude: emergency.incidentLat,
      longitude: emergency.incidentLng,
      type: LocationType.patient,
      label: 'INCIDENT ${emergency.caseId}',
    );
  }
  
  // Fallback for tests if no emergency dispatched
  return LocationPoint(
    id: 'DEMO-PATIENT',
    latitude: MapConfig.patientLocation.latitude,
    longitude: MapConfig.patientLocation.longitude,
    type: LocationType.patient,
    label: 'PATIENT',
  );
});
