import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["paypal"],
      default: "paypal"
    },
    kind: {
      type: String,
      enum: ["boost", "donation"],
      required: true
    },
    status: {
      type: String,
      enum: ["created", "completed", "cancelled", "failed"],
      default: "created"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property"
    },
    orderId: {
      type: String,
      unique: true,
      sparse: true
    },
    captureId: {
      type: String,
      default: ""
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: "USD"
    },
    approvalUrl: {
      type: String,
      default: ""
    },
    payerEmail: {
      type: String,
      default: ""
    },
    payerId: {
      type: String,
      default: ""
    },
    donorName: {
      type: String,
      default: ""
    },
    note: {
      type: String,
      default: ""
    },
    rawOrder: {
      type: mongoose.Schema.Types.Mixed
    },
    rawCapture: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ user: 1, kind: 1, createdAt: -1 });
paymentSchema.index({ property: 1, kind: 1, createdAt: -1 });

export const Payment = mongoose.model("Payment", paymentSchema);
