import re

with open("src/app.js", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("window.PulseRouter.Views.renderHospitals(container);", "Views.renderHospitals(container);")

with open("src/app.js", "w", encoding="utf-8") as f:
    f.write(content)
