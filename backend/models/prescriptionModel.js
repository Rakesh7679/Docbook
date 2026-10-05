import mongoose from "mongoose";

const medicineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String, default: "" }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: String, required: true, ref: "user" },
  doctorId: { type: String, required: true, ref: "doctor" },
  appointmentId: { type: String, required: true, ref: "appointment" },
  consultationId: { type: String, default: "", ref: "consultation" },
  diagnosis: { type: String, required: true },
  medicines: [medicineItemSchema],
  notes: { type: String, default: "" },
  followUpDate: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const prescriptionModel = mongoose.models.prescription || mongoose.model("prescription", prescriptionSchema);

export default prescriptionModel;
