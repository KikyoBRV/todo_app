import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: [6, 'Password must be at least 6 characters']
  },
  createdAt: { type: Date, default: Date.now }
});

// Prevent model overwrite upon hot-reload
export default mongoose.models.User || mongoose.model("User", UserSchema);