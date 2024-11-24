import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Messages } from './constants/en';

dotenv.config(); // Load environment variables

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "ISA", // Specify the correct database
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(Messages.MongoDBConnected);
  } catch (error) {
    console.error(Messages.MongoDbConnectionError, error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
