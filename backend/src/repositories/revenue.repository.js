import pool, { withTransaction } from '../config/db.js';

export async function fetchOverview() {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM bookings WHERE status = 'completed')
        AS completed_bookings,
      (SELECT COUNT(*)::int FROM earnings) AS earning_records,
      (SELECT COALESCE(SUM(gross_amount), 0) FROM earnings)
        AS total_booking_value,
      (SELECT COALESCE(SUM(commission_amount), 0) FROM earnings)
        AS total_platform_revenue,
      (SELECT COALESCE(SUM(worker_earning), 0) FROM earnings)
        AS total_worker_earnings,
      (
        SELECT COALESCE(SUM(worker_earning), 0)
        FROM earnings
        WHERE status = 'pending'
      ) AS pending_worker_earnings,
      (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM settlements
        WHERE status = 'pending'
      ) AS pending_settlements,
      (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM settlements
        WHERE status = 'settled'
      ) AS settled_amount,
      (
        SELECT numeric_value
        FROM system_settings
        WHERE key = 'commission_rate'
      ) AS commission_rate
  `);

  return result.rows[0];
}

export async function fetchWorkers() {
  const result = await pool.query(`
    SELECT
      w.id,
      w.full_name,
      w.phone,
      w.service_category,
      w.status,
      COALESCE(SUM(e.worker_earning) FILTER (WHERE e.status = 'pending'), 0)
        AS pending_earnings,
      COALESCE(SUM(e.worker_earning) FILTER (WHERE e.status = 'processing'), 0)
        AS processing_earnings,
      COALESCE(SUM(e.worker_earning) FILTER (WHERE e.status = 'settled'), 0)
        AS settled_earnings
    FROM workers w
    LEFT JOIN earnings e ON e.worker_id = w.id
    GROUP BY w.id
    ORDER BY w.full_name
  `);

  return result.rows;
}

export async function fetchCommissionRate() {
  const result = await pool.query(`
    SELECT numeric_value
    FROM system_settings
    WHERE key = 'commission_rate'
  `);

  return Number(result.rows[0]?.numeric_value || 0);
}

export async function saveCommissionRate(rate) {
  const result = await pool.query(
    `
      INSERT INTO system_settings (key, numeric_value, updated_at)
      VALUES ('commission_rate', $1, NOW())
      ON CONFLICT (key)
      DO UPDATE SET
        numeric_value = EXCLUDED.numeric_value,
        updated_at = NOW()
      RETURNING numeric_value AS commission_rate, updated_at
    `,
    [rate]
  );

  return result.rows[0];
}

export async function fetchEarnings({ status, workerId, search }) {
  const filters = [];
  const values = [];

  if (status) {
    values.push(status);
    filters.push(`e.status = $${values.length}`);
  }

  if (workerId) {
    values.push(Number(workerId));
    filters.push(`e.worker_id = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    const parameter = `$${values.length}`;
    filters.push(`(
      w.full_name ILIKE ${parameter}
      OR b.service_name ILIKE ${parameter}
      OR b.customer_name ILIKE ${parameter}
    )`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const result = await pool.query(
    `
      SELECT
        e.id,
        e.booking_id,
        e.worker_id,
        w.full_name AS worker_name,
        b.customer_name,
        b.service_name,
        e.gross_amount,
        e.commission_rate,
        e.commission_amount,
        e.worker_earning,
        e.status,
        e.created_at
      FROM earnings e
      JOIN workers w ON w.id = e.worker_id
      JOIN bookings b ON b.id = e.booking_id
      ${where}
      ORDER BY e.created_at DESC
    `,
    values
  );

  return result.rows;
}

export async function createAllMissingEarnings() {
  const result = await pool.query(`
    WITH current_setting AS (
      SELECT numeric_value AS rate
      FROM system_settings
      WHERE key = 'commission_rate'
    ), inserted AS (
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
        s.rate,
        ROUND(b.booking_amount * s.rate / 100, 2),
        ROUND(b.booking_amount - (b.booking_amount * s.rate / 100), 2),
        'pending',
        COALESCE(b.completed_at, NOW())
      FROM bookings b
      CROSS JOIN current_setting s
      LEFT JOIN earnings e ON e.booking_id = b.id
      WHERE b.status = 'completed'
        AND e.id IS NULL
      RETURNING *
    )
    SELECT COUNT(*)::int AS created_count
    FROM inserted
  `);

  return { createdCount: result.rows[0].created_count };
}

