import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "model"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, ref: "user" },
  messages: [messageSchema]
}, { timestamps: true });

const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema);

export default chatModel;
