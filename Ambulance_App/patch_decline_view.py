import re

with open("lib/viewmodels/app_view_model.dart", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("_activeCase!.status = CaseStatus.declined;", "_activeCase!.status = CaseStatus.declined;\n    _backendApiService?.declineEmergency(_activeCase!.caseId);")

with open("lib/viewmodels/app_view_model.dart", "w", encoding="utf-8") as f:
    f.write(content)
