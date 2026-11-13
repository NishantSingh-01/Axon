import { prisma } from "../../config/db";
import logger from "../../config/logger";
import { hashPassword, comparePassword } from "../../utils/password.util";
import { ApiError } from "../../utils/error.util";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../utils/token.util";
import { RegisterInput, LoginInput } from "./auth.schema";
import { AuthResult, RefreshResult, UserResponse } from "../../types/auth.types";
import { hashToken } from "../../utils/hashToken.util";

async function issueTokenPair(userId: string) {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: hashToken(refreshToken) },
    });

    return { accessToken, refreshToken };
}

export const registerUser = async (data: RegisterInput): Promise<AuthResult> => {
    const { name, email, password, role } = data;

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        logger.warn({ email }, "Registration failed: Email is already registered");
        throw new ApiError(409, "Email is already registered");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash: hashedPassword,
            role: role ?? "VIEWER",
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    logger.info({ userId: newUser.id, email: newUser.email, role: newUser.role }, "New user registered in database");

    const { accessToken, refreshToken } = await issueTokenPair(newUser.id);

    return {
        accessToken,
        refreshToken,
        user: newUser,
    };
};

export const loginUser = async (data: LoginInput): Promise<AuthResult> => {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        logger.warn({ email }, "Login failed: User not found");
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordCorrect = await comparePassword(password, user.passwordHash);
    if (!isPasswordCorrect) {
        logger.warn({ email, userId: user.id }, "Login failed: Incorrect password");
        throw new ApiError(401, "Invalid email or password");
    }

    logger.info({ userId: user.id, email: user.email }, "User credentials verified successfully");

    const { accessToken, refreshToken } = await issueTokenPair(user.id);

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
    };
};

export const rotateRefreshToken = async (incomingToken: string): Promise<RefreshResult> => {
    let payload;
    try {
        payload = verifyRefreshToken(incomingToken)
    } catch {
        logger.warn("Token rotation failed: Invalid or expired refresh token");
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
    })
    if (!user || !user.refreshToken) {
        logger.warn({ userId: payload.userId }, "Token rotation failed: User or refresh token not found");
        throw new ApiError(401, "Refresh token invalid — please log in again");
    }

    const incomingHashed = hashToken(incomingToken)
    if (incomingHashed !== user.refreshToken) {
        logger.error({ userId: user.id }, "Security alert: Refresh token mismatch / reuse detected, revoking session");
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: null },
        });
        throw new ApiError(401, "Refresh token invalid — please log in again");
    }

    const { accessToken, refreshToken } = await issueTokenPair(user.id);
    logger.info({ userId: user.id }, "Refresh token rotated and new token pair issued");

    return {
        accessToken,
        refreshToken,
    };
};

export async function logoutUser(userId: string): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
    });
    logger.info({ userId }, "User refresh token revoked in database");
}

export const getUser = async (userId: string): Promise<UserResponse> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
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
        logger.warn({ userId }, "User retrieval failed: User not found");
        throw new ApiError(404, "User not found");
    }

    return user;
};