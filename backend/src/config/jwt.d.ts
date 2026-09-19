export interface TokenPayload {
    userId: string;
    role: "SUPER_ADMIN" | "SUPERVISOR";
}
export declare const generateToken: (payload: TokenPayload) => string;
export declare const verifyToken: (token: string) => TokenPayload;
//# sourceMappingURL=jwt.d.ts.map