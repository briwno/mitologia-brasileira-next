// src/db/client.js (JavaScript)
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';

export const db = drizzle(sql);
