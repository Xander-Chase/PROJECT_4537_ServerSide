import mongoose from 'mongoose';

// Collection name for Role
const COLLECTIONNAME = "Role";

// Default role for new users
const DEFAULTROLE = "user";

// Schema for Role
const RoleSchema = new mongoose.Schema({
  userId: { type: String, required: true}, // User ID to reference the user
  role: { type: String, required: true, default: DEFAULTROLE }, // Role of the user, default is "user"
});

// Model for Role, to be used in controllers
const Role = mongoose.model(COLLECTIONNAME, RoleSchema);

// Export the model
export default Role;