INSERT INTO system_settings (key, numeric_value)
VALUES ('commission_rate', 10.00)
ON CONFLICT (key) DO UPDATE SET numeric_value = EXCLUDED.numeric_value;

INSERT INTO workers (full_name, phone, service_category, status) VALUES
  ('Kasun Perera', '0771234567', 'Electrical', 'active'),
  ('Nimali Fernando', '0712345678', 'Cleaning', 'active'),
  ('Ruwan Silva', '0759876543', 'Plumbing', 'active'),
  ('Tharushi Jayasinghe', '0764567890', 'Laptop Repair', 'active');

INSERT INTO bookings (
  worker_id,
  customer_name,
  service_name,
  booking_amount,
  status,
  completed_at,
  created_at
) VALUES
  (1, 'Customer A', 'Electrical repair', 5000.00, 'completed', NOW() - INTERVAL '20 days', NOW() - INTERVAL '22 days'),
  (2, 'Customer B', 'House cleaning', 3500.00, 'completed', NOW() - INTERVAL '15 days', NOW() - INTERVAL '16 days'),
  (3, 'Customer C', 'Pipe repair', 7500.00, 'completed', NOW() - INTERVAL '9 days', NOW() - INTERVAL '10 days'),
  (4, 'Customer D', 'Laptop repair', 9500.00, 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days'),
  (1, 'Customer E', 'Socket replacement', 3000.00, 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'),
  (2, 'Customer F', 'Office cleaning', 6000.00, 'accepted', NULL, NOW() - INTERVAL '1 day'),
  (3, 'Customer G', 'Water leak inspection', 2500.00, 'pending', NULL, NOW());

INSERT INTO earnings (
  booking_id,
  worker_id,
  gross_amount,
  commission_rate,
  commission_amount,
  worker_earning,
  status,
  created_at
)
SELECT
  b.id,
  b.worker_id,
  b.booking_amount,
  s.numeric_value,
  ROUND(b.booking_amount * s.numeric_value / 100, 2),
  ROUND(b.booking_amount - (b.booking_amount * s.numeric_value / 100), 2),
  CASE WHEN b.id IN (1, 2) THEN 'settled' ELSE 'pending' END,
  COALESCE(b.completed_at, b.created_at)
FROM bookings b
CROSS JOIN system_settings s
WHERE b.status = 'completed'
  AND s.key = 'commission_rate';

INSERT INTO settlements (worker_id, total_amount, status, reference_no, created_at, settled_at)
SELECT worker_id, SUM(worker_earning), 'settled', 'SET-DEMO-001', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days'
FROM earnings
WHERE booking_id IN (1, 2)
GROUP BY worker_id;

INSERT INTO settlement_items (settlement_id, earning_id)
SELECT s.id, e.id
FROM settlements s
JOIN earnings e ON e.worker_id = s.worker_id
WHERE e.booking_id IN (1, 2)
  AND s.reference_no = 'SET-DEMO-001';
