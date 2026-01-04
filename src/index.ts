import 'dotenv/config'; 
import express, { Request, Response } from 'express'; // Import types
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
        origin: ["http://localhost:5173", "https://test-new-fe.vercel.app"], // Add your Vercel frontend URL here
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
);

app.use(express.json());

// --- DEPLOYMENT CHECK ROUTE ---
// This will show "Correctly Deployed" when you visit the root URL
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: "✅ Backend Correctly Deployed on Vercel!" });
});

// 2. Register Routes
app.use('/api/auth', authRouter);
app.use('/api/tickets', ticketRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes); 

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

if (!MONGO_URI) {
  console.error("❌ Error: MONGO_URI is not defined in .env file.");
  // Don't exit process in serverless environment, just log error
} else {
    mongoose.connect(MONGO_URI)
      .then(() => {
        console.log('✅ Database connected successfully!');
      })
      .catch(err => console.error('❌ Database connection error:', err));
}

// Start Server (Only locally)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}

// Export the app for Vercel
export default app;