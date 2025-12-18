import { Router } from "express";
import { supabaseAuthJwtDecode } from "../middleware/supabaseAuth";
import { asyncHandler } from "../utils/asyncHandler";
import { getCurrentUser } from "../controller/adminUserController";

const adminUserRouter = Router();

/**
 * Returns current user. (currently implemented for admin only thats why naming is adminUser)
 * Creates user if not exists.
 */
adminUserRouter.get("/me", supabaseAuthJwtDecode, asyncHandler(getCurrentUser));

export default adminUserRouter;
