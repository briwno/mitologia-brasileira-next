// src/db/schemas/collections.js
import { pgTable, serial, integer, text, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';

// Simple user collection: one row per player with array of card IDs
export const collections = pgTable('collections', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull(),
  cards: jsonb('cards').notNull().default([]), // ['cur001', 'iar001', ...]
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  playerUnique: uniqueIndex('collections_player_unique').on(table.playerId),
}));
