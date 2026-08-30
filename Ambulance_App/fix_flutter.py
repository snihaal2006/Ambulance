import re

with open("lib/data/services/backend_api_service.dart", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the data[0] logic to search through the array for a DISPATCHED case
old_logic = """        if (data.isNotEmpty) {
          final caseData = data[0];
          final state = caseData['status'];
          
          if (state == 'DISPATCHED') {"""

new_logic = """        if (data.isNotEmpty) {
          // Find the first DISPATCHED case
          Map<String, dynamic>? dispatchedCase;
          for (var item in data) {
            if (item['status'] == 'DISPATCHED') {
              dispatchedCase = item;
              break;
            }
          }
          
          if (dispatchedCase != null) {
            final caseData = dispatchedCase;"""

content = content.replace(old_logic, new_logic)

with open("lib/data/services/backend_api_service.dart", "w", encoding="utf-8") as f:
    f.write(content)
