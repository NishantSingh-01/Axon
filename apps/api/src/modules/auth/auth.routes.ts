import { Router } from "express";
import { registerHandler } from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { registerSchema } from "./auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), registerHandler);

export default router;
