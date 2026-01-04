import { Request, Response } from 'express';
import Message from '../models/Message';
import Ticket from '../models/Ticket';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all messages for a specific ticket
// @route   GET /api/messages/:ticketId
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const messages = await Message.find({ ticketId }).populate('senderId', 'firstName lastName role');
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// @desc    Send a message in a ticket
// @route   POST /api/messages/:ticketId
export const addMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { messageText } = req.body;

    // 1. Ensure the ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // 2. Ensure user is authorized (User owns ticket OR is Admin)
    if (ticket.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to reply to this ticket' });
    }

    // 3. Create Message
    const message = await Message.create({
      ticketId,
      senderId: req.user._id,
      messageText,
    });

    // 4. (Optional) Update Ticket Status to "In Progress" if admin replies?
    // You can add logic here later.

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};