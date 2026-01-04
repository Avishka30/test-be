// import { Request, Response } from 'express';
// import Ticket from '../models/Ticket';

// // Extend the Request interface to include the user object from your JWT middleware
// // (Assuming your auth middleware adds the user to req.user)
// interface AuthRequest extends Request {
//   user?: {
//     _id: string;
//     role: string;
//   };
// }

// // @desc    Create a new ticket
// // @route   POST /api/tickets
// // @access  Private (User only)
// export const createTicket = async (req: AuthRequest, res: Response) => {
//   try {
//     const { title, description, category, priority, attachments } = req.body;

//     // 1. Validation: Ensure required fields are present
//     if (!title || !description || !category) {
//       return res.status(400).json({ message: 'Please add a title, description, and category' });
//     }

//     // 2. Create the ticket object
//     // Note: We use req.user._id to link this ticket to the logged-in user [cite: 46]
//     const ticket = await Ticket.create({
//       userId: req.user?._id, 
//       title,
//       description,
//       category,
//       priority: priority || 'medium', // Default to medium if not selected [cite: 50]
//       status: 'open',
//       attachments: attachments || [], // Expecting an array of URL strings from Cloudinary [cite: 53]
//     });

//     // 3. Return the created ticket
//     res.status(201).json(ticket);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error: Unable to create ticket' });
//   }
// };

// // @desc    Get user's tickets
// // @route   GET /api/tickets
// // @access  Private
// export const getMyTickets = async (req: AuthRequest, res: Response) => {
//   try {
//     // Find tickets where the userId matches the logged-in user [cite: 46]
//     const tickets = await Ticket.find({ userId: req.user?._id })
//       .sort({ createdAt: -1 }); // Sort by newest first

//     res.status(200).json(tickets);
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error: Unable to fetch tickets' });
//   }
// };

import { Request, Response } from 'express';
import Ticket from '../models/Ticket';

// Extend the Request interface to include the user object from your JWT middleware
interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private (User only)
export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, priority, attachments } = req.body;

    // 1. Validation
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Please add a title, description, and category' });
    }

    // 2. Create the ticket object
    const ticket = await Ticket.create({
      userId: req.user?._id, 
      title,
      description,
      category,
      priority: priority || 'medium',
      status: 'open',
      attachments: attachments || [],
    });

    res.status(201).json(ticket);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: Unable to create ticket' });
  }
};

// @desc    Get user's tickets
// @route   GET /api/tickets
// @access  Private
export const getMyTickets = async (req: AuthRequest, res: Response) => {
  try {
    // Find tickets where the userId matches the logged-in user
    const tickets = await Ticket.find({ userId: req.user?._id })
      .sort({ createdAt: -1 });

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Unable to fetch tickets' });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicket = async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Authorization Check:
    // Only the user who created the ticket OR an admin can view it
    if (ticket.userId.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: Unable to fetch ticket' });
  }
};

// --- ADMIN FUNCTIONS (New) ---

// @desc    Get ALL tickets from ALL users
// @route   GET /api/admin/tickets
export const getAllTickets = async (req: AuthRequest, res: Response) => {
  try {
    // .populate('userId') fills in the user's Name and Email so Admin knows who asked
    const tickets = await Ticket.find({})
      .populate('userId', 'firstName lastName email') 
      .sort({ createdAt: -1 });

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    res.status(500).json({ message: 'Server Error: Unable to fetch all tickets' });
  }
};

// @desc    Update ticket status (e.g. Open -> Resolved)
// @route   PATCH /api/admin/tickets/:id/status
export const updateTicketStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body; // Expecting { "status": "resolved" }
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    await ticket.save();

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Admin Update Error:", error);
    res.status(500).json({ message: 'Server Error: Unable to update status' });
  }
};