import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_theme.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/maps/map_service.dart';
import '../core/routing/navigation_state.dart';
import '../data/providers/navigation_providers.dart';
import '../data/providers/hospital_providers.dart';
import '../data/providers/routing_providers.dart';
import '../viewmodels/app_view_model.dart';

class Screen6HospitalNav extends ConsumerStatefulWidget {
  final AppViewModel viewModel;

  const Screen6HospitalNav({super.key, required this.viewModel});

  @override
  ConsumerState<Screen6HospitalNav> createState() => _Screen6HospitalNavState();
}

class _Screen6HospitalNavState extends ConsumerState<Screen6HospitalNav> {
  final MapController _mapController = MapController();

  void _recenterMap() {
    final c = widget.viewModel.activeCase;
    if (c == null) return;

    final selectedHosp = ref.read(selectedHospitalProvider);
    final destLat = selectedHosp?.latitude ?? c.recommendedHospital?.lat;
    final destLng = selectedHosp?.longitude ?? c.recommendedHospital?.lng;

    if (destLat == null || destLng == null) return;

    final start = LatLng(c.incidentLat, c.incidentLng);
    final dest = LatLng(destLat, destLng);

    final bounds = LatLngBounds.fromPoints([start, dest]);
    _mapController.fitCamera(
      CameraFit.bounds(
        bounds: bounds,
        padding: const EdgeInsets.all(50),
      ),
    );
  }