export async function createBookingEarning(bookingId) {
  return withTransaction(async (client) => {
    const bookingResult = await client.query(
      `
        SELECT id, worker_id, booking_amount, status, completed_at
        FROM bookings
        WHERE id = $1
        FOR UPDATE
      `,
      [bookingId]
    );

    const booking = bookingResult.rows[0];

    if (!booking) {
      return { reason: 'booking_not_found' };
    }

    if (booking.status !== 'completed') {
      return { reason: 'booking_not_completed' };
    }

    const existingResult = await client.query(
      'SELECT * FROM earnings WHERE booking_id = $1',
      [bookingId]
    );

    if (existingResult.rows[0]) {
      return { created: false, earning: existingResult.rows[0] };
    }

    const result = await client.query(
      `
        WITH setting AS (
          SELECT numeric_value AS rate
          FROM system_settings
          WHERE key = 'commission_rate'
        )
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
          $1,
          $2,
          $3::numeric,
          setting.rate,
          ROUND($3::numeric * setting.rate / 100, 2),
          ROUND($3::numeric - ($3::numeric * setting.rate / 100), 2),
          'pending',
          COALESCE($4::timestamptz, NOW())
        FROM setting
        RETURNING *
      `,
      [booking.id, booking.worker_id, booking.booking_amount, booking.completed_at]
    );

    return { created: true, earning: result.rows[0] };
  });
}

export async function fetchSettlements({ status, workerId }) {
  const filters = [];
  const values = [];

  if (status) {
    values.push(status);
    filters.push(`s.status = $${values.length}`);
  }

  if (workerId) {
    values.push(Number(workerId));
    filters.push(`s.worker_id = $${values.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const result = await pool.query(
    `
      SELECT
        s.id,
        s.worker_id,
        w.full_name AS worker_name,
        s.total_amount,
        s.status,
        s.reference_no,
        s.created_at,
        s.settled_at,
        COUNT(si.earning_id)::int AS earning_count
      FROM settlements s
      JOIN workers w ON w.id = s.worker_id
      LEFT JOIN settlement_items si ON si.settlement_id = s.id
      ${where}
      GROUP BY s.id, w.full_name
      ORDER BY s.created_at DESC
    `,
    values
  );

  return result.rows;
}

export async function createWorkerSettlement(workerId) {
  return withTransaction(async (client) => {
    const workerResult = await client.query(
      'SELECT id, full_name FROM workers WHERE id = $1 FOR UPDATE',
      [workerId]
    );

    if (!workerResult.rows[0]) {
      return { reason: 'worker_not_found' };
    }

    const earningsResult = await client.query(
      `
        SELECT id, worker_earning
        FROM earnings
        WHERE worker_id = $1
          AND status = 'pending'
        ORDER BY created_at
        FOR UPDATE
      `,
      [workerId]
    );

    if (earningsResult.rows.length === 0) {
      return { reason: 'no_pending_earnings' };
    }

    const earningIds = earningsResult.rows.map((row) => row.id);

    const settlementResult = await client.query(
      `
        INSERT INTO settlements (worker_id, total_amount, status)
        SELECT $1, SUM(worker_earning), 'pending'
        FROM earnings
        WHERE id = ANY($2::bigint[])
        RETURNING *
      `,
      [workerId, earningIds]
    );

    const settlement = settlementResult.rows[0];

    await client.query(
      `
        INSERT INTO settlement_items (settlement_id, earning_id)
        SELECT $1, UNNEST($2::bigint[])
      `,
      [settlement.id, earningIds]
    );

    await client.query(
      `
        UPDATE earnings
        SET status = 'processing', updated_at = NOW()
        WHERE id = ANY($1::bigint[])
      `,
      [earningIds]
    );

    return { settlement };
  });
}

export async function completeWorkerSettlement(settlementId, referenceNo) {
  return withTransaction(async (client) => {
    const settlementResult = await client.query(
      `
        SELECT *
        FROM settlements
        WHERE id = $1
        FOR UPDATE
      `,
      [settlementId]
    );

    const settlement = settlementResult.rows[0];

    if (!settlement) {
      return { reason: 'settlement_not_found' };
    }

    if (settlement.status === 'settled') {
      return { reason: 'already_completed' };
    }

    const updatedResult = await client.query(
      `
        UPDATE settlements
        SET
          status = 'settled',
          reference_no = $2,
          settled_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [settlementId, referenceNo]
    );

    await client.query(
      `
        UPDATE earnings
        SET status = 'settled', updated_at = NOW()
        WHERE id IN (
          SELECT earning_id
          FROM settlement_items
          WHERE settlement_id = $1
        )
      `,
      [settlementId]
    );

    return { settlement: updatedResult.rows[0] };
  });
}

export async function fetchMonthlyReport() {
  const result = await pool.query(`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS month
    )
    SELECT
      TO_CHAR(months.month, 'Mon YYYY') AS month,
      COALESCE(SUM(e.gross_amount), 0) AS booking_value,
      COALESCE(SUM(e.commission_amount), 0) AS platform_revenue,
      COALESCE(SUM(e.worker_earning), 0) AS worker_earnings,
      COUNT(e.id)::int AS completed_jobs
    FROM months
    LEFT JOIN earnings e
      ON date_trunc('month', e.created_at) = months.month
    GROUP BY months.month
    ORDER BY months.month
  `);

  return result.rows;
}
