import { Router } from "express";
import { addFavorite, listFavorites, removeFavorite } from "../controllers/favoriteController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { favoriteParamSchema } from "../validators/favoriteValidators.js";

export const favoriteRoutes = Router();

favoriteRoutes.use(requireAuth);
favoriteRoutes.get("/", listFavorites);
favoriteRoutes.post("/:propertyId", validate(favoriteParamSchema), addFavorite);
favoriteRoutes.delete("/:propertyId", validate(favoriteParamSchema), removeFavorite);

