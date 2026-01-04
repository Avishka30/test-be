import jwt, { SignOptions } from 'jsonwebtoken';

interface TokenPayload {
    id: string; // The user's ID
    role: 'user' | 'admin';
}

export function generateTokens(payload: TokenPayload) {
    // 1. Safely get secrets
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
        throw new Error('❌ JWT Secrets are missing in .env file');
    }

    // 2. Get Expiry from Env or use defaults, and TRIM whitespace to be safe
    // The .trim() fixes potential issues with comments in .env files
    const accessExpiry = process.env.ACCESS_TOKEN_EXPIRY 
        ? process.env.ACCESS_TOKEN_EXPIRY.trim() 
        : '15m';

    const refreshExpiry = process.env.REFRESH_TOKEN_EXPIRY 
        ? process.env.REFRESH_TOKEN_EXPIRY.trim() 
        : '7d';

    // 3. Define Options with correct Type
    // FIX: Cast expiry to 'any' to satisfy TypeScript's strict check 
    // because 'string' is technically too wide for the library's specific 'StringValue' type.
    const accessOptions: SignOptions = { 
        expiresIn: accessExpiry as any 
    };

    const refreshOptions: SignOptions = { 
        expiresIn: refreshExpiry as any 
    };

    // 4. Generate Tokens
    const accessToken = jwt.sign({ ...payload }, accessSecret, accessOptions);
    const refreshToken = jwt.sign({ ...payload }, refreshSecret, refreshOptions);

    return { accessToken, refreshToken };
}