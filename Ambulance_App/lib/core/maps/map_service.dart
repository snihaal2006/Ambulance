import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import 'map_config.dart';
import 'location_point.dart';
import '../../data/providers/location_providers.dart';
import '../../data/providers/hospital_providers.dart';
import '../../data/providers/routing_providers.dart';
import '../../data/providers/navigation_providers.dart';
import '../../core/routing/navigation_state.dart';
import '../widgets/hospital_detail_sheet.dart';
import '../models/hospital.dart';

class MapService extends ConsumerStatefulWidget {
  final MapController? mapController;

  const MapService({super.key, this.mapController});

  @override
  ConsumerState<MapService> createState() => _MapServiceState();
}

class _MapServiceState extends ConsumerState<MapService> {
  late final MapController _internalController;

  @override
  void initState() {
    super.initState();
    _internalController = widget.mapController ?? MapController();
  }

  void _fitMapToLocations() {
    final ambulance = ref.read(ambulanceLocationProvider);
    final patient = ref.read(patientLocationProvider);
    final hospitalsAsyncValue = ref.read(nearbyHospitalsProvider);
    final routeAsync = ref.read(currentRouteProvider);

    final points = <LatLng>[];
    
    // Add route points if available
    routeAsync.whenData((route) {
      if (route != null && route.routeAvailable && route.polylinePoints.isNotEmpty) {
        points.addAll(route.polylinePoints);
      }
    });

    if (points.isEmpty) {
      final destType = ref.read(navigationDestinationTypeProvider);
      final actualAmbulanceLoc = (destType == NavigationDestinationType.hospital && patient != null)
          ? patient
          : ambulance;

      if (actualAmbulanceLoc != null) points.add(actualAmbulanceLoc.latLng);
      if (patient != null && destType == NavigationDestinationType.incident) points.add(patient.latLng);
      if (destType == NavigationDestinationType.hospital) {
        hospitalsAsyncValue.whenData((hospitals) {
          for (var h in hospitals) {
            points.add(LatLng(h.latitude, h.longitude));
          }
        });
      }
    }

    if (points.isNotEmpty) {
      final bounds = LatLngBounds.fromPoints(points);
      _internalController.fitCamera(
        CameraFit.bounds(
          bounds: bounds,
          padding: const EdgeInsets.all(60.0),
        ),
      );
    }
  }

