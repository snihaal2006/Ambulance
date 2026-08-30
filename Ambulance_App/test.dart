import 'dart:convert';
void main() {
  String jsonString = '[{"status": "DISPATCHED"}]';
  final List data = jsonDecode(jsonString);
  print(data[0]['status']);
}
