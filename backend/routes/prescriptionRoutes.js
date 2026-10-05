import express from 'express';
import { 
  createPrescription, 
  getPrescriptionDetails, 
  getPatientPrescriptions, 
  getDoctorPrescriptions, 
  downloadPrescriptionPDF 
} from '../controllers/prescriptionController.js';
import authDoctor from '../middlewares/authDoctor.js';
import authUser from '../middlewares/authUser.js';
import authAny from '../middlewares/authAny.js';

const prescriptionRouter = express.Router();

prescriptionRouter.post('/create', authDoctor, createPrescription);
prescriptionRouter.get('/patient', authUser, getPatientPrescriptions);
prescriptionRouter.get('/doctor', authDoctor, getDoctorPrescriptions);
prescriptionRouter.get('/details/:id', authAny, getPrescriptionDetails);
prescriptionRouter.get('/download/:id', downloadPrescriptionPDF);

export default prescriptionRouter;
