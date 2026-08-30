import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_theme.dart';
import '../data/providers/dispatch_providers.dart';
import '../data/models/emergency_case_model.dart';
import '../data/models/ambulance_model.dart';
import '../viewmodels/app_view_model.dart';

class Screen0ControlRoom extends ConsumerStatefulWidget {
  final AppViewModel viewModel;

  const Screen0ControlRoom({super.key, required this.viewModel});

  @override
  ConsumerState<Screen0ControlRoom> createState() => _Screen0ControlRoomState();
}

class _Screen0ControlRoomState extends ConsumerState<Screen0ControlRoom> {
  final _addressController = TextEditingController(text: 'Saibaba Colony, Coimbatore');
  final _phoneController = TextEditingController(text: '+91 98765 43210');
  final _typeController = TextEditingController(text: 'CARDIAC');
  final _patientCountController = TextEditingController(text: '1');
  
  bool _isLoading = false;
  bool _noAmbulanceFound = false;

  @override
  void dispose() {
    _addressController.dispose();
    _phoneController.dispose();
    _typeController.dispose();
    _patientCountController.dispose();
    super.dispose();
  }

  void _createIncident() async {
    setState(() {
      _isLoading = true;
      _noAmbulanceFound = false;
    });

    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    final dispatchService = ref.read(dispatchServiceProvider);
    
    // Create emergency
    final emergency = dispatchService.createEmergency(
      address: _addressController.text,
      incidentLat: 11.0287, // Mock Coimbatore coords for testing
      incidentLng: 76.9388,
      complaint: _typeController.text,
      callerPhone: _phoneController.text,
    );

    // Find nearest ambulance
    final ambulances = ref.read(availableAmbulancesProvider);
    final nearestAmbulance = dispatchService.findNearestAvailableAmbulance(
      incidentLat: emergency.incidentLat,
      incidentLng: emergency.incidentLng,
      ambulances: ambulances,
    );

    if (nearestAmbulance == null) {
      setState(() {
        _isLoading = false;
        _noAmbulanceFound = true;
      });
      return;
    }

    // Automatically assign
    final assignment = dispatchService.assignAmbulance(
      emergency: emergency,
      ambulance: nearestAmbulance,
    );

    // Update state
    ref.read(currentEmergencyProvider.notifier).state = emergency;
    ref.read(assignedAmbulanceProvider.notifier).state = nearestAmbulance;
    ref.read(dispatchAssignmentProvider.notifier).state = assignment;

    setState(() {
      _isLoading = false;
    });
  }

  void _sendDispatch() {
    final emergency = ref.read(currentEmergencyProvider);
    if (emergency != null) {
      widget.viewModel.setActiveCaseFromDispatch(emergency);
    }
  }

  @override
  Widget build(BuildContext context) {
    final emergency = ref.watch(currentEmergencyProvider);
    final assignedAmbulance = ref.watch(assignedAmbulanceProvider);

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.security, color: Colors.white, size: 28),
            const SizedBox(width: 12),
            const Text('CONTROL ROOM DASHBOARD', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: Colors.white, letterSpacing: 1.5)),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(color: AppColors.activeGreen.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20)),
              child: const Row(
                children: [
                  Icon(Icons.circle, color: AppColors.activeGreen, size: 10),
                  SizedBox(width: 8),
                  Text('SYSTEM ONLINE', style: TextStyle(color: AppColors.activeGreen, fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.deepNavy,
        elevation: 0,
        toolbarHeight: 70,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: Colors.white12, height: 1),
        ),
      ),
      body: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left Form Panel
          Expanded(
            flex: 2,
            child: Container(
              decoration: const BoxDecoration(
                border: Border(right: BorderSide(color: Colors.white12, width: 1)),
              ),
              child: _isLoading
                  ? _buildLoadingState()
                  : (emergency != null && assignedAmbulance != null && emergency.status == CaseStatus.dispatched)
                      ? _buildDispatchReady(emergency, assignedAmbulance)
                      : _buildCreateIncidentForm(),
            ),
          ),
          
          // Right Active Incidents Panel
          Expanded(
            flex: 3,
            child: Container(
              color: AppColors.deepNavy.withValues(alpha: 0.3),
              child: emergency != null 
                  ? _buildActiveIncidents(emergency, assignedAmbulance)
                  : const Center(child: Text('No active incidents.', style: TextStyle(color: Colors.white54))),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: AppColors.activeGreen),
          const SizedBox(height: 24),
          Text(
            'AUTOMATIC DISPATCH',
            style: AppTheme.monoStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.textSlate300,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Finding nearest available ambulance...',
            style: AppTheme.plusJakartaStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCreateIncidentForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('CREATE INCIDENT', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Enter emergency details to automatically dispatch the nearest unit.', style: TextStyle(color: Colors.white54, fontSize: 14)),
          const SizedBox(height: 32),
          _buildTextField('Incident Location', _addressController),
          const SizedBox(height: 24),
          _buildTextField('Caller Phone Number', _phoneController),
          const SizedBox(height: 24),
          _buildTextField('Emergency Type', _typeController),
          const SizedBox(height: 24),
          _buildTextField('Patient Count', _patientCountController),
          const SizedBox(height: 48),
          if (_noAmbulanceFound)
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 24),
              decoration: BoxDecoration(
                color: Colors.red.shade900.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('NO AVAILABLE AMBULANCE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text('All ambulances are currently unavailable.', style: TextStyle(color: Colors.white70)),
                ],
              ),
            ),
          ElevatedButton(
            onPressed: _createIncident,
            style: ElevatedButton.styleFrom(
              backgroundColor: _noAmbulanceFound ? Colors.red.shade700 : AppColors.trustBlue,
              minimumSize: const Size(double.infinity, 60),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text(_noAmbulanceFound ? 'RETRY' : 'CREATE INCIDENT', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSlate300, fontSize: 12)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            filled: true,
            fillColor: AppColors.deepNavy,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide.none,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDispatchReady(EmergencyCaseModel emergency, AmbulanceModel ambulance) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Center(
            child: Text('DISPATCH READY', style: TextStyle(color: AppColors.activeGreen, fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
          ),
          const SizedBox(height: 32),
          Text(emergency.caseId, style: AppTheme.monoStyle(fontSize: 32, color: Colors.white, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Row(
            children: [
              Text(emergency.complaint, style: const TextStyle(color: Colors.white70, fontSize: 18)),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6)),
                child: const Text('CRITICAL', style: TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              const Icon(Icons.location_on, color: AppColors.textSlate300),
              const SizedBox(width: 8),
              Text(emergency.address, style: const TextStyle(color: Colors.white, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 32),
          const Divider(color: Colors.white24),
          const SizedBox(height: 32),
          const Text('ASSIGNED AMBULANCE', style: TextStyle(color: AppColors.textSlate300, fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.deepNavy,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.activeGreen.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Text('🚑', style: TextStyle(fontSize: 32)),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(ambulance.id, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text('${emergency.distanceKm} km from incident', style: const TextStyle(color: Colors.white70, fontSize: 14)),
                  ],
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: AppColors.activeGreen.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6)),
                  child: const Text('● AVAILABLE', style: TextStyle(color: AppColors.activeGreen, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          const Spacer(),
          ElevatedButton(
            onPressed: _sendDispatch,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.activeGreen,
              minimumSize: const Size(double.infinity, 60),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('⚡ SEND DISPATCH', style: TextStyle(color: AppColors.deepNavy, fontWeight: FontWeight.bold, fontSize: 18, letterSpacing: 1.5)),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildActiveIncidents(EmergencyCaseModel emergency, AmbulanceModel? ambulance) {
    String statusText = 'CREATED';
    Color statusColor = Colors.grey;

    if (emergency.status == CaseStatus.dispatched) {
      statusText = 'DISPATCHED';
      statusColor = Colors.orange;
    } else if (emergency.status == CaseStatus.declined) {
      statusText = 'DECLINED';
      statusColor = Colors.red;
    } else if (emergency.status == CaseStatus.navigatingToIncident || emergency.status == CaseStatus.arrivedAtIncident || emergency.status == CaseStatus.navigatingToHospital) {
      statusText = 'ACCEPTED';
      statusColor = AppColors.activeGreen;
    }

    return Container(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('ACTIVE INCIDENTS', style: TextStyle(color: AppColors.textSlate300, fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.deepNavy,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white12),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.warning_rounded, color: Colors.red),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(emergency.caseId, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      Text('${emergency.complaint} • CRITICAL', style: const TextStyle(color: Colors.white70, fontSize: 14)),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 14, color: Colors.white54),
                          const SizedBox(width: 4),
                          Text(emergency.address, style: const TextStyle(color: Colors.white54, fontSize: 14)),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (ambulance != null) 
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(20)),
                        child: Text('🚑 ${ambulance.id}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6)),
                      child: Text(statusText, style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
