PRAGMA foreign_keys = ON;

-- 1. NGO Admins (Owners of the platform)
CREATE TABLE IF NOT EXISTS ngo_admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- 2. Donations (Submitted by Restaurants/Events)
CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donor_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  food_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  available_until TEXT NOT NULL,
  hygiene_confirmation INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'picked_up', 'delivered')),
  created_at TEXT NOT NULL
);

-- 3. Needy Requests (Submitted by Orphanages/Shelters)
CREATE TABLE IF NOT EXISTS needy_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  center_name TEXT NOT NULL,
  head_person TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  people_count INTEGER NOT NULL,
  quantity_required TEXT NOT NULL,
  food_preference TEXT NOT NULL,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'completed')),
  created_at TEXT NOT NULL
);

-- 4. Delivery Assignments (The match between donation and request)
CREATE TABLE IF NOT EXISTS delivery_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_id INTEGER NOT NULL UNIQUE,
  needy_request_id INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'picked_up', 'delivered')),
  assignment_time TEXT NOT NULL,
  pickup_time TEXT,
  delivery_time TEXT,
  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
  FOREIGN KEY (needy_request_id) REFERENCES needy_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES ngo_admins(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_requests_status ON needy_requests(status);
CREATE INDEX IF NOT EXISTS idx_admins_email ON ngo_admins(email);
