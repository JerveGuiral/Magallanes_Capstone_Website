from flask import Flask
from flask_cors import CORS
from .services.supabase_client import supabase, get_supabase_client


def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.route("/", methods=["GET"])
    def index():
        return {
            "status": "online",
            "message": "Flask Backend API with Supabase is running."
        }

    @app.route("/api/health", methods=["GET"])
    def health():
        return {
            "status": "healthy",
            "service": "Flask Supabase Backend"
        }

    @app.route("/api/news-announcements", methods=["GET"])
    @app.route("/news_announcements", methods=["GET"])
    @app.route("/api/test-supabase", methods=["GET"])
    def get_news_announcements():
        try:
            response = supabase.table("news_announcements").select("*").execute()
            return {
                "success": True,
                "message": "Successfully connected to Supabase and queried news_announcements",
                "count": len(response.data) if response.data else 0,
                "data": response.data
            }, 200
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to query news_announcements from Supabase"
            }, 500

    return app


app = create_app()
