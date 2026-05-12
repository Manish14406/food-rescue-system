import aiosqlite
import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from passlib.context import CryptContext

DB_PATH = os.path.join(os.path.dirname(__file__), "foodrescue.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def now_iso():
    return datetime.utcnow().isoformat() + "Z"

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

from contextlib import asynccontextmanager

@asynccontextmanager
async def get_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db

async def initialize_database():
    # Since the schema changed significantly, we'll ensure new tables are created.
    # Note: For production, we would use migrations. 
    if not os.path.exists(SCHEMA_PATH): return
    with open(SCHEMA_PATH, "r") as f:
        schema = f.read()
    async with get_db() as db:
        await db.executescript(schema)
        
        # Create a default admin if none exists
        async with db.execute("SELECT COUNT(*) as count FROM ngo_admins") as cursor:
            row = await cursor.fetchone()
            if row["count"] == 0:
                admin_pass = hash_password("admin123")
                await db.execute(
                    "INSERT INTO ngo_admins (username, full_name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    ("admin", "NGO Administrator", "admin@foodrescue.com", admin_pass, "admin", now_iso())
                )
        await db.commit()

# --- Mappers ---

def map_row(row):
    return dict(row) if row else None

# --- Admin Logic ---

async def get_admin_by_email(email: str):
    async with get_db() as db:
        async with db.execute("SELECT * FROM ngo_admins WHERE email = ?", (email,)) as cursor:
            return map_row(await cursor.fetchone())

# --- Donation Logic ---

async def create_donation(payload: Dict[str, Any]):
    now = now_iso()
    sql = """
        INSERT INTO donations (
            donor_name, business_name, contact_number, food_type, quantity, 
            pickup_address, available_until, hygiene_confirmation, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    params = (
        payload["donorName"],
        payload["businessName"],
        payload["contactNumber"],
        payload["foodType"],
        payload["quantity"],
        payload["pickupAddress"],
        payload["availableUntil"],
        1 if payload.get("hygieneConfirmation") else 0,
        now
    )
    async with get_db() as db:
        cursor = await db.execute(sql, params)
        await db.commit()
        return cursor.lastrowid

async def list_donations(status: str = None):
    sql = "SELECT * FROM donations"
    params = []
    if status:
        sql += " WHERE status = ?"
        params.append(status)
    sql += " ORDER BY created_at DESC"
    async with get_db() as db:
        async with db.execute(sql, params) as cursor:
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]

# --- Needy Request Logic ---

async def create_needy_request(payload: Dict[str, Any]):
    now = now_iso()
    sql = """
        INSERT INTO needy_requests (
            center_name, head_person, phone_number, address, people_count, 
            quantity_required, food_preference, urgency_level, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    params = (
        payload["centerName"],
        payload["headPerson"],
        payload["phoneNumber"],
        payload["address"],
        payload["peopleCount"],
        payload["quantityRequired"],
        payload["foodPreference"],
        payload["urgencyLevel"],
        now
    )
    async with get_db() as db:
        cursor = await db.execute(sql, params)
        await db.commit()
        return cursor.lastrowid

async def list_needy_requests(status: str = None):
    sql = "SELECT * FROM needy_requests"
    params = []
    if status:
        sql += " WHERE status = ?"
        params.append(status)
    sql += " ORDER BY created_at DESC"
    async with get_db() as db:
        async with db.execute(sql, params) as cursor:
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]

# --- Assignment Logic ---

async def create_assignment(admin_id: int, donation_id: int, request_id: int):
    now = now_iso()
    async with get_db() as db:
        await db.execute("BEGIN TRANSACTION")
        try:
            # 1. Check if already claimed
            async with db.execute("SELECT status FROM donations WHERE id = ?", (donation_id,)) as c:
                row = await c.fetchone()
                if not row or row["status"] != 'pending':
                    raise Exception("Donation is not available")
            
            # 2. Create assignment
            await db.execute(
                "INSERT INTO delivery_assignments (donation_id, needy_request_id, admin_id, assignment_time) VALUES (?, ?, ?, ?)",
                (donation_id, request_id, admin_id, now)
            )
            
            # 3. Update statuses
            await db.execute("UPDATE donations SET status = 'claimed' WHERE id = ?", (donation_id,))
            await db.execute("UPDATE needy_requests SET status = 'matched' WHERE id = ?", (request_id,))
            
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            raise e

async def update_assignment_status(assignment_id: int, status: str):
    now = now_iso()
    async with get_db() as db:
        await db.execute("BEGIN TRANSACTION")
        try:
            update_sql = "UPDATE delivery_assignments SET status = ?, updated_at = ?" # Oops, schema doesn't have updated_at in assignments, I'll use pickup/delivery time
            
            if status == "picked_up":
                await db.execute("UPDATE delivery_assignments SET status = 'picked_up', pickup_time = ? WHERE id = ?", (now, assignment_id))
                # Update donation as well
                async with db.execute("SELECT donation_id FROM delivery_assignments WHERE id = ?", (assignment_id,)) as c:
                    row = await c.fetchone()
                    await db.execute("UPDATE donations SET status = 'picked_up' WHERE id = ?", (row["donation_id"],))
            
            elif status == "delivered":
                await db.execute("UPDATE delivery_assignments SET status = 'delivered', delivery_time = ? WHERE id = ?", (now, assignment_id))
                async with db.execute("SELECT donation_id, needy_request_id FROM delivery_assignments WHERE id = ?", (assignment_id,)) as c:
                    row = await c.fetchone()
                    await db.execute("UPDATE donations SET status = 'delivered' WHERE id = ?", (row["donation_id"],))
                    await db.execute("UPDATE needy_requests SET status = 'completed' WHERE id = ?", (row["needy_request_id"],))
            
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            raise e

async def list_assignments():
    sql = """
        SELECT a.*, d.business_name, d.food_type, d.pickup_address,
               r.center_name, r.address as delivery_address, r.phone_number as center_phone
        FROM delivery_assignments a
        JOIN donations d ON a.donation_id = d.id
        JOIN needy_requests r ON a.needy_request_id = r.id
        ORDER BY a.assignment_time DESC
    """
    async with get_db() as db:
        async with db.execute(sql) as cursor:
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]

async def get_stats():
    async with get_db() as db:
        stats = {}
        async with db.execute("SELECT COUNT(*) as count FROM donations") as c:
            stats["totalDonations"] = (await c.fetchone())["count"]
        async with db.execute("SELECT COUNT(*) as count FROM needy_requests") as c:
            stats["totalRequests"] = (await c.fetchone())["count"]
        async with db.execute("SELECT COUNT(*) as count FROM delivery_assignments WHERE status = 'delivered'") as c:
            stats["totalDelivered"] = (await c.fetchone())["count"]
        return stats
