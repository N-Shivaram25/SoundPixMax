import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  googleId: text("google_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text").notNull(),
  language: text("language").notNull(),
  mode: text("mode").notNull(), // 'image', 'saga', 'video'
  createdAt: timestamp("created_at").defaultNow(),
});

export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id").notNull(),
  folderId: integer("folder_id"),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const generatedVideos = pgTable("generated_videos", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
  createdAt: true,
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
});

export const insertImageSchema = createInsertSchema(generatedImages).omit({
  id: true,
  createdAt: true,
});

export const insertVideoSchema = createInsertSchema(generatedVideos).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Folder = typeof folders.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type GeneratedVideo = typeof generatedVideos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
