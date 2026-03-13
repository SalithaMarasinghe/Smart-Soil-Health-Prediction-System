from pathlib import Path
from dotenv import load_dotenv

# Load environment variables FIRST
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

# Import routers
from routers import dashboard, history, irrigation, npk, analytics

app = FastAPI(title="Smart Soil Health Monitoring System API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(dashboard.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(irrigation.router, prefix="/api")
app.include_router(npk.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.get("/")
async def root():
    return {"message": "Smart Soil Health Monitoring System API is running"}

if __name__ == "__main__":
    import uvicorn
    logger.info("Smart Soil Health Monitoring System API started")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
