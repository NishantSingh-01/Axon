import { v4 as uuid } from "uuid";
import cloudinary from "../../config/cloudinary";
import { prisma } from "../../config/db";
import logger from "../../config/logger";
import { ApiError } from "../../utils/error.util";
import { DocumentResponse } from "../../types/document.types";

export const uploadDocumentToCloudinary = async (fileBuffer: Buffer,
): Promise<{ publicId: string; url: string }> => {
    const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "nexusai/documents",
                resource_type: "raw",
                public_id: uuid(),
            },
            (error, result) => {
                if (error) {
                    logger.error({ err: error }, "Failed to upload document file to Cloudinary");
                    reject(error)
                    return
                }

                resolve(result)
            }
        )
        stream.end(fileBuffer)
    })

    logger.info({ publicId: result.public_id }, "Document file uploaded to Cloudinary");

    return {
        publicId: result.public_id,
        url: result.secure_url,
    }
}

export const createDocument = async (title: string, file: Express.Multer.File, userId: string) => {
    const fileBuffer = file.buffer
    const { publicId, url } = await uploadDocumentToCloudinary(fileBuffer)

    const document = await prisma.document.create({
        data: {
            userId,
            title: title?.trim() || file.originalname,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            source: "FILE",
            storageKey: publicId,
            sourceUrl: url,
            status: "PENDING",
        }
    })

    logger.info({ documentId: document.id, userId, title: document.title, size: file.size }, "Document record created in database");
    return document
}
export const getAllDocuments = async (userId: string) => {
    const documents = await prisma.document.findMany({
        where: {
            userId,
        },
        select: {
            id: true,
            title: true,
            originalName: true,
            mimeType: true,
            size: true,
            source: true,
            sourceUrl: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    })
    return documents
}

export const getDocumentById = async (id: string, userId: string): Promise<DocumentResponse> => {
    const document = await prisma.document.findFirst({
        where: {
            id,
            userId,
        },
        select: {
            id: true,
            userId: true,
            title: true,
            originalName: true,
            mimeType: true,
            size: true,
            source: true,
            sourceUrl: true,
            status: true,
            errorMessage: true,
            createdAt: true,
            updatedAt: true,
        },
    })

    if (!document) {
        logger.warn({ id, userId }, "Document lookup failed: Document not found");
        throw new ApiError(404, "Document not found")
    }

    return document
}
export const deleteDocument = async (id: string, userId: string): Promise<DocumentResponse> => {
    const existing = await prisma.document.findFirst({
        where: {
            id,
            userId,
        },
    });

    if (!existing) {
        logger.warn({ id, userId }, "Document delete failed: Document not found");
        throw new ApiError(404, "Document not found");
    }

    const document = await prisma.document.delete({
        where: {
            id,
        },
        select: {
            id: true,
            userId: true,
            title: true,
            originalName: true,
            mimeType: true,
            size: true,
            source: true,
            sourceUrl: true,
            status: true,
            errorMessage: true,
            createdAt: true,
            updatedAt: true,
        },
    })

    logger.info({ id, userId }, "Document record deleted from database");

    return document
}
export const updateDocument = async (
    documentId: string,
    userId: string,
    title: string
) => {
    const document = await prisma.document.findFirst({
        where: {
            id: documentId,
            userId,
        },
    });

    if (!document) {
        logger.warn({ documentId, userId }, "Document update failed: Document not found");
        throw new ApiError(404, "Document not found");
    }

    const updatedDocument = await prisma.document.update({
        where: {
            id: documentId,
        },
        data: {
            title,
        },
    });

    logger.info({ documentId, userId, newTitle: title }, "Document title updated in database");

    return updatedDocument
}

export const getStatus = async (id: string, userId: string) => {
    const document = await prisma.document.findFirst({
        where: {
            id,
            userId,
        },
        select: {
            id: true,
            status: true,
            errorMessage: true,
        },
    })

    if (!document) {
        logger.warn({ id, userId }, "Document status lookup failed: Document not found");
        throw new ApiError(404, "Document not found")
    }
    return document
}