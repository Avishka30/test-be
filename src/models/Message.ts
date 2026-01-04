import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  ticketId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  messageText: string;
  attachments: string[];
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    ticketId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Ticket', 
      required: true 
    },
    senderId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    messageText: { 
      type: String, 
      required: true 
    },
    // Optional: For future file uploads (Cloudinary)
    attachments: [{ type: String }],
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model<IMessage>('Message', MessageSchema);