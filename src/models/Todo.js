import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, default: "In Progress", enum: ["In Progress", "Done", "Overdue"] },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Update the pre-save hook to only auto-set status if not 'Done'
TodoSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'Done') {
    // If manually set to Done, don't change status
    return next();
  }
  
  if (this.dueDate && new Date(this.dueDate) < new Date()) {
    this.status = 'Overdue';
  }
  next();
});

export default mongoose.models.Todo || mongoose.model("Todo", TodoSchema);