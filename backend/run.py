import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    print(f"[Flask Backend] Starting server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
