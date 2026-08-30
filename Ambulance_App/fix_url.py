with open("lib/core/config/app_config.dart", "w", encoding="utf-8", newline='\n') as f:
    f.write("class AppConfig {\n")
    f.write("  static const String apiBaseUrl = 'https://closure-fantastic-pos-coleman.trycloudflare.com/api';\n")
    f.write("}\n")
