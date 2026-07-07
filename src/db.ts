import { neon } from "@neondatabase/serverless";

// ⚠️ SECURITY: This connection string is exposed in the client bundle.
// For production, proxy DB access through a serverless function.
const DATABASE_URL =
  "postgresql://neondb_owner:npg_mcWpK4nx7bqD@ep-divine-voice-ainbgau3.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

export type DbUser = {
  id: number;
  name: string;
  phone: string;
  telegram_id: string | null;
  telegram_username: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  created_at: string;
  last_login_at: string;
};

let schemaReady: Promise<void> | null = null;

/** Create tables if they don't exist. Retries on next call if it failed. */
function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;
  const p = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        telegram_id TEXT,
        telegram_username TEXT,
        location_lat DOUBLE PRECISION,
        location_lng DOUBLE PRECISION,
        location_address TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS location_address TEXT`;
    // Best-effort orders table for future logging
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGSERIAL PRIMARY KEY,
        invoice TEXT NOT NULL,
        user_phone TEXT NOT NULL,
        user_name TEXT NOT NULL,
        method TEXT NOT NULL,
        total INTEGER NOT NULL,
        items JSONB NOT NULL,
        note TEXT,
        delivery_lat DOUBLE PRECISION,
        delivery_lng DOUBLE PRECISION,
        distance_m DOUBLE PRECISION,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    // Add columns if the table already exists from a previous version.
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lat DOUBLE PRECISION`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lng DOUBLE PRECISION`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS distance_m DOUBLE PRECISION`;
    // Products managed from the admin page.
    // NOTE: a `products` table with an incompatible shape already exists in
    // this database, so we use our own dedicated table name.
    await sql`
      CREATE TABLE IF NOT EXISTS nt26_products (
        id TEXT PRIMARY KEY,
        name_kh TEXT NOT NULL,
        category_id TEXT NOT NULL,
        price INTEGER NOT NULL,
        image TEXT NOT NULL,
        tag TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  })();
  // Cache only on success — if it fails, the next call retries instead of
  // returning the same rejected promise forever.
  schemaReady = p;
  p.catch(() => {
    if (schemaReady === p) schemaReady = null;
  });
  return p;
}

/**
 * Insert or update a user by phone. Returns the persisted row.
 */
export async function upsertUser(input: {
  name: string;
  phone: string;
  telegramId?: string | null;
  telegramUsername?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  locationAddress?: string | null;
}): Promise<DbUser> {
  await ensureSchema();
  const rows = (await sql`
    INSERT INTO users (name, phone, telegram_id, telegram_username, location_lat, location_lng, location_address, last_login_at)
    VALUES (
      ${input.name},
      ${input.phone},
      ${input.telegramId ?? null},
      ${input.telegramUsername ?? null},
      ${input.locationLat ?? null},
      ${input.locationLng ?? null},
      ${input.locationAddress ?? null},
      NOW()
    )
    ON CONFLICT (phone) DO UPDATE
      SET name = EXCLUDED.name,
          telegram_id = COALESCE(EXCLUDED.telegram_id, users.telegram_id),
          telegram_username = COALESCE(EXCLUDED.telegram_username, users.telegram_username),
          location_lat = COALESCE(EXCLUDED.location_lat, users.location_lat),
          location_lng = COALESCE(EXCLUDED.location_lng, users.location_lng),
          location_address = COALESCE(EXCLUDED.location_address, users.location_address),
          last_login_at = NOW()
    RETURNING *
  `) as unknown as DbUser[];
  return rows[0];
}

export type DbProduct = {
  id: string;
  name_kh: string;
  category_id: string;
  price: number;
  image: string;
  tag: string | null;
  created_at: string;
};

/** Fetch all admin-uploaded products. */
export async function fetchProducts(): Promise<DbProduct[]> {
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM nt26_products ORDER BY created_at DESC
  `) as unknown as DbProduct[];
  return rows;
}

/** Add a product (admin). Retries once — Neon free tier cold-starts after idle. */
export async function addProduct(p: {
  id: string;
  nameKh: string;
  categoryId: string;
  price: number;
  image: string;
  tag?: string | null;
}): Promise<void> {
  const attempt = async () => {
    await ensureSchema();
    await sql`
      INSERT INTO nt26_products (id, name_kh, category_id, price, image, tag)
      VALUES (${p.id}, ${p.nameKh}, ${p.categoryId}, ${p.price}, ${p.image}, ${p.tag ?? null})
    `;
  };
  try {
    await attempt();
  } catch (e) {
    console.warn("addProduct first attempt failed, retrying...", e);
    // Wait for the DB to wake up, then retry once.
    await new Promise((r) => setTimeout(r, 2500));
    await attempt();
  }
}

/** Update a product (admin). */
export async function updateProduct(p: {
  id: string;
  nameKh: string;
  categoryId: string;
  price: number;
  image: string;
  tag?: string | null;
}): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE nt26_products
    SET name_kh = ${p.nameKh},
        category_id = ${p.categoryId},
        price = ${p.price},
        image = ${p.image},
        tag = ${p.tag ?? null}
    WHERE id = ${p.id}
  `;
}

/** Delete a product (admin). */
export async function deleteProduct(id: string): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM nt26_products WHERE id = ${id}`;
}

/** Save an order snapshot (best-effort — errors are swallowed). */
export async function saveOrder(order: {
  invoice: string;
  userPhone: string;
  userName: string;
  method: string;
  total: number;
  items: unknown;
  note?: string;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  distanceM?: number | null;
}): Promise<void> {
  try {
    await ensureSchema();
    await sql`
      INSERT INTO orders (invoice, user_phone, user_name, method, total, items, note, delivery_lat, delivery_lng, distance_m)
      VALUES (
        ${order.invoice},
        ${order.userPhone},
        ${order.userName},
        ${order.method},
        ${order.total},
        ${JSON.stringify(order.items)}::jsonb,
        ${order.note ?? null},
        ${order.deliveryLat ?? null},
        ${order.deliveryLng ?? null},
        ${order.distanceM ?? null}
      )
    `;
  } catch (e) {
    console.error("saveOrder failed", e);
  }
}
