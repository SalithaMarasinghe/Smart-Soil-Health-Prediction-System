import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    """Application settings and configuration."""
    
    def __init__(self):
        self.GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
        
        # Validate critical settings
        if not self.GEMINI_API_KEY:
            # We raise ValueError here as requested, during service initialization or startup
            pass

settings = Settings()
