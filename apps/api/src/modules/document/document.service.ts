import { v4 as uuid } from "uuid";
import cloudinary from "../../config/cloudinary";

export const uploadDocumentToCloudinary = async (fileBuffer: Buffer,
): Promise<{ publicId: string; url: string }> => {
    const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "nexusai/documents",
                resource_type: "auto",
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
