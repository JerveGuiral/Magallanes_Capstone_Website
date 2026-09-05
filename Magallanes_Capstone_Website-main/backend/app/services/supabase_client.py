import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Find and load the .env file (check backend/.env, project root .env, or current directory)
current_dir = Path(__file__).resolve().parent
backend_env_path = current_dir.parent.parent / '.env'
root_env_path = current_dir.parent.parent.parent / '.env'

if backend_env_path.exists():
    load_dotenv(dotenv_path=backend_env_path)
elif root_env_path.exists():
    load_dotenv(dotenv_path=root_env_path)
else:
    load_dotenv()

SUPABASE_URL: str = os.getenv('SUPABASE_URL', '')
SUPABASE_SECRET_KEY: str = os.getenv('SUPABASE_SECRET_KEY', '')

# Initialize Supabase Python Client using SECRET key (server-side only, full access)
supabase: Client = None
if SUPABASE_URL and SUPABASE_SECRET_KEY and 'your-project-id' not in SUPABASE_URL:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)
    except Exception as e:
        print(f"[Supabase Python Warning] Initialization error: {e}")
else:
    print("[Supabase Python Warning] Placeholder or missing SUPABASE_URL / SUPABASE_SECRET_KEY in backend/.env")


def get_supabase_client() -> Client:
    """Returns the initialized Supabase client instance."""
    return supabase
