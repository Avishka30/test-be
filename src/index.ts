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

// --- DATABASE CONNECTION LOGIC (CRITICAL FOR VERCEL) ---
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  // If already connected, reuse connection to prevent multiple connections
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  if (!MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined.");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000, 
    });
    console.log('✅ Database connected successfully!');
  } catch (err) {
    console.error('❌ Database connection error:', err);
  }
};

// Connect immediately when the serverless function starts
connectDB();

// Middleware: Ensure DB is connected before handling ANY request
app.use(async (req, res, next) => {
  await connectDB();
  next();
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
// Vercel handles the server start automatically in production
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}

// Export the app for Vercel
export default app;