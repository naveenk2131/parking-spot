const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'reservation_confirmed',
        'reservation_cancelled',
        'payment_success',
        'payment_failed',
        'check_in_reminder',
        'check_out_reminder',
        'owner_new_booking',
        'system_alert',
        'account_update',
        'qr_ready',
        'extension_successful',
        'extension_unavailable',
        'waitlist_availability',
        'overstay_warning',
        'no_show'
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    relatedEntity: {
      entityType: { type: String, enum: ['Reservation', 'Payment', 'ParkingLot'] },
      entityId: { type: mongoose.Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
