import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/routing/navigation_state.dart';
import 'hospital_providers.dart';
import 'routing_providers.dart';

final navigationStateProvider = StateProvider<NavigationState>((ref) {
  return NavigationState.idle;
});

final navigationDestinationTypeProvider = StateProvider<NavigationDestinationType>((ref) {
  return NavigationDestinationType.incident;
});

// A convenient provider to safely read both route and nav state in one go
final activeNavigationProvider = Provider((ref) {
  final state = ref.watch(navigationStateProvider);
  final routeAsync = ref.watch(currentRouteProvider);
  final hospital = ref.watch(selectedHospitalProvider);
  
  return (state, routeAsync, hospital);
});
