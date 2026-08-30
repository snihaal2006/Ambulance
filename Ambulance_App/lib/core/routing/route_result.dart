import 'package:latlong2/latlong.dart';

class RouteResult {
  final double distanceMeters;
  final double durationSeconds;
  final List<LatLng> polylinePoints;
  final bool routeAvailable;
  final String? errorMessage;

  const RouteResult({
    this.distanceMeters = 0.0,
    this.durationSeconds = 0.0,
    this.polylinePoints = const [],
    this.routeAvailable = false,
    this.errorMessage,
  });
}
