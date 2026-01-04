import express from 'express';
import { createTicket, getMyTickets, getTicket } from '../controllers/ticketController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Route for /api/tickets
router.route('/')
  .get(protect, getMyTickets)   // Get all my tickets
  .post(protect, createTicket); // Create a new ticket

// Route for /api/tickets/:id (This was missing!)
router.route('/:id')
  .get(protect, getTicket);     // Get single ticket details

export default router;