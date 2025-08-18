// src/db/schemas/decks.js (JavaScript)
import { pgTable, serial, integer, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const decks = pgTable('decks', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id').notNull(),
  name: text('name').notNull(),
  cards: jsonb('cards').notNull().default([]), // array de IDs das cartas
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
