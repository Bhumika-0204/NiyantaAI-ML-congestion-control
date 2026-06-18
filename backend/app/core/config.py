import os

class Settings:
    PROJECT_NAME: str = "Niyanta AI - Traffic Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default-secret-key")
    
    
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_PATH = os.path.join(BASE_DIR, "ml", "congestion_model.pkl")

settings = Settings()
