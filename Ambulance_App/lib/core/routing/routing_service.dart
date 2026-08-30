import '../maps/location_point.dart';
import 'route_result.dart';

abstract class RoutingService {
  Future<RouteResult> getRoute({
    required LocationPoint origin,
    required LocationPoint destination,
  });
}
