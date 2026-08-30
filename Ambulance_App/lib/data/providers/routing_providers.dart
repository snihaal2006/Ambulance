import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/maps/location_point.dart';
import '../../core/routing/routing_service.dart';
import '../../core/routing/osrm_routing_service.dart';
import '../../core/routing/route_result.dart';
import 'location_providers.dart';
import 'hospital_providers.dart';
import 'navigation_providers.dart';
import '../../core/models/hospital.dart';
import '../../core/routing/navigation_state.dart';

final routingServiceProvider = Provider<RoutingService>((ref) {
  return OsrmRoutingService(Dio());
});

final currentRouteProvider = FutureProvider<RouteResult?>((ref) async {
  final ambulance = ref.watch(ambulanceLocationProvider);
  final destType = ref.watch(navigationDestinationTypeProvider);
  
  if (ambulance == null) return null;
  
  LocationPoint? destPoint;
  
  LocationPoint? originPoint;
  
  if (destType == NavigationDestinationType.incident) {
    originPoint = ambulance;
    destPoint = ref.watch(patientLocationProvider);
  } else {
    originPoint = ref.watch(patientLocationProvider);
    var selectedHospital = ref.watch(selectedHospitalProvider);
    
    // If no hospital is selected, automatically find the nearest one
    if (selectedHospital == null) {
      final hospitalsAsync = ref.watch(nearbyHospitalsProvider);
      if (hospitalsAsync.hasValue && hospitalsAsync.value != null && hospitalsAsync.value!.isNotEmpty) {
        final hospitals = hospitalsAsync.value!;
        // Assuming originPoint is not null for this logic
        if (originPoint != null) {
          Hospital? nearest;
          double minDistance = double.infinity;
          
          for (final h in hospitals) {
            // Simple geographic distance calculation (Haversine approximation)
            // Wait, we can just use Distance() from latlong2, but here we can just use Pythagorean for simplicity or a simple Haversine formula
            // Actually, let's use standard math to get distance squared since it's just for finding min
            final dLat = h.latitude - originPoint.latitude;
            final dLng = h.longitude - originPoint.longitude;
            final distanceSq = dLat * dLat + dLng * dLng;
            if (distanceSq < minDistance) {
              minDistance = distanceSq;
              nearest = h;
            }
          }
          
          selectedHospital = nearest;
          
          // Optionally update the selected hospital provider state asynchronously
          // so the UI also knows which hospital is selected.
          Future.microtask(() {
            ref.read(selectedHospitalProvider.notifier).state = nearest;
          });
        }
      }
    }
    
    if (selectedHospital != null) {
      destPoint = LocationPoint(
        id: selectedHospital.id,
        latitude: selectedHospital.latitude,
        longitude: selectedHospital.longitude,
        type: LocationType.hospital,
        label: selectedHospital.name,
      );
    }
  }
  
  if (destPoint == null || originPoint == null) return null;
  
  final service = ref.read(routingServiceProvider);
  return service.getRoute(
    origin: originPoint,
    destination: destPoint,
  );
});
