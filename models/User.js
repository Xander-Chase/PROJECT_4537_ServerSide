import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const COLLECTIONNAME = "User";
const PRE_METHOD_NAME = "save";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving the user
UserSchema.pre(PRE_METHOD_NAME, async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model(COLLECTIONNAME, UserSchema);
export default User;