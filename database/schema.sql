DROP TABLE IF EXISTS settlement_items CASCADE;
DROP TABLE IF EXISTS settlements CASCADE;
DROP TABLE IF EXISTS earnings CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  numeric_value NUMERIC(8, 2) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workers (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  service_category VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  worker_id BIGINT NOT NULL REFERENCES workers(id),
  customer_name VARCHAR(120) NOT NULL,
  service_name VARCHAR(120) NOT NULL,
  booking_amount NUMERIC(12, 2) NOT NULL CHECK (booking_amount >= 0),
  status VARCHAR(30) NOT NULL CHECK (
    status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')
  ),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE earnings (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL UNIQUE REFERENCES bookings(id),
  worker_id BIGINT NOT NULL REFERENCES workers(id),
  gross_amount NUMERIC(12, 2) NOT NULL CHECK (gross_amount >= 0),
  commission_rate NUMERIC(5, 2) NOT NULL CHECK (
    commission_rate >= 0 AND commission_rate <= 100
  ),
  commission_amount NUMERIC(12, 2) NOT NULL CHECK (commission_amount >= 0),
  worker_earning NUMERIC(12, 2) NOT NULL CHECK (worker_earning >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'settled')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE settlements (
  id BIGSERIAL PRIMARY KEY,
  worker_id BIGINT NOT NULL REFERENCES workers(id),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'settled', 'cancelled')
  ),
  reference_no VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);

CREATE TABLE settlement_items (
  settlement_id BIGINT NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
  earning_id BIGINT NOT NULL UNIQUE REFERENCES earnings(id),
  PRIMARY KEY (settlement_id, earning_id)
);

CREATE INDEX idx_bookings_worker_id ON bookings(worker_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_earnings_worker_id ON earnings(worker_id);
CREATE INDEX idx_earnings_status ON earnings(status);
CREATE INDEX idx_settlements_worker_id ON settlements(worker_id);
CREATE INDEX idx_settlements_status ON settlements(status);
