import 'package:latlong2/latlong.dart';

enum LocationType {
  ambulance,
  patient,
  hospital,
}

class LocationPoint {
  final String id;
  final double latitude;
  final double longitude;
  final LocationType type;
  final String label;

  const LocationPoint({
    required this.id,
    required this.latitude,
    required this.longitude,
    required this.type,
    required this.label,
  });

  LatLng get latLng => LatLng(latitude, longitude);
}
