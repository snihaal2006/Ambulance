import 'package:dio/dio.dart';
import 'package:latlong2/latlong.dart';
import '../maps/location_point.dart';
import 'route_result.dart';
import 'routing_config.dart';
import 'routing_service.dart';

class OsrmRoutingService implements RoutingService {
  final Dio _dio;

  OsrmRoutingService(this._dio);

  @override
  Future<RouteResult> getRoute({
    required LocationPoint origin,
    required LocationPoint destination,
  }) async {
    try {
      final originStr = '${origin.longitude},${origin.latitude}';
      final destStr = '${destination.longitude},${destination.latitude}';
      
      final url = '${RoutingConfig.baseUrl}/${RoutingConfig.profile}/$originStr;$destStr';
      
      final response = await _dio.get(
        url,
        queryParameters: {
          'overview': 'full',
          'geometries': 'geojson',
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['code'] == 'Ok' && data['routes'] != null && data['routes'].isNotEmpty) {
          final route = data['routes'][0];
          
          final distanceMeters = (route['distance'] as num?)?.toDouble() ?? 0.0;
          final durationSeconds = (route['duration'] as num?)?.toDouble() ?? 0.0;
          
          final geometry = route['geometry'];
          final coordinates = geometry['coordinates'] as List;
          
          final polylinePoints = coordinates.map((coord) {
            // geojson format is [longitude, latitude]
            return LatLng((coord[1] as num).toDouble(), (coord[0] as num).toDouble());
          }).toList();
          
          return RouteResult(
            distanceMeters: distanceMeters,
            durationSeconds: durationSeconds,
            polylinePoints: polylinePoints,
            routeAvailable: true,
          );
        } else {
          return const RouteResult(
            routeAvailable: false,
            errorMessage: 'No route found',
          );
        }
      }
      
      return RouteResult(
        routeAvailable: false,
        errorMessage: 'Server returned ${response.statusCode}',
      );
    } catch (e) {
      return RouteResult(
        routeAvailable: false,
        errorMessage: 'Network error or invalid response: ${e.toString()}',
      );
    }
  }
}
