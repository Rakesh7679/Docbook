import express from 'express';
import { bookAppointment, listAppointments, cancelAppointment } from '../controllers/userController.js';
import { appointmentsDoctor, appointmentComplete, appointmentCancel } from '../controllers/doctorController.js';
import authUser from '../middlewares/authUser.js';
import authDoctor from '../middlewares/authDoctor.js';

const appointmentRouter = express.Router();

appointmentRouter.post('/book', authUser, bookAppointment);
appointmentRouter.get('/user-list', authUser, listAppointments);
appointmentRouter.post('/user-cancel', authUser, cancelAppointment);

appointmentRouter.get('/doctor-list', authDoctor, appointmentsDoctor);
appointmentRouter.post('/doctor-complete', authDoctor, appointmentComplete);
appointmentRouter.post('/doctor-cancel', authDoctor, appointmentCancel);

export default appointmentRouter;
