import '../maps/location_point.dart';
import '../maps/map_config.dart';
import 'location_service.dart';

class DemoLocationService implements LocationService {
  final _demoPoint = LocationPoint(
    id: 'A-102',
    latitude: MapConfig.ambulanceLocation.latitude,
    longitude: MapConfig.ambulanceLocation.longitude,
    type: LocationType.ambulance,
    label: 'AMBULANCE A-102',
  );

  @override
  Future<LocationPoint> getCurrentLocation() async {
    return _demoPoint;
  }

  @override
  Stream<LocationPoint> getLocationStream() async* {
    yield _demoPoint;
  }
}
