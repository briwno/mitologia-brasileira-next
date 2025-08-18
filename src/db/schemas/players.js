// src/db/schemas/players.js (JavaScript)
import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  name: text('name').notNull(),
  password: text('password'),
  avatarUrl: text('avatar_url'),
  mmr: integer('mmr').notNull().default(1000),
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  banned: boolean('banned').notNull().default(false),
});
