import express from 'express';
import { getOrCreateConsultation, endConsultation, getConsultationHistory } from '../controllers/consultationController.js';
import authAny from '../middlewares/authAny.js';

const consultationRouter = express.Router();

consultationRouter.get('/room/:appointmentId', authAny, getOrCreateConsultation);
consultationRouter.post('/room/:appointmentId', authAny, getOrCreateConsultation);
consultationRouter.post('/end', authAny, endConsultation);
consultationRouter.get('/history', authAny, getConsultationHistory);

export default consultationRouter;
