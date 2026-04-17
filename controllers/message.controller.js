import Message from "../models/Message.js";

export const writeMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newMessage = new Message({ name, email, phone, subject, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listMessages = async (req, res) => {
  try {
    const messages = await Message.find({status: {$ne: "deleted"}}).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStatusByID = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const message = await Message.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

