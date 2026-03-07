import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
  PROVIDER = "PROVIDER",
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
        emailVerified: boolean;
        status: string;
      };
    }
  }
}

// middleware

const authMiddleware = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get user session
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not logged in!",
        });
      }

      if (session.user.status === "SUSPEND") {
        //  Force logout if somehow still have session
        // await auth.api.signOut({ headers: req.headers as any });
        return res.status(403).json({
          success: false,
          message:
            "Account suspended by admin, Please contact support for more info!",
          contactMail: process.env.ADMIN_EMAIL,
        });
      }

      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email verification required, Please verify your email!",
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as string,
        emailVerified: session.user.emailVerified,
        status: session.user.status,
      };

      const userRole = req.user.role as UserRole;

      if (roles.length === 0 || roles.includes(userRole)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: "Forbidden! You cannot access this resource",
      });
    } catch (error) {
      next(error);
    }
  };
};

export default authMiddleware;
