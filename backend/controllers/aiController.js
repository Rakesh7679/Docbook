import chatModel from "../models/chatModel.js";
import { generateAIResponse } from "../services/aiService.js";

/**
 * Handle sending a message to the AI Assistant
 */
export const sendMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    let chat = await chatModel.findOne({ userId });
    if (!chat) {
      chat = new chatModel({ userId, messages: [] });
    }

    // Get previous 10 messages for context
    const recentHistory = chat.messages.slice(-10);

    // Call AI Service layer (abstracted LLM provider)
    const aiReplyText = await generateAIResponse(message, recentHistory);

    const userMsgObj = { sender: "user", text: message, timestamp: new Date() };
    const aiMsgObj = { sender: "model", text: aiReplyText, timestamp: new Date() };

    chat.messages.push(userMsgObj, aiMsgObj);
    await chat.save();

    res.json({
      success: true,
      message: aiMsgObj,
      chatHistory: chat.messages
    });
  } catch (error) {
    console.error("AI controller sendMessage error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Get stored chat history for authenticated user
 */
export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    let chat = await chatModel.findOne({ userId });

    res.json({
      success: true,
      messages: chat ? chat.messages : []
    });
  } catch (error) {
    console.error("AI controller getChatHistory error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Clear chat history for user
 */
export const clearChatHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    await chatModel.findOneAndUpdate({ userId }, { messages: [] });

    res.json({
      success: true,
      message: "Chat history cleared successfully"
    });
  } catch (error) {
    console.error("AI controller clearChatHistory error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
