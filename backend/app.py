from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import sqlite3
import datetime

app = Flask(__name__)
CORS(app)

# Initialize DB
def init_db():
    with sqlite3.connect('db.sqlite3') as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY,
            ip TEXT,
            location TEXT,
            isp TEXT,
            device TEXT,
            timestamp TEXT,
            proxy BOOLEAN,
            vpn BOOLEAN,
            tor BOOLEAN
        )''')
init_db()

@app.route('/track', methods=['POST'])
def track():
    data = request.get_json()
    ip = request.remote_addr or data.get('ip')
    user_agent = data.get('userAgent', 'unknown')

    # Use external IP geolocation API (ipinfo.io or ip-api.com)
    geo_req = requests.get(f"http://ip-api.com/json/{ip}")
    geo_data = geo_req.json()
    location = f"{geo_data.get('city')}, {geo_data.get('country')}"
    isp = geo_data.get('isp')

    timestamp = datetime.datetime.utcnow().isoformat()

    with sqlite3.connect('db.sqlite3') as conn:
        conn.execute("INSERT INTO logs (ip, location, isp, device, timestamp) VALUES (?, ?, ?, ?, ?)",
                     (ip, location, isp, user_agent, timestamp))

    return jsonify({
        "ip": ip,
        "location": location,
        "isp": isp,
        "device": user_agent,
        "timestamp": timestamp
    })

@app.route('/logs', methods=['GET'])
def get_logs():
    with sqlite3.connect('db.sqlite3') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM logs ORDER BY id DESC")
        logs = cursor.fetchall()
    return jsonify(logs)

if __name__ == '__main__':
    app.run(debug=True)
