import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/error.util";
import { verifyAccessToken } from "../utils/token.util";
import { prisma } from "../config/db";

import env from "../config/env";

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const token =
            req.cookies?.[env.ACCESS_COOKIE_NAME] ||
            req.cookies?.accessToken ||
            req.headers.authorization?.replace(/^Bearer\s+/i, "");
        if (!token) {
            throw new ApiError(401, "Unauthorized: No access token provided");
        }
        const payload = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new ApiError(401, "Unauthorized: User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        next(
            error instanceof ApiError
                ? error
                : new ApiError(401, "Unauthorized: Invalid or expired access token")
        );
    }
};
