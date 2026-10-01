import { Router } from "express";
import { uploadDocument } from "./document.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import upload from "../../middlewares/multer.middleware";


const router = Router();

router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  uploadDocument
);

export default router