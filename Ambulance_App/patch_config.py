import re

with open("lib/data/services/backend_api_service.dart", "r", encoding="utf-8") as f:
    content = f.read()

# Add import if not present
if "app_config.dart" not in content:
    content = content.replace("import '../models/emergency_case_model.dart';", "import '../models/emergency_case_model.dart';\nimport '../../core/config/app_config.dart';")

# Replace baseUrl
pattern = r"final String baseUrl = 'http://[^']+';"
content = re.sub(pattern, "final String baseUrl = AppConfig.apiBaseUrl;", content)

with open("lib/data/services/backend_api_service.dart", "w", encoding="utf-8") as f:
    f.write(content)
