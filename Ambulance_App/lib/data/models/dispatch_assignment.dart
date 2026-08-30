class DispatchAssignment {
  final String id;
  final String emergencyId;
  final String ambulanceId;
  final DateTime assignedAt;
  String status;

  DispatchAssignment({
    required this.id,
    required this.emergencyId,
    required this.ambulanceId,
    required this.assignedAt,
    this.status = 'ASSIGNED',
  });
}
