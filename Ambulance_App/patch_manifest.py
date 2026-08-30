import re

with open("android/app/src/main/AndroidManifest.xml", "r", encoding="utf-8") as f:
    content = f.read()

# Add internet permission if not present
if "<uses-permission android:name=\"android.permission.INTERNET\"" not in content:
    content = content.replace("<application", "<uses-permission android:name=\"android.permission.INTERNET\" />\n    <application")

# Add usesCleartextTraffic if not present
if "android:usesCleartextTraffic=\"true\"" not in content:
    content = content.replace("<application", "<application\n        android:usesCleartextTraffic=\"true\"")

with open("android/app/src/main/AndroidManifest.xml", "w", encoding="utf-8") as f:
    f.write(content)
