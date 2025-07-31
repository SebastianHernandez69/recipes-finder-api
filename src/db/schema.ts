import { pgTable, serial, text, timestamp, integer, unique } from "drizzle-orm/pg-core";

export const favorites = pgTable("favorites", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    recipeId: integer("recipe_id").notNull(),
    title: text("title").notNull(),
    image: text("image"),
    cookTime: text("cook_time"),
    servings: text("servings"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table => ({
    userRecipeUnique: unique("user_recipe_unique").on(table.userId, table.recipeId),
})));