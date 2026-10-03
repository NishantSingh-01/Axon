import { asyncHandler } from "../../utils/asyncHandler.util";
import { ApiError } from "../../utils/error.util";
import { createDocument, deleteDocument, getAllDocuments, getDocumentById, getStatus, updateDocument } from "./document.service";
import { ApiResponse } from "../../utils/response.util";




export const uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Document file is required");
    }
    const userId = req.user?.id
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    const document = await createDocument(req.body.title, req.file, userId)

    return res.status(201).json(
        new ApiResponse(201, { document }, "Document uploaded successfully")
    )
})

export const fetchAllDocuments = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    const documents = await getAllDocuments(userId)

    return res.status(200).json(
        new ApiResponse(200, { documents }, "Documents fetched successfully")
    )
})

export const fetchDocumentById = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const id = req.params?.id;
    if (!id || Array.isArray(id)) {
        throw new ApiError(400, "Invalid Document ID");
    }

    const document = await getDocumentById(id, userId);

    return res.status(200).json(
        new ApiResponse(200, { document }, "Document fetched successfully")
    )
})
export const deleteDocumentById = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const id = req.params?.id;
    if (!id || Array.isArray(id)) {
        throw new ApiError(400, "Invalid Document ID");
    }

    const document = await deleteDocument(id, userId)

    return res.status(200).json(
        new ApiResponse(200, { document }, "Document deleted successfully")
    )
})
export const updateDocumentById = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const id = req.params?.id;
    if (!id || Array.isArray(id)) {
        throw new ApiError(400, "Invalid Document ID");
    }

    const document = await updateDocument(id, userId, req.body.title)

    return res.status(200).json(
        new ApiResponse(200, { document }, "Document updated successfully")
    )
})
export const getDocumentStatus = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const id = req.params?.id;
    if (!id || Array.isArray(id)) {
        throw new ApiError(400, "Invalid Document ID");
    }

    const document = await getStatus(id, userId);

    return res.status(200).json(
        new ApiResponse(200, { document }, "Document status fetched successfully")
    )
})