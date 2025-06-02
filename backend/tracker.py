from flask import Blueprint, request, jsonify
import sqlite3
import datetime
import requests

# Create a Blueprint instead of a Flask app
tracker_bp = Blueprint('tracker', __name__)

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
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude'),
            'asn': data.get('asn'),
            'org': data.get('org'),
            'carrier': data.get('carrier'),
            'connection_type': data.get('connection', {}).get('type'),
            'country_name': data.get('country_name'),
            'city': data.get('city'),
            'region': data.get('region')
        }
    except Exception as e:
        print(f"Error fetching IP details: {e}")
        return {
            'ip': ip,
            'latitude': None,
            'longitude': None,
            'asn': None,
            'org': None,
            'carrier': None,
            'connection_type': None,
            'country_name': 'Unknown',
            'city': 'Unknown',
            'region': 'Unknown'
        }

@tracker_bp.route('/track', methods=['GET'])
def track_current_ip():
    try:
        ip = request.remote_addr
        user_agent = request.headers.get('User-Agent', 'Unknown')
        return track_ip(ip, user_agent)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tracker_bp.route('/track/<ip>', methods=['GET'])
def track_custom_ip(ip):
    try:
        user_agent = request.headers.get('User-Agent', 'Unknown')
        return track_ip(ip, user_agent)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tracker_bp.route('/logs', methods=['GET'])
def get_logs():
    try:
        with sqlite3.connect('db.sqlite3') as conn:
            cursor = conn.execute('SELECT * FROM logs ORDER BY timestamp DESC')
            logs = cursor.fetchall()
            return jsonify([{
                'ip': log[1],
                'location': log[2],
                'isp': log[3],
                'device': log[4],
                'timestamp': log[5],
                'latitude': log[6],
                'longitude': log[7],
                'asn': log[8],
                'carrier': log[9],
                'connection_type': log[10]
            } for log in logs])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def track_ip(ip, user_agent):
    try:
        # Get IP details from ipapi.co
        ip_details = get_ip_details(ip)
        
        # Get timestamp
        timestamp = datetime.datetime.utcnow().isoformat()
        
        # Store in database
        with sqlite3.connect(DB_NAME) as conn:
            conn.execute("""
                INSERT INTO logs (
                    ip, location, isp, device, timestamp, 
                    latitude, longitude, asn, carrier, connection_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                ip_details['ip'],
                f"{ip_details['city']}, {ip_details['country_name']}",
                ip_details['org'],
                user_agent,
                timestamp,
                ip_details['latitude'],
                ip_details['longitude'],
                ip_details['asn'],
                ip_details['carrier'],
                ip_details['connection_type']
            ))
        
        # Return tracking data
        return jsonify({
            'ip': ip_details['ip'],
            'location': f"{ip_details['city']}, {ip_details['country_name']}",
            'isp': ip_details['org'],
            'device': user_agent,
            'timestamp': timestamp,
            'latitude': ip_details['latitude'],
            'longitude': ip_details['longitude'],
            'asn': ip_details['asn'],
            'carrier': ip_details['carrier'],
            'connection_type': ip_details['connection_type']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def fetch_logs():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM logs ORDER BY id DESC")
        return cursor.fetchall()
