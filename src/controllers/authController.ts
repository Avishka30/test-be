import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { generateTokens } from '../utils/tokenUtils';

// --- REGISTER ---
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const newUser = new User({ firstName, lastName, email, password });
        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully. Please login to continue.',
            user: {
                id: newUser._id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- LOGIN ---
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await (user as IUser).comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const tokens = generateTokens({ id: user._id.toString(), role: user.role });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            ...tokens 
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- REFRESH TOKEN ---
export const refreshAccessToken = async (req: Request, res: Response) => {
    console.log("➡️ Refresh Request Received by Controller"); // DEBUG LOG 1

    const { refreshToken } = req.body;
  
    if (!refreshToken) {
      console.log("❌ No refresh token provided in body"); // DEBUG LOG 2
      return res.status(401).json({ message: 'No refresh token provided' });
    }
  
    try {
      // 1. Verify the Refresh Token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;
      console.log("✅ Refresh Token Signature Verified"); // DEBUG LOG 3
  
      // 2. Generate a NEW Access Token using Env variable
      const expiry = process.env.ACCESS_TOKEN_EXPIRY ? process.env.ACCESS_TOKEN_EXPIRY.trim() : '15m';

      const accessToken = jwt.sign(
        { id: decoded.id, role: decoded.role }, 
        process.env.JWT_ACCESS_SECRET as string, 
        { expiresIn: expiry as any } 
      );
  
      console.log("✅ New Access Token Generated"); // DEBUG LOG 4

      // 3. Send the new access token back
      res.json({ accessToken });
  
    } catch (error: any) {
      console.error("❌ Refresh Failed:", error.message); // DEBUG LOG 5
      res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
};