import mongoose, { Schema, Document } from 'mongoose';

// 1. Define the TypeScript Interface for type safety
export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId | null;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  attachments: string[];
  aiSuggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define the Schema based on your Blueprint [cite: 45]
const TicketSchema: Schema = new Schema(
  {
    // Link to the User who created it [cite: 46]
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    
    // Link to the Admin assigned (can be null initially) [cite: 47]
    assignedTo: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      default: null 
    },

    title: { type: String, required: true }, // [cite: 47]
    description: { type: String, required: true }, // [cite: 48]
    
    // AI will eventually suggest this, but we need a string field for it [cite: 49]
    category: { 
      type: String, 
      required: true 
    },

    // Enforced Enum for Priority [cite: 50]
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    },

    // Enforced Enum for Status [cite: 52]
    status: { 
      type: String, 
      enum: ['open', 'in_progress', 'resolved'], 
      default: 'open' 
    },

    // Array of strings for Cloudinary URLs [cite: 53]
    attachments: [{ type: String }],

    // Array of strings for AI solutions shown to user 
    aiSuggestions: [{ type: String }],
  },
  { 
    timestamps: true // Automatically handles createdAt  and updatedAt
  }
);

export default mongoose.model<ITicket>('Ticket', TicketSchema);