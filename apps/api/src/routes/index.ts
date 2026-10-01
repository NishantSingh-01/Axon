import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import documentRoutes from "../modules/document/document.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/document", documentRoutes);

export default router;
