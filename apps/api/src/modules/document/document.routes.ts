import { Router } from "express";
import { fetchAllDocuments, fetchDocumentById, uploadDocument } from "./document.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import upload from "../../middlewares/multer.middleware";


const router = Router();

router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  uploadDocument
);
router.get("/getAll", authenticate, fetchAllDocuments);
router.get("/:id", authenticate, fetchDocumentById);

export default router;