import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Collection name for User
const COLLECTIONNAME = "User";
const PRE_METHOD_NAME = "save";

// Schema for User
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Username of the user
  email: { type: String, required: true, unique: true }, // Email of the user
  password: { type: String, required: true }, // Password of the user, hashed
  createdAt: { type: Date, default: Date.now } // Date the user was created
});

// Hash password before saving the user
UserSchema.pre(PRE_METHOD_NAME, async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
const User = mongoose.model(COLLECTIONNAME, UserSchema);

// Export the model
export default User;