import consultationModel from "../models/consultationModel.js";
import appointmentModel from "../models/appointmentModel.js";

/**
 * Get or create a consultation room for an appointment
 * Validates that only the assigned patient or doctor can access
 */
export const getOrCreateConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.body.userId;
    const docId = req.body.docId;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.cancelled) {
      return res.status(400).json({ success: false, message: "Appointment has been cancelled" });
    }

    // Verify user authorization: must be either the assigned patient or doctor
    const isPatient = userId && appointment.userId === userId;
    const isDoctor = docId && appointment.docId === docId;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: "Unauthorized access to consultation room" });
    }

    let consultation = await consultationModel.findOne({ appointmentId });

    if (!consultation) {
      const roomId = `room_${appointmentId}_${Date.now()}`;
      consultation = new consultationModel({
        appointmentId,
        patientId: appointment.userId,
        doctorId: appointment.docId,
        roomId,
        status: "active"
      });
      await consultation.save();
    } else if (consultation.status === "created") {
      consultation.status = "active";
      await consultation.save();
    }

    res.json({
      success: true,
      consultation: {
        id: consultation._id,
        roomId: consultation.roomId,
        appointmentId: consultation.appointmentId,
        patientId: consultation.patientId,
        doctorId: consultation.doctorId,
        status: consultation.status,
        docData: appointment.docData,
        userData: appointment.userData,
        slotDate: appointment.slotDate,
        slotTime: appointment.slotTime
      },
      role: isDoctor ? "doctor" : "patient"
    });
  } catch (error) {
    console.error("Consultation controller error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * End a consultation
 */
export const endConsultation = async (req, res) => {
  try {
    const { appointmentId, roomId } = req.body;
    const userId = req.body.userId;
    const docId = req.body.docId;

    const filter = roomId ? { roomId } : { appointmentId };
    const consultation = await consultationModel.findOne(filter);

    if (!consultation) {
      return res.status(404).json({ success: false, message: "Consultation not found" });
    }

    // Verify authorization
    if (userId && consultation.patientId !== userId && docId && consultation.doctorId !== docId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    consultation.status = "completed";
    consultation.endTime = new Date();
    await consultation.save();

    // Mark appointment completed
    await appointmentModel.findByIdAndUpdate(consultation.appointmentId, { isCompleted: true });

    res.json({ success: true, message: "Consultation ended successfully" });
  } catch (error) {
    console.error("End consultation error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Get consultation history for doctor or user
 */
export const getConsultationHistory = async (req, res) => {
  try {
    const { userId, docId } = req.body;
    const query = userId ? { patientId: userId } : { doctorId: docId };

    const consultations = await consultationModel.find(query).sort({ createdAt: -1 });
    res.json({ success: true, consultations });
  } catch (error) {
    console.error("Get consultation history error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
