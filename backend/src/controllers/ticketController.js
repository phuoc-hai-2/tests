const Ticket = require("../models/Ticket");
const { createNotification } = require("./notificationController");

exports.createTicket = async (req, res) => {
  try {
    const { subject, description, priority } = req.body;
    const ticket = await Ticket.create({
      user: req.user._id,
      subject,
      description,
      priority: priority || "medium",
    });
    await createNotification({
      type: "new_ticket",
      title: "Ticket hỗ trợ mới",
      message: subject,
      relatedId: ticket._id,
      relatedModel: "Ticket",
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      "user",
      "name email avatar",
    );
    if (!ticket)
      return res.status(404).json({ message: "Ticket không tồn tại" });
    if (
      ticket.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const total = await Ticket.countDocuments(filter);
    const tickets = await Ticket.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({
      tickets,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    if (!ticket)
      return res.status(404).json({ message: "Ticket không tồn tại" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
