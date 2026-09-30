import { prisma } from "../../config/db";
import { hashPassword } from "../../utils/password.util";
import { ApiError } from "../../utils/error.util";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.util";
import { RegisterInput } from "./auth.schema";
import { AuthResponseData, UserResponse } from "../../types/auth.types";

export const registerUserService = async (
    input: RegisterInput
): Promise<AuthResponseData> => {
    const email = input.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);

    const user: UserResponse = await prisma.user.create({
        data: {
            name: input.name.trim(),
            email,
            passwordHash,
            role: input.role,
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

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return {
        user,
        accessToken,
        refreshToken,
    };
};
