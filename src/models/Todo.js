import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  status: { type: String, default: "In Progress" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Todo || mongoose.model("Todo", TodoSchema);