import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // To associate todos with users
  title: { type: String, required: true },
  status: { type: String, default: "In Progress" }, // "Done" | "In Progress"
  createdAt: { type: Date, default: Date.now },
});

// Check if model already exists to avoid redefining it
export default mongoose.models.Todo || mongoose.model("Todo", TodoSchema);