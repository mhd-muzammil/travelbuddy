const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, enum: ["hotel", "food", "transport", "activity", "other"], default: "other" },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    splitType: { type: String, enum: ["equal", "custom"], default: "equal" },
    splitBetween: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ExpenseSchema.index({ tripId: 1, createdAt: -1 });

const Expense = mongoose.model("Expense", ExpenseSchema);
module.exports = { Expense };

