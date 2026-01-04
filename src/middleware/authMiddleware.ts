import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

// FIX: Use 'any' for user to accept the full Mongoose Document without type errors
export interface AuthRequest extends Request {
  user?: any;
}

// 1. PROTECT: Checks if user is logged in
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
      
      // Get user from DB
      // We explicitly select the role so we can check it later
      req.user = await User.findById(decoded.id).select('-password');
      
      next();

    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        console.log("ℹ️ Token expired. Frontend should auto-refresh.");
        res.status(401).json({ message: 'Not authorized, token expired' });
        return; 
      }

      console.error("❌ Auth Verification Failed:", error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 2. ADMIN: Checks if the logged-in user has the 'admin' role
export const admin = (req: Request, res: Response, next: NextFunction) => {
  // Cast request to our interface to access .user
  const authReq = req as AuthRequest;

  if (authReq.user && authReq.user.role === 'admin') {
    next(); 
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};