import '../maps/location_point.dart';

abstract class LocationService {
  Future<LocationPoint> getCurrentLocation();
  Stream<LocationPoint> getLocationStream();
}
