import * as dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  port: parseInt(process.env.PG_PORT || "5432"),
});

export async function connectDB() {
  try {
    await pool.query("SELECT NOW()");
    console.log("✓ PostgreSQL connected successfully");
    return pool;
  } catch (error) {
    console.error("✗ Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }
}

export default pool;
