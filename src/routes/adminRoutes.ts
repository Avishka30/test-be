import express from 'express';
import { getAllTickets, updateTicketStatus } from '../controllers/ticketController';
import { protect, admin } from '../middleware/authMiddleware'; // Import both security guards

const router = express.Router();

// 1. Get All Tickets
// Route: GET /api/admin/tickets
// Security: Must be Logged In (protect) AND must be Admin (admin)
router.get('/tickets', protect, admin, getAllTickets);

// 2. Update Ticket Status (e.g. Open -> Resolved)
// Route: PATCH /api/admin/tickets/:id/status
router.patch('/tickets/:id/status', protect, admin, updateTicketStatus);

export default router;