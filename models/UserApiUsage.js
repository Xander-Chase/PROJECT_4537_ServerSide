import mongoose from 'mongoose';

// Collection name for UserApiUsage
const COLLECTIONNAME = "UserApiUsage";

// Default usage for new users
const DEFAULTUSAGE = 20;

// Schema for UserApiUsage
const UserApiUsageSchema = new mongoose.Schema({
  userId: { type: String, required: true}, // User ID to reference the user
  count: {type: Number, default: DEFAULTUSAGE, min: 0} // Number of times this user has accessed an API. Generating a new story
});

// Model for UserApiUsage, to be used in controllers
const UserApiUsage = mongoose.model(COLLECTIONNAME, UserApiUsageSchema);

// Export the model
export default UserApiUsage;