import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:url_launcher/url_launcher.dart';
import '../models/hospital.dart';
import '../../data/providers/hospital_providers.dart';

class HospitalDetailSheet extends ConsumerWidget {
  final Hospital hospital;
  final double distanceKm;

  const HospitalDetailSheet({
    super.key,
    required this.hospital,
    required this.distanceKm,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hasContact = hospital.contactNumber != null && hospital.contactNumber!.isNotEmpty;
    final String specialties = hospital.specialties?.join(', ') ?? 'Not available';
    
    String getAvailabilityText(bool? available) {
      if (available == null) return 'Not available';
      return available ? 'Yes' : 'No';
    }

    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('🏥', style: TextStyle(fontSize: 28)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  hospital.name,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildDetailRow('Address', hospital.address ?? 'Not available'),
          _buildDetailRow('Approx. distance', '${distanceKm.toStringAsFixed(1)} km'),
          _buildDetailRow('Specialties', specialties),
          _buildDetailRow('Emergency availability', getAvailabilityText(hospital.emergencyAvailable)),
          _buildDetailRow('ICU availability', getAvailabilityText(hospital.icuAvailable)),
          _buildDetailRow('Contact number', hospital.contactNumber ?? 'Not available'),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: hasContact
                      ? () => _makeCall(hospital.contactNumber!)
                      : null,
                  icon: const Icon(Icons.call, color: Colors.white),
                  label: Text(
                    hasContact ? 'CALL' : 'Contact unavailable',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green.shade700,
                    disabledBackgroundColor: Colors.grey.shade800,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    ref.read(selectedHospitalProvider.notifier).state = hospital;
                    Navigator.of(context).pop();
                  },
                  icon: const Icon(Icons.check_circle_outline, color: Colors.white),
                  label: const Text(
                    'SELECT HOSPITAL',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue.shade700,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 150,
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.grey,
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _makeCall(String phoneNumber) async {
    final cleanNumber = phoneNumber.replaceAll(RegExp(r'[^\d+]'), '');
    final url = Uri.parse('tel:$cleanNumber');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }
}