  void _showHospitalDetailsModal(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        final hospitalsAsync = ref.watch(nearbyHospitalsProvider);
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('HOSPITAL OPTIONS', style: AppTheme.plusJakartaStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.deepNavy)),
              const SizedBox(height: 16),
              Expanded(
                child: hospitalsAsync.when(
                  data: (hospitals) {
                    return ListView.separated(
                      itemCount: hospitals.length,
                      separatorBuilder: (context, index) => const Divider(),
                      itemBuilder: (context, index) {
                        final h = hospitals[index];
                        final currentIcu = 2 + (index * 7) % 5; 
                        final predictedIcu = (currentIcu / 2).floor();
                        final eta = 10 + (index * 3);
                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(h.name, style: AppTheme.plusJakartaStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textNavy)),
                          subtitle: Text('Current ICU: $currentIcu\nPredicted at arrival: ~$predictedIcu\nETA: $eta min', style: AppTheme.plusJakartaStyle(fontSize: 12, color: Colors.black87)),
                        );
                      }
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (err, stack) => Text('Error: $err'),
                ),
              ),
            ],
          ),
        );
      }
    );
  }

  @override
  Widget build(BuildContext context) {
    final vm = widget.viewModel;
    final c = vm.activeCase;
    
    // Read route and hospital from Riverpod to allow dynamic updates
    final routeAsync = ref.watch(currentRouteProvider);
    final selectedHospital = ref.watch(selectedHospitalProvider);
    
    // Fallback to active case hospital if none selected yet
    final hospName = selectedHospital?.name ?? c?.recommendedHospital?.name ?? 'Apollo Hospitals, Greams Rd';
    
    String distanceDisplay = '${c?.recommendedHospital?.distanceKm ?? 7.2}';
    String etaDisplay = '${c?.recommendedHospital?.etaMinutes ?? 14}';
    
    if (routeAsync.hasValue && routeAsync.value != null && routeAsync.value!.routeAvailable) {
      final route = routeAsync.value!;
      distanceDisplay = (route.distanceMeters / 1000.0).toStringAsFixed(1);
      etaDisplay = (route.durationSeconds / 60.0).ceil().toString();
    }

    return Container(
      color: AppColors.deepNavy,
      child: SafeArea(
        child: Column(
          children: [
            // Top Navigation Floating HUD Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.deepNavy,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.4),
                    blurRadius: 15,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF064E3B).withValues(alpha: 0.9),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                  color: AppColors.activeGreen.withValues(alpha: 0.5)),
                            ),
                            child: Text(
                              vm.tr('hosp_nav_badge'),
                              style: AppTheme.plusJakartaStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w900,
                                color: AppColors.activeGreen,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            c?.caseId ?? 'ER-2026-69655',
                            style: AppTheme.monoStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textSlate300,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      SizedBox(
                        width: 180,
                        child: Text(
                          hospName,
                          style: AppTheme.plusJakartaStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),

                  // ETA & Distance meters
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        vm.tr('eta_label'),
                        style: AppTheme.plusJakartaStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textSubtle,
                          letterSpacing: 1.0,
                        ),
                      ),
                      Text(
                        '$etaDisplay min',
                        style: AppTheme.monoStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: AppColors.activeGreen,
                        ),
                      ),
                      Text(
                        '$distanceDisplay km ${vm.tr('remaining_text')}',
                        style: AppTheme.plusJakartaStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSlate300,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Dynamic Reroute Alert Banner (Slides down when ICU full)
            if (vm.showRerouteBanner)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF78350F),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.amberWarning, width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.amberWarning.withValues(alpha: 0.3),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: AppColors.amberWarning.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                            color: AppColors.amberWarning.withValues(alpha: 0.5)),
                      ),
                      child: const Icon(
                        Icons.warning_amber_rounded,
                        color: AppColors.amberWarning,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            vm.tr('dest_updated_title'),
                            style: AppTheme.plusJakartaStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFFFDE68A),
                            ),
                          ),
                          Text(
                            vm.currentLanguage == 'ta'
                                ? 'ICU பெட் இல்லை. மாற்றப்பட்ட ஆஸ்பத்திரி: $hospName ($distanceDisplay கி.மீ)'
                                : 'ICU unavailable. Rerouted to: $hospName ($distanceDisplay km)',
                            style: AppTheme.plusJakartaStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                            maxLines: 2,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: vm.acknowledgeReroute,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.amberWarning,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          vm.tr('ack_btn'),
                          style: AppTheme.plusJakartaStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF0F172A),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            // Live Interactive Map View
            Expanded(
              child: Stack(
                children: [
                  MapService(mapController: _mapController),

                  // Navigation Header Overlay
                  Consumer(
                    builder: (context, ref, child) {
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        if (ref.read(navigationDestinationTypeProvider) != NavigationDestinationType.hospital) {
                          ref.read(navigationDestinationTypeProvider.notifier).state = NavigationDestinationType.hospital;
                        }
                      });
                      
                      return const SizedBox.shrink(); // The bottom sheet already shows routing info
                    },
                  ),

                  // Floating Map Action Buttons
                  Positioned(
                    right: 14,
                    bottom: 150,
                    child: Column(
                      children: [
                        _buildFloatingMapButton(
                          icon: Icons.volume_up_rounded,
                          onTap: () {},
                        ),
                        const SizedBox(height: 8),
                        // Simulate Dynamic ICU Full Reroute
                        _buildFloatingMapButton(
                          icon: Icons.alt_route_rounded,
                          iconColor: AppColors.amberWarning,
                          onTap: () => vm.triggerDynamicReroute(),
                        ),
                        const SizedBox(height: 8),
                        _buildFloatingMapButton(
                          icon: Icons.my_location_rounded,
                          onTap: _recenterMap,
                        ),
                        const SizedBox(height: 8),
                        _buildFloatingMapButton(
                          icon: Icons.fast_forward_rounded,
                          iconColor: AppColors.activeGreen,
                          onTap: vm.simulateHospitalNavProgress,
                        ),
                      ],
                    ),
                  ),
                  // Patient Transport Popup Overlay (Bottom Docked Sheet)
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                        child: Container(
                          padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 24),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.90), // High opacity, docked
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                            border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.6))),
                            boxShadow: const [
                              BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -4)),
                            ],
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                                // Title Row
                                Row(
                                  children: [
                                    const Icon(Icons.local_hospital_rounded, color: AppColors.trustBlue, size: 18),
                                    const SizedBox(width: 4),
                                    Expanded(
                                      child: Text(
                                        hospName,
                                        style: AppTheme.plusJakartaStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.textNavy),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    GestureDetector(
                                      onTap: () {
                                        if (c?.recommendedHospital?.phone != null) {
                                          vm.makePhoneCall(c!.recommendedHospital!.phone);
                                        }
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: AppColors.activeGreen.withValues(alpha: 0.15),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(Icons.phone, size: 18, color: AppColors.activeGreen),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                              
                              // Key Info Row (ETA, Dist, ICU)
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'ETA $etaDisplay min • $distanceDisplay km',
                                    style: AppTheme.plusJakartaStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.activeGreen),
                                  ),
                                  Text(
                                    'ICU: ${c?.recommendedHospital?.icuBeds ?? 5} ➔ ~${c?.recommendedHospital?.predictedIcuBeds ?? 2}',
                                    style: AppTheme.plusJakartaStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.indigo),
                                  ),
                                ],
                              ),
                              
                              const SizedBox(height: 14),

                              // Buttons
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton(
                                      onPressed: () => _showHospitalDetailsModal(context, ref),
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: AppColors.trustBlue,
                                        side: const BorderSide(color: AppColors.trustBlue),
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      child: const Text('DETAILS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: vm.markArrivedAtHospital,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.activeGreen,
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      child: const Text('ARRIVED', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 0.5)),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFloatingMapButton({
    required IconData icon,
    Color iconColor = const Color(0xFF334155),
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(icon, color: iconColor, size: 20),
      ),
    );
  }



}
