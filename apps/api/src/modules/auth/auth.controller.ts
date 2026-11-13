import env from "../../config/env";
import logger from "../../config/logger";
import { asyncHandler } from "../../utils/asyncHandler.util";
import { ApiError } from "../../utils/error.util";
import { ApiResponse } from "../../utils/response.util";
import { registerUser, loginUser, rotateRefreshToken, logoutUser, getUser, } from "./auth.service";



const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

const accessTokenCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 15 * 60 * 1000,
}

export const register = asyncHandler(async (req, res) => {
    const { accessToken, refreshToken, user } = await registerUser(req.body);

    res.cookie(env.ACCESS_COOKIE_NAME, accessToken, accessTokenCookieOptions);
    res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

    logger.info({ userId: user.id, email: user.email }, "User registered and logged in successfully");

    return res
        .status(201)
        .json(
            new ApiResponse(201, { accessToken, user }, "User registered successfully")
        );
})

export const login = asyncHandler(async (req, res) => {
    const { accessToken, refreshToken, user } = await loginUser(req.body)

    res.cookie(env.ACCESS_COOKIE_NAME, accessToken, accessTokenCookieOptions);
    res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

    logger.info({ userId: user.id, email: user.email }, "User logged in and cookies set successfully");
    
    return res
        .status(200)
        .json(
            new ApiResponse(200, { accessToken, user }, "User logged in successfully")
        );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies?.[env.REFRESH_COOKIE_NAME];

    if (!incomingToken) {
        logger.warn("Refresh token attempt rejected: No refresh token provided in cookies");
        throw new ApiError(401, "No refresh token provided");
    }

    const { accessToken, refreshToken } = await rotateRefreshToken(incomingToken);

    res.cookie(env.ACCESS_COOKIE_NAME, accessToken, accessTokenCookieOptions);
    res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

    logger.info("Access token refreshed successfully");

    return res.status(200).json(
        new ApiResponse(
            200,
            { accessToken , refreshToken},
            "Access token refreshed"
        )
    );
});

export const logout = asyncHandler(async (req, res) => {
    if (!req.user?.id) {
        logger.warn("Logout attempt rejected: Unauthorized request");
        throw new ApiError(401, "Unauthorized");
    }

    await logoutUser(req.user.id);

    res.clearCookie(env.REFRESH_COOKIE_NAME, cookieOptions);
    res.clearCookie(env.ACCESS_COOKIE_NAME, accessTokenCookieOptions);

    logger.info({ userId: req.user.id }, "User logged out successfully");

    return res.status(200).json(
        new ApiResponse(200, {}, "Logged out successfully")
    );
});

export const getMe = asyncHandler(async (req, res) => {
    if (!req.user?.id) {
        logger.warn("Get profile attempt rejected: Unauthorized request");
        throw new ApiError(401, "Unauthorized");
    }

    const user = await getUser(req.user.id);

    logger.info({ userId: user.id }, "Current user profile retrieved");

    return res.status(200).json(
        new ApiResponse(
            200,
            { user },
            "Current user fetched successfully"
        )
    )
})