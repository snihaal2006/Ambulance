import re

with open("src/intake.js", "r", encoding="utf-8") as f:
    content = f.read()

old_func = """  _startRealtimeDriverSync(caseId) {
    if (this.pollingInterval) clearInterval(this.pollingInterval);

    this.pollingInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/v1/cases/active');
        if (res.ok) {
          const json = await res.json();
          const target = (json.data || []).find(c => c.caseId === caseId);
          const isAnswered = target?.state === 'ACCEPTED' || (json.incomingCall?.caseId === caseId && json.incomingCall?.answered === true);

          if (target && isAnswered) {"""

new_func = """  _startRealtimeDriverSync(caseId) {
    if (this.pollingInterval) clearInterval(this.pollingInterval);

    this.pollingInterval = setInterval(async () => {
      try {
        const res = await fetch('https://closure-fantastic-pos-coleman.trycloudflare.com/api/emergencies/active');
        if (res.ok) {
          const json = await res.json();
          const target = json.find(c => c.caseNumber === caseId);
          const isAnswered = target?.status === 'ACCEPTED';

          if (target && isAnswered) {"""

if old_func in content:
    content = content.replace(old_func, new_func)
    with open("src/intake.js", "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully updated intake.js")
else:
    print("Failed to find old function in intake.js")
