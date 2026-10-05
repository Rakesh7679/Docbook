import prescriptionModel from "../models/prescriptionModel.js";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import { generatePrescriptionPDF } from "../services/pdfService.js";

/**
 * Doctor creates a digital prescription
 */
export const createPrescription = async (req, res) => {
  try {
    const { docId, appointmentId, diagnosis, medicines, notes, followUpDate, consultationId } = req.body;

    if (!docId || !appointmentId || !diagnosis || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ success: false, message: "Please fill all required prescription fields and add at least one medicine." });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.docId !== docId) {
      return res.status(403).json({ success: false, message: "Unauthorized: Appointment belongs to another doctor" });
    }

    // Check if prescription already exists for this appointment
    let prescription = await prescriptionModel.findOne({ appointmentId });

    if (prescription) {
      prescription.diagnosis = diagnosis;
      prescription.medicines = medicines;
      prescription.notes = notes || "";
      prescription.followUpDate = followUpDate || "";
      prescription.consultationId = consultationId || prescription.consultationId || "";
      await prescription.save();
    } else {
      prescription = new prescriptionModel({
        patientId: appointment.userId,
        doctorId: docId,
        appointmentId,
        consultationId: consultationId || "",
        diagnosis,
        medicines,
        notes: notes || "",
        followUpDate: followUpDate || ""
      });
      await prescription.save();
    }

    // Automatically mark appointment as completed when prescription is issued
    await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });

    res.json({
      success: true,
      message: "Digital Prescription generated successfully",
      prescription
    });
  } catch (error) {
    console.error("Create prescription error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Get prescription details by ID or appointment ID
 */
export const getPrescriptionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    const docId = req.body.docId;

    let prescription = await prescriptionModel.findById(id);
    if (!prescription) {
      prescription = await prescriptionModel.findOne({ appointmentId: id });
    }

    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    // Check authorization: patient, doctor, or admin
    if (userId && prescription.patientId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access to prescription" });
    }
    if (docId && prescription.doctorId !== docId) {
      return res.status(403).json({ success: false, message: "Unauthorized access to prescription" });
    }

    const doctor = await doctorModel.findById(prescription.doctorId).select("-password");
    const patient = await userModel.findById(prescription.patientId).select("-password");
    const appointment = await appointmentModel.findById(prescription.appointmentId);

    res.json({
      success: true,
      prescription,
      doctor,
      patient,
      appointment
    });
  } catch (error) {
    console.error("Get prescription details error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * List prescriptions for current patient
 */
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { userId } = req.body;
    const prescriptions = await prescriptionModel.find({ patientId: userId }).sort({ createdAt: -1 });
    
    // Enrich with doctor details
    const enriched = await Promise.all(prescriptions.map(async (p) => {
      const doctor = await doctorModel.findById(p.doctorId).select("name speciality image degree");
      const appointment = await appointmentModel.findById(p.appointmentId).select("slotDate slotTime");
      return {
        ...p.toObject(),
        doctorData: doctor,
        appointmentData: appointment
      };
    }));

    res.json({ success: true, prescriptions: enriched });
  } catch (error) {
    console.error("Get patient prescriptions error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * List prescriptions created by doctor
 */
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const { docId } = req.body;
    const prescriptions = await prescriptionModel.find({ doctorId: docId }).sort({ createdAt: -1 });

    const enriched = await Promise.all(prescriptions.map(async (p) => {
      const patient = await userModel.findById(p.patientId).select("name image gender dob phone");
      const appointment = await appointmentModel.findById(p.appointmentId).select("slotDate slotTime");
      return {
        ...p.toObject(),
        patientData: patient,
        appointmentData: appointment
      };
    }));

    res.json({ success: true, prescriptions: enriched });
  } catch (error) {
    console.error("Get doctor prescriptions error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Download prescription as PDF
 */
export const downloadPrescriptionPDF = async (req, res) => {
  try {
    const { id } = req.params;

    let prescription = await prescriptionModel.findById(id);
    if (!prescription) {
      prescription = await prescriptionModel.findOne({ appointmentId: id });
    }

    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    const doctor = await doctorModel.findById(prescription.doctorId).select("-password") || {};
    const patient = await userModel.findById(prescription.patientId).select("-password") || {};
    const appointment = await appointmentModel.findById(prescription.appointmentId) || {};

    const pdfBuffer = await generatePrescriptionPDF(prescription, doctor, patient, appointment);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Prescription_${prescription._id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Download prescription PDF error:", error);
    res.status(500).json({ success: false, message: "Server error generating PDF", error: error.message });
  }
};
