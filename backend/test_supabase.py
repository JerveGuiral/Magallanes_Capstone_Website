import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app import create_app
from app.services.supabase_client import supabase

def run_tests():
    print("=== Testing Backend Supabase Setup ===")
    print(f"1. Supabase URL: {supabase.supabase_url}")
    
    print("2. Testing direct query on table 'news_announcements'...")
    res = supabase.table('news_announcements').select('*').execute()
    print(f"   Query succeeded! Returned {len(res.data)} record(s).")
    
    print("3. Testing Flask test client routes...")
    app = create_app()
    client = app.test_client()
    
    endpoints = ['/api/news-announcements', '/news_announcements', '/api/test-supabase']
    for endpoint in endpoints:
        resp = client.get(endpoint)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        json_data = resp.get_json()
        assert json_data['success'] is True, "Expected success: True"
        print(f"   Route {endpoint} returned 200 OK: {json_data['message']}")
        
    print("\nAll Backend tests passed successfully!")

if __name__ == "__main__":
    run_tests()
