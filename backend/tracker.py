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
                timestamp TEXT,
                proxy BOOLEAN,
                vpn BOOLEAN,
                tor BOOLEAN
            )
        ''')

def get_ip_details(ip):
    try:
        # Call ipapi.co API
        response = requests.get(f'https://ipapi.co/{ip}/json/')
        data = response.json()
        
        return {
            'ip': data.get('ip'),
            'org': data.get('org'),
            'country_name': data.get('country_name'),
            'connection_type': data.get('connection', {}).get('type'),
            'proxy': data.get('proxy', False),
            'vpn': data.get('vpn', False),
            'tor': data.get('tor', False)
        }
    except Exception as e:
        print(f"Error fetching IP details: {e}")
        return {
            'ip': ip,
            'org': 'Unknown',
            'country_name': 'Unknown',
            'connection_type': 'Unknown',
            'proxy': False,
            'vpn': False,
            'tor': False
        }

def track_ip(ip, user_agent):
    try:
        # Get IP details from ipapi.co
        ip_details = get_ip_details(ip)
        
        # Get timestamp
        timestamp = datetime.datetime.utcnow().isoformat()
        
        # Store in database
        with sqlite3.connect(DB_NAME) as conn:
            conn.execute("""
                INSERT INTO logs (ip, location, isp, device, timestamp, proxy, vpn, tor)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                ip_details['ip'],
                ip_details['country_name'],
                ip_details['org'],
                user_agent,
                timestamp,
                ip_details['proxy'],
                ip_details['vpn'],
                ip_details['tor']
            ))
        
        # Return tracking data
        return {
            'ip': ip_details['ip'],
            'location': ip_details['country_name'],
            'isp': ip_details['org'],
            'device': user_agent,
            'timestamp': timestamp,
            'connection_type': ip_details['connection_type'],
            'proxy': ip_details['proxy'],
            'vpn': ip_details['vpn'],
            'tor': ip_details['tor']
        }
    except Exception as e:
        print(f"Error tracking IP: {e}")
        return None

def fetch_logs():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM logs ORDER BY id DESC")
        return cursor.fetchall()
