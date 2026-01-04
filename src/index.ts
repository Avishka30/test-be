import 'dotenv/config'; 
import express, { Request, Response } from 'express'; 
import mongoose from 'mongoose';
import cors from 'cors';

// Import Routes
import authRouter from './routes/auth';
import ticketRoutes from './routes/ticketRoutes'; 
import messageRoutes from './routes/messageRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes'; 

const app = express();

// 1. CORS CONFIGURATION
app.use(
    cors({
        origin: ["http://localhost:5173", "https://test-new-fe.vercel.app"], 
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        credentials: true,
    })
);

app.use(express.json());

// --- ROBUST DATABASE CONNECTION (VERCEL FIX) ---
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI is not defined in .env file");
}

// Initialize global cache to survive hot reloads/serverless restarts
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // 1. If a connection already exists, return it immediately
  if (cached.conn) {
    return cached.conn;
  }

  // 2. If no connection exists, create a new one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering (Critical for Serverless!)
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log("🔄 Initializing new database connection...");
    
    cached.promise = mongoose.connect(MONGO_URI!, opts).then((mongoose) => {
      console.log('✅ New Database Connection Established');
      return mongoose;
    });
  }

  // 3. Await the connection promise
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ DB Connection Error:", e);
    throw e;
  }

  return cached.conn;
}

// Middleware: Ensure DB is connected before handling ANY request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("❌ Fatal DB Error in Middleware:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// --- ROUTES ---

// Deployment Check
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: "✅ Backend Correctly Deployed on Vercel!" });
});

// Register API Routes
app.use('/api/auth', authRouter);
app.use('/api/tickets', ticketRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes); 

// Start Server (Only locally)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}

// Export the app for Vercel
export default app;