const Message = require("../models/Message");
const Ticket = require("../models/Ticket");

const verifyTicketAccess = async (ticketId, userId, userRole) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return false;
  return ticket.user.toString() === userId.toString() || userRole === "admin";
};

exports.sendMessage = async (req, res) => {
  try {
    const { ticketId, text } = req.body;
    if (!(await verifyTicketAccess(ticketId, req.user._id, req.user.role))) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    const message = await Message.create({
      ticket: ticketId,
      sender: req.user._id,
      text,
    });
    const populated = await Message.findById(message._id).populate(
      "sender",
      "name avatar role",
    );
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    if (
      !(await verifyTicketAccess(
        req.params.ticketId,
        req.user._id,
        req.user.role,
      ))
    ) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    const messages = await Message.find({ ticket: req.params.ticketId })
      .populate("sender", "name avatar role")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      {
        ticket: req.params.ticketId,
        sender: { $ne: req.user._id },
        isRead: false,
      },
      { isRead: true },
    );
    res.json({ message: "Đã đánh dấu đã đọc" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
