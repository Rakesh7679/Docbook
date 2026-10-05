import express from 'express';
import { sendMessage, getChatHistory, clearChatHistory } from '../controllers/aiController.js';
import authUser from '../middlewares/authUser.js';

const aiRouter = express.Router();

aiRouter.post('/chat', authUser, sendMessage);
aiRouter.get('/history', authUser, getChatHistory);
aiRouter.post('/clear', authUser, clearChatHistory);

export default aiRouter;
