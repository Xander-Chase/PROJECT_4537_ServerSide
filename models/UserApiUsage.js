import mongoose from 'mongoose';

const COLLECTIONNAME = "UserApiUsage";
const DEFAULTUSAGE = 20;

const UserApiUsageSchema = new mongoose.Schema({
  userId: { type: String, required: true},
  count: {type: Number, default: DEFAULTUSAGE, min: 0}
});

const UserApiUsage = mongoose.model(COLLECTIONNAME, UserApiUsageSchema);
export default UserApiUsage;