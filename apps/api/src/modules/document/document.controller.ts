import { asyncHandler } from "../../utils/asyncHandler.util";
import { ApiError } from "../../utils/error.util";
import { createDocument } from "./document.service";
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

