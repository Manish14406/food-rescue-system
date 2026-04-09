PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_name TEXT NOT NULL,
  donor_type TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  food_type TEXT NOT NULL,
  food_description TEXT NOT NULL,
  quantity_kg INTEGER NOT NULL,
  servings INTEGER NOT NULL,
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  pickup_time TEXT NOT NULL,
  best_before TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'delivered')),
  claimed_by_org TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_id INTEGER NOT NULL UNIQUE,
  tracking_code TEXT NOT NULL UNIQUE,
  stage TEXT NOT NULL DEFAULT 'pending' CHECK (stage IN ('pending', 'picked_up', 'in_transit', 'delivered')),
  recipient_org TEXT NOT NULL,
  recipient_location TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 45,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_type ON donations(donor_type);
CREATE INDEX IF NOT EXISTS idx_deliveries_stage ON deliveries(stage);
