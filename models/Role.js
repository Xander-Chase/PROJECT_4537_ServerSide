import mongoose from 'mongoose';

const COLLECTIONNAME = "Role";
const DEFAULTROLE = "user";

const RoleSchema = new mongoose.Schema({
  userId: { type: String, required: true},
  role: { type: String, required: true, default: DEFAULTROLE },
});

const Role = mongoose.model(COLLECTIONNAME, RoleSchema);
export default Role;