import { asyncHandler } from "../../utils/asyncHandler.util";
import { ApiError } from "../../utils/error.util";
import { createDocument, deleteDocument, getAllDocuments, getDocumentById, getStatus, updateDocument } from "./document.service";
import { ApiResponse } from "../../utils/response.util";
import logger from "../../config/logger";
import { processDocumentQueue, type ProcessDocumentJobData } from '@axon/queue'

export const uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        logger.warn("Document upload rejected: No file provided");
        throw new ApiError(400, "Document file is required");
    }
    const userId = req.user?.id
    if (!userId) {
        logger.warn("Document upload rejected: Unauthorized user");
        throw new ApiError(401, "Unauthorized");
    }
    const document = await createDocument(req.body.title, req.file, userId)

    logger.info({ documentId: document.id, userId, title: document.title }, "Document queued for processing");

    const job = await processDocumentQueue.add(
        'ingest-document',
        {
            documentId: document.id,
            userId: userId
        }
    )
    return res.status(202).json(
        new ApiResponse(202, { document, jobId: job.id }, "Document queued for processing")
    )
})

export const fetchAllDocuments = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    if (!userId) {
        logger.warn("Fetch all documents rejected: Unauthorized user");
        throw new ApiError(401, "Unauthorized");
    }
    const documents = await getAllDocuments(userId)

    logger.info({ userId, count: documents.length }, "Fetched all documents for user");

    return res.status(200).json(
        new ApiResponse(200, { documents }, "Documents fetched successfully")
    )
})

export const fetchDocumentById = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    if (!userId) {
        logger.warn("Fetch document by ID rejected: Unauthorized user");
        throw new ApiError(401, "Unauthorized");
    }

    const id = req.params?.id;
    if (!id || Array.isArray(id)) {
        logger.warn({ id }, "Fetch document rejected: Invalid Document ID");
        throw new ApiError(400, "Invalid Document ID");
    }

    const document = await getDocumentById(id, userId);

    logger.info({ documentId: id, userId }, "Document fetched successfully");

    return res.status(200).json(
        new ApiResponse(200, { document }, "Document fetched successfully")
    )
})
export const deleteDocumentById = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    if (!userId) {
        logger.warn("Delete document rejected: Unauthorized user");
        throw new ApiError(401, "Unauthorized");
    }

    const id = req.params?.id;
    if (!id || Array.isArray(id)) {
        logger.warn({ id }, "Delete document rejected: Invalid Document ID");
        throw new ApiError(400, "Invalid Document ID");
    }

    const document = await deleteDocument(id, userId)

    logger.info({ documentId: id, userId }, "Document deleted successfully");

    return res.status(200).json(
        new ApiResponse(200, { document }, "Document deleted successfully")
    )
})
export const updateDocumentById = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    if (!userId) {
        logger.warn("Update document rejected: Unauthorized user");
        throw new ApiError(401, "Unauthorized");
    }

    const id = req.params?.id;
    if (!id || Array.isArray(id)) {
        logger.warn({ id }, "Update document rejected: Invalid Document ID");
        throw new ApiError(400, "Invalid Document ID");
    }

    const document = await updateDocument(id, userId, req.body.title)

    logger.info({ documentId: id, userId }, "Document updated successfully");

    return res.status(200).json(
        new ApiResponse(200, { document }, "Document updated successfully")
    )
})
export const getDocumentStatus = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    if (!userId) {
        logger.warn("Get document status rejected: Unauthorized user");
        throw new ApiError(401, "Unauthorized");
    }

    const id = req.params?.id;
    if (!id || Array.isArray(id)) {
        logger.warn({ id }, "Get document status rejected: Invalid Document ID");
        throw new ApiError(400, "Invalid Document ID");
    }

    const document = await getStatus(id, userId);

    logger.info({ documentId: id, userId, status: document.status }, "Document status fetched successfully");

    return res.status(200).json(
        new ApiResponse(200, { document }, "Document status fetched successfully")
    )
})