import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.util";
import { ApiResponse } from "../../utils/response.util";
import env from "../../config/env";
import { registerUserService } from "./auth.service";
import { RegisterInput } from "./auth.schema";

export const registerHandler = asyncHandler(
    async (req: Request<{}, {}, RegisterInput>, res: Response) => {
        const { user, accessToken, refreshToken } = await registerUserService(req.body);

        const isProduction = env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? ("none" as const) : ("lax" as const),
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        };

        return res
            .status(201)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    201,
                    { user, accessToken, refreshToken },
                    "User registered successfully"
                )
            );
    }
);
