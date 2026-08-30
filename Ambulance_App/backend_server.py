from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

active_case = None

HTML_PAGE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PulseRoute - Control Room</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background-color: #1e293b; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); width: 400px; border: 1px solid #334155; }
        h2 { margin-top: 0; color: #38bdf8; font-weight: 800; letter-spacing: 1px; text-align: center; }
        label { display: block; margin-top: 15px; font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase; }
        input { width: 100%; padding: 12px; margin-top: 6px; background: #0f172a; border: 1px solid #334155; color: white; border-radius: 8px; box-sizing: border-box; font-size: 14px; }
        button { margin-top: 30px; width: 100%; padding: 16px; background-color: #e11d48; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 900; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(225, 29, 72, 0.4); }
        button:hover { background-color: #be123c; transform: translateY(-2px); }
        .status { margin-top: 20px; font-size: 14px; text-align: center; color: #10b981; font-weight: bold; }
    </style>
</head>
<body>

    <div class="card">
        <h2>PULSEROUTE DISPATCH</h2>
        
        <label>Patient Name</label>
        <input type="text" id="patientName" value="Sarah Jenkins">

        <label>Medical Condition</label>
        <input type="text" id="condition" value="CARDIAC_EMERGENCY">

        <label>Pickup Latitude</label>
        <input type="text" id="lat" value="13.0827">
        
        <label>Pickup Longitude</label>
        <input type="text" id="lng" value="80.2707">

        <button onclick="dispatchEmergency()">🚨 TRIGGER EMERGENCY CALL</button>
        <div id="statusText" class="status"></div>
    </div>

    <script>
        async function dispatchEmergency() {
            const btn = document.querySelector('button');
            const status = document.getElementById('statusText');
            
            btn.innerText = "DISPATCHING...";
            btn.style.backgroundColor = "#fbbf24";

            const payload = {
                caseId: "EM-" + Math.floor(Math.random() * 10000),
                callerPhone: "+91 9876543210",
                location: {
                    address: "123 Main St, Coimbatore",
                    lat: parseFloat(document.getElementById('lat').value),
                    lng: parseFloat(document.getElementById('lng').value)
                },
                patientDetails: {
                    name: document.getElementById('patientName').value,
                    condition: document.getElementById('condition').value
                }
            };

            try {
                // Pointing to the same server that serves this page
                const response = await fetch('/api/v1/dispatch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    btn.innerText = "🚨 EMERGENCY DISPATCHED!";
                    btn.style.backgroundColor = "#10b981";
                    status.innerText = "Flutter App is now ringing!";
                } else {
                    throw new Error("Server rejected request");
                }
            } catch (error) {
                btn.innerText = "❌ DISPATCH FAILED";
                btn.style.backgroundColor = "#9f1239";
                status.style.color = "#fda4af";
                status.innerText = "Error connecting to backend.";
                console.error(error);
            }

            setTimeout(() => {
                btn.innerText = "🚨 TRIGGER EMERGENCY CALL";
                btn.style.backgroundColor = "#e11d48";
                status.innerText = "";
            }, 3000);
        }
    </script>
</body>
</html>
"""

@app.route('/')
def serve_dashboard():
    return HTML_PAGE

@app.route('/api/v1/dispatch', methods=['POST'])
def dispatch_case():
    global active_case
    data = request.json
    active_case = {
        "state": "PENDING_DRIVER_ACCEPTANCE",
        "caseId": data.get("caseId", "EM-1234"),
        "callerPhone": data.get("callerPhone", "+91 999999999"),
        "location": data.get("location", {"lat": 13.08, "lng": 80.27, "address": "Unknown"}),
        "patientDetails": data.get("patientDetails", {"name": "John Doe", "condition": "Critical"})
    }
    print(f"Dispatched case: {active_case}")
    return jsonify({"success": True, "message": "Dispatched!"})

@app.route('/api/v1/driver/<driver_id>/assigned-case', methods=['GET'])
def get_assigned_case(driver_id):
    if active_case:
        return jsonify({"success": True, "data": active_case})
    return jsonify({"success": False, "message": "No case"})

@app.route('/api/v1/driver/accept', methods=['POST'])
def accept_case():
    global active_case
    active_case = None
    print("Driver accepted the case!")
    return jsonify({"success": True})

if __name__ == '__main__':
    print("Starting Control Room Backend on 0.0.0.0:3000")
    app.run(host='0.0.0.0', port=3000)
