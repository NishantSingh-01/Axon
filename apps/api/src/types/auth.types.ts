import type { UserRole } from "../generated/enums";

export interface RefreshResult {
    accessToken: string;
    refreshToken: string;
}

export interface TokenPayload {
    userId: string;
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponseData {
    user: UserResponse;
    accessToken: string;
    refreshToken: string;
}

export interface AuthResult {
    accessToken: string;
    refreshToken: string;
    user: UserResponse;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserResponse;
        }
    }
}
