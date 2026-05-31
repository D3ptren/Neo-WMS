# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine, Base
from app.api.endpoints import router as api_router

# Δημιουργία των πινάκων στη βάση δεδομένων
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SmartWMS")

# Ρυθμίσεις CORS για να επιτρέπεται η σύνδεση με τη React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Επιτρέπει όλα τα origins για το development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Σύνδεση των API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def home():
    return {"status": "WMS API is running"}