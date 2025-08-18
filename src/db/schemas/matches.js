// src/db/schemas/matches.js (JavaScript)
import { pgTable, serial, integer, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  roomId: text('room_id').notNull().unique(),
  playerAId: integer('player_a_id').notNull(),
  playerBId: integer('player_b_id').notNull(),
  winnerId: integer('winner_id'),
  status: text('status').notNull().default('active'), // active | finished | canceled
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  snapshot: jsonb('snapshot'), // opcional: estado final
});
