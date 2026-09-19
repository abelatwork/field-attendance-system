import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "../config/jwt";
export interface AuthenticatedRequest extends Request {
    user?: TokenPayload;
}
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authorize: (allowedRoles: ("SUPER_ADMIN" | "SUPERVISOR")[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authMiddleware.d.ts.map