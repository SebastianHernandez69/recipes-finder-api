import express, { Request, Response } from "express";
import { ENV } from "./config/env";
import { db } from "./config/db";
import { favorites } from "./db/schema";
import { eq, and } from "drizzle-orm";
import job from "./config/cron";

const app = express();
const PORT = ENV.PORT;

if(ENV.NODE_ENV === "production") job.start();

app.use(express.json());

app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "API is running" });
});

app.post("/api/favorites", async (req: Request, res: Response) => {
    try {
        const { userId, recipeId, title, image, cookTime, servings } = req.body;

        if( !userId || !recipeId || !title) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newFavorite: any = await db.insert(favorites).values({
            userId,
            recipeId,
            title,
            image: image || null,
            cookTime: cookTime || null,
            servings: servings || null
        }).returning();

        res.status(201).json( newFavorite[0] );

    } catch (error: any) {
        if( error.cause && error.cause.constraint === "user_recipe_unique"){
            return res.status(409).json({ message: "This recipe is already in your favorites" });
        }

        res.status(500).json({ message: "Internal server error" });
    }
});

app.delete("/api/favorites/:userId/:recipeId", async (req: Request, res: Response) => {
    try {
        const { userId, recipeId } = req.params;

        if (!userId || !recipeId) {
            return res.status(400).json({ message: "Missing userId or recipeId" });
        }

        const deletedFavorite = await db.delete(favorites).where(
            and(eq(favorites.userId, userId), eq(favorites.recipeId, +recipeId))
        )

        res.status(200).json({ message: "Favorite removed successfully" });

    } catch (error) {
        console.log("Error removing a favorite: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/api/favorites/:userId", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "Missing userId" });
        }
        
        const userFavorites = await db.select().from(favorites).where(eq(favorites.userId, userId));
        
        res.status(200).json(userFavorites);

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});