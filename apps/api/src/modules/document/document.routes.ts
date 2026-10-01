import { Router } from "express";
import { deleteDocumentById, fetchAllDocuments, fetchDocumentById, getDocumentStatus, updateDocumentById, uploadDocument } from "./document.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import upload from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { updateDocumentSchema } from "./document.schema";


const router = Router();

router.post("/upload", authenticate, upload.single("file"), uploadDocument)
router.get("/getAll", authenticate, fetchAllDocuments)
router.get("/:id", authenticate, fetchDocumentById)
router.delete("/:id", authenticate, deleteDocumentById)
router.put("/:id", authenticate,validate(updateDocumentSchema), updateDocumentById)
router.get("/status/:id", authenticate, getDocumentStatus)
export default router