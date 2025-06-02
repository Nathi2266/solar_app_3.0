from flask import Flask
from flask_cors import CORS
from auth import auth_bp, init_db as init_auth_db
from tracker import tracker_bp

app = Flask(__name__)
CORS(app)

# Initialize the database
init_auth_db()

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(tracker_bp)

if __name__ == '__main__':
    app.run(debug=True)
