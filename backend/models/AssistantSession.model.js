const mongoose = require('mongoose');

const assistantSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionIdentifier: {
    type: String,
    required: true
  },
  metadata: {
    roleContext: { type: String }, // 'commuter', 'owner', 'admin'
    lastQueryType: { type: String }, // e.g. 'search', 'revenue_lookup'
    messageCount: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

assistantSessionSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('AssistantSession', assistantSessionSchema);
