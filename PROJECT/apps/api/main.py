"""
FastAPI Server Entry Point
"""
import os
import uvicorn
from dotenv import load_dotenv, find_dotenv

# Load environment variables from .env file using python-dotenv
load_dotenv(find_dotenv(usecwd=True), override=True)

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    uvicorn.run("app.main:app", host=host, port=port, reload=reload)
