const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['new_order', 'new_user', 'new_ticket', 'order_paid', 'new_review'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: { type: String },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
