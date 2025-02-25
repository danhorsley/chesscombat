import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Just store high scores for now
export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  score: integer("score").notNull(),
  combo: integer("combo").notNull(),
});

export const insertScoreSchema = createInsertSchema(scores).pick({
  playerName: true,
  score: true,
  combo: true,
});

export type InsertScore = z.infer<typeof insertScoreSchema>;
export type Score = typeof scores.$inferSelect;
