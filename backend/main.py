from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import os
import sys

# Ensure backend directory is in path for imports
sys.path.append(os.path.dirname(__file__))
import database as db

from typing import Optional, Dict, Any
from datetime import datetime, timedelta

# Security Configuration
SECRET_KEY = "ngo_rescue_secret_key_change_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FoodRescue NGO Platform")

# Enable CORS for deployment compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, # Set to false when using allow_origins=["*"] for production compatibility
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/admin/login")

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if not os.path.exists(FRONTEND_DIR):
    FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")

@app.on_event("startup")
async def startup_event():
    await db.initialize_database()

# --- Security Logic ---

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_admin(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None or role != "admin":
            raise HTTPException(status_code=401, detail="Unauthorized: Admin access required")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Endpoints ---

@app.get("/api/stats")
async def get_stats():
    return await db.get_stats()

@app.get("/api/debug/admin")
async def debug_admin_status():
    """Temporary debug route to verify admin persistence on Render."""
    admin = await db.get_admin_by_email("admin@foodrescue.com")
    return {
        "admin_exists": admin is not None,
        "admin_email": admin["email"] if admin else None,
        "database_path": db.DB_PATH
    }

@app.post("/api/admin/login")
async def admin_login(payload: Dict[str, str]):
    email = payload.get("email")
    password = payload.get("password")
    
    admin = await db.get_admin_by_email(email)
    
    if not admin or not db.verify_password(password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Standardizing response keys for the frontend
    access_token = create_access_token(data={"sub": admin["email"], "role": admin["role"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": admin["id"],
            "username": admin["username"],
            "name": admin["full_name"],
            "email": admin["email"],
            "role": admin["role"]
        }
    }

@app.get("/api/donations")
async def get_donations(search: str = "", donorType: str = "All"):
    donations = await db.list_donations()
    
    if search:
        search_lower = search.lower()
        donations = [d for d in donations if search_lower in d["business_name"].lower() or search_lower in d["food_type"].lower() or search_lower in d["pickup_address"].lower()]
        
    result = []
    for d in donations:
        result.append({
            "id": d["id"],
            "organizationName": d["business_name"],
            "donorType": "Restaurant",
            "status": d["status"],
            "foodType": d["food_type"],
            "foodDescription": d["food_type"],
            "quantityKg": d["quantity"],
            "servings": "?",
            "area": d["pickup_address"],
            "claimedByOrg": ""
        })
    return result

@app.post("/api/donations")
async def create_donation(payload: Dict[str, Any]):
    try:
        return {"id": await db.create_donation(payload)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/needy-requests")
async def create_needy_request(payload: Dict[str, Any]):
    try:
        return {"id": await db.create_needy_request(payload)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/ngos/{ngoId}/needy-centers")
async def get_needy_centers(ngoId: int):
    requests = await db.list_needy_requests(status="open")
    result = []
    for r in requests:
        result.append({
            "id": r["id"],
            "name": r["center_name"],
            "location": r["address"]
        })
    return result

@app.post("/api/donations/{donationId}/claim")
async def claim_donation(donationId: int, payload: Dict[str, Any]):
    try:
        # payload has ngoId and needyCenterId
        # We need an admin_id for create_assignment, using ngoId as admin_id
        await db.create_assignment(payload["ngoId"], donationId, payload["needyCenterId"])
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Secure Admin API ---

@app.get("/api/admin/donations")
async def list_admin_donations(current_user: str = Depends(get_current_admin)):
    return await db.list_donations(status="pending")

@app.get("/api/admin/requests")
async def list_admin_requests(current_user: str = Depends(get_current_admin)):
    return await db.list_needy_requests(status="open")

@app.get("/api/admin/assignments")
async def list_admin_assignments(current_user: str = Depends(get_current_admin)):
    return await db.list_assignments()

@app.post("/api/admin/assignments")
async def match_donation(payload: Dict[str, Any], current_user: str = Depends(get_current_admin)):
    await db.create_assignment(payload["adminId"], payload["donationId"], payload["requestId"])
    return {"status": "success"}

@app.patch("/api/admin/assignments/{aid}/status")
async def update_delivery_status(aid: int, payload: Dict[str, Any], current_user: str = Depends(get_current_admin)):
    await db.update_assignment_status(aid, payload["status"])
    return {"status": "success"}

# Static Files & SPA Routing
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: HTTPException):
    if not request.url.path.startswith("/api"):
        index_path = os.path.join(FRONTEND_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
    return JSONResponse(status_code=404, content={"detail": "Not Found"})

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)
