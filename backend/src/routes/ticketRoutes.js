const router = require("express").Router();
const {
  createTicket,
  getMyTickets,
  getTicketById,
  getAllTickets,
  updateTicketStatus,
} = require("../controllers/ticketController");
const { protect, admin } = require("../middlewares/auth");

router.post("/", protect, createTicket);
router.get("/my-tickets", protect, getMyTickets);
router.get("/all", protect, admin, getAllTickets);
router.get("/:id", protect, getTicketById);
router.put("/:id/status", protect, admin, updateTicketStatus);

module.exports = router;
