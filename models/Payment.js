const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  amount: { 
    type: Number,
    required: true 
  },
  purpose: { 
    type: String, 
    enum: ['fine', 'membership', 'penalty', 'reservation'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'],
    default: "pending" 
  },
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  description: String,
  paymentMethod: {
    type: String,
    enum: ['online', 'cash', 'cheque'],
    default: 'online'
  },
  transactionDate: Date,
  verifiedAt: Date,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
PaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Payment", PaymentSchema);
