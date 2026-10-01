import { asyncHandler } from "../../utils/asyncHandler.util";
import { ApiError } from "../../utils/error.util";
import { createDocument, getAllDocuments, getDocumentById } from "./document.service";
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

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
        throw new ApiError(400, "Document ID is required");
    }

    const document = await getDocumentById(id, userId);

    return res.status(200).json(
        new ApiResponse(200, { document }, "Document fetched successfully")
    )
})

export const getDocumentByIdController = fetchDocumentById;

