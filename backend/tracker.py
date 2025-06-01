import sqlite3
import datetime
import requests

DB_NAME = 'db.sqlite3'

def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip TEXT,
                location TEXT,
                isp TEXT,
                device TEXT,
                timestamp TEXT
            )
        ''')

def log_ip_data(ip, user_agent):
    try:
        res = requests.get(f"http://ip-api.com/json/{ip}")
        data = res.json()
        location = f"{data.get('city')}, {data.get('country')}"
        isp = data.get('isp')
    except Exception:
        location = "Unknown"
        isp = "Unknown"

    timestamp = datetime.datetime.utcnow().isoformat()

    with sqlite3.connect(DB_NAME) as conn:
        conn.execute('''
            INSERT INTO logs (ip, location, isp, device, timestamp)
            VALUES (?, ?, ?, ?, ?)
        ''', (ip, location, isp, user_agent, timestamp))

    return {
        "ip": ip,
        "location": location,
        "isp": isp,
        "device": user_agent,
        "timestamp": timestamp
    }

def fetch_logs():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM logs ORDER BY id DESC")
        return cursor.fetchall()
