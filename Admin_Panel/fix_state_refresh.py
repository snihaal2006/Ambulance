import re

with open("src/state.js", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("window.PulseRouter.dispatchController.render(this);", "window.PulseRouter.navigate(window.PulseRouter.currentSection);")
content = content.replace("window.PulseRouter.mapController.render(this);", "")

with open("src/state.js", "w", encoding="utf-8") as f:
    f.write(content)