  void _showMarkerInfo(BuildContext context, LocationPoint point) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        final isAmbulance = point.type == LocationType.ambulance;
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    isAmbulance ? '🚑' : '📍',
                    style: const TextStyle(fontSize: 24),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    point.label,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildInfoRow('Status:', isAmbulance ? 'EN ROUTE' : 'WAITING FOR AMBULANCE'),
              _buildInfoRow('Case:', 'EM-102'),
              _buildInfoRow('Location:', '${point.latitude.toStringAsFixed(5)}, ${point.longitude.toStringAsFixed(5)}'),
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
  }

  void _showHospitalInfo(BuildContext context, Hospital hospital) {
    final ambulance = ref.read(ambulanceLocationProvider);
    double distKm = 0.0;

    if (ambulance != null) {
      final distanceCalculator = const Distance();
      final meters = distanceCalculator.as(
        LengthUnit.Meter,
        ambulance.latLng,
        LatLng(hospital.latitude, hospital.longitude),
      );
      distKm = meters / 1000.0;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => HospitalDetailSheet(
        hospital: hospital,
        distanceKm: distKm,
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.grey,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ambulance = ref.watch(ambulanceLocationProvider);
    final patient = ref.watch(patientLocationProvider);
    final destType = ref.watch(navigationDestinationTypeProvider);
    final hospitalsAsyncValue = ref.watch(nearbyHospitalsProvider);
    final routeAsync = ref.watch(currentRouteProvider);

    final markers = <Marker>[];

    // Hospital Markers (only in hospital navigation mode)
    if (destType == NavigationDestinationType.hospital) {
      hospitalsAsyncValue.whenData((hospitals) {
        for (var hospital in hospitals) {
          markers.add(
            Marker(
              point: LatLng(hospital.latitude, hospital.longitude),
              width: 40,
              height: 40,
              child: GestureDetector(
                onTap: () => _showHospitalInfo(context, hospital),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.red.shade700, width: 2),
                    boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 4)],
                  ),
                  child: const Center(
                    child: Text('🏥', style: TextStyle(fontSize: 18)),
                  ),
                ),
              ),
            ),
          );
        }
      });
    }

    // Determine actual ambulance location based on navigation phase
    final actualAmbulanceLoc = (destType == NavigationDestinationType.hospital && patient != null) 
        ? patient 
        : ambulance;

    if (patient != null && destType == NavigationDestinationType.incident) {
      markers.add(
        Marker(
          point: patient.latLng,
          width: 50,
          height: 50,
          child: GestureDetector(
            onTap: () => _showMarkerInfo(context, patient),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.red.shade600,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
                boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 4)],
              ),
              child: const Center(
                child: Text('📍', style: TextStyle(fontSize: 20)),
              ),
            ),
          ),
        ),
      );
    }

    if (actualAmbulanceLoc != null) {
      markers.add(
        Marker(
          point: actualAmbulanceLoc.latLng,
          width: 50,
          height: 50,
          child: GestureDetector(
            onTap: () => _showMarkerInfo(context, actualAmbulanceLoc),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.blue.shade800, width: 2),
                boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 4)],
              ),
              child: const Center(
                child: Text('🚑', style: TextStyle(fontSize: 24)),
              ),
            ),
          ),
        ),
      );
    }

    // Auto-fit bounds if route updates
    ref.listen(currentRouteProvider, (previous, next) {
      if (next.hasValue && next.value != null && next.value!.routeAvailable) {
        final bounds = LatLngBounds.fromPoints(next.value!.polylinePoints);
        _internalController.fitCamera(
          CameraFit.bounds(
            bounds: bounds,
            padding: const EdgeInsets.all(60.0),
          ),
        );
      }
    });

    return Stack(
      children: [
        FlutterMap(
          mapController: _internalController,
          options: MapOptions(
            initialCenter: MapConfig.defaultCenter,
            initialZoom: MapConfig.defaultZoom,
            minZoom: MapConfig.minZoom,
            maxZoom: MapConfig.maxZoom,
            onMapReady: _fitMapToLocations,
          ),
          children: [
            TileLayer(
              urlTemplate: MapConfig.osmUrlTemplate,
              userAgentPackageName: MapConfig.osmUserAgent,
              errorTileCallback: (tile, error, stackTrace) {
                // Fails silently on network error without crashing
              },
            ),
            
            // Route Polyline
            routeAsync.when(
              data: (route) {
                if (route != null && route.routeAvailable && route.polylinePoints.isNotEmpty) {
                  return PolylineLayer(
                    polylines: [
                      Polyline(
                        points: route.polylinePoints,
                        color: Colors.blue.shade600,
                        strokeWidth: 6.0,
                        strokeCap: StrokeCap.round,
                        strokeJoin: StrokeJoin.round,
                      ),
                      // Inner polyline for styling
                      Polyline(
                        points: route.polylinePoints,
                        color: Colors.lightBlue.shade300,
                        strokeWidth: 3.0,
                        strokeCap: StrokeCap.round,
                        strokeJoin: StrokeJoin.round,
                      ),
                    ],
                  );
                }
                return const SizedBox.shrink();
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            
            MarkerLayer(markers: markers),
            RichAttributionWidget(
              attributions: [
                TextSourceAttribution(
                  MapConfig.attributionText,
                  onTap: () {},
                ),
              ],
            ),
          ],
        ),
        
        // Simple map legend
        Positioned(
          top: 16,
          left: 16,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B).withValues(alpha: 0.9),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('🚑 Ambulance', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                SizedBox(height: 4),
                Text('📍 Patient', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                SizedBox(height: 4),
                Text('🏥 Hospital', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
