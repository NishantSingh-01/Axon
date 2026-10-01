import { v4 as uuid } from "uuid";
import cloudinary from "../../config/cloudinary";
import { prisma } from "../../config/db";
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
                    reject(error)
                    return
                }

                resolve(result)
            }
        )
        stream.end(fileBuffer)
    })

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
            status: "UPLOADED",
        }
    })
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

export const getDocumentById = async (id: string, userId: string) :Promise<DocumentResponse>=> {
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
        throw new ApiError(404, "Document not found")
    }

    return document
}