import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, ref: "appointment" },
  patientId: { type: String, required: true, ref: "user" },
  doctorId: { type: String, required: true, ref: "doctor" },
  roomId: { type: String, required: true, unique: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  status: { 
    type: String, 
    enum: ["created", "active", "completed", "cancelled"], 
    default: "created" 
  }
}, { timestamps: true });

const consultationModel = mongoose.models.consultation || mongoose.model("consultation", consultationSchema);

export default consultationModel;
