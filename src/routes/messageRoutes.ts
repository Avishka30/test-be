import express from 'express';
import { getMessages, addMessage } from '../controllers/messageController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All message routes require the user to be logged in
router.route('/:ticketId')
  .get(protect, getMessages)
  .post(protect, addMessage);

export default router;