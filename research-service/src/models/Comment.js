const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Research", required: true },
  userId: { type: String, required: true }, // From JWT
  userName: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);