import 'dotenv/config'; 
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Import Routes
import authRouter from './routes/auth';
import ticketRoutes from './routes/ticketRoutes'; 
import messageRoutes from './routes/messageRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes'; 

const app = express();

// 1. CORS CONFIGURATION (Must include PATCH)
app.use(
    cors({
        origin: ["http://localhost:5173"], 
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // <--- CRITICAL: PATCH MUST BE HERE
        credentials: true,
    })
);

app.use(express.json());

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
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Database connected successfully!');
  })
  .catch(err => console.error('❌ Database connection error:', err));

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});