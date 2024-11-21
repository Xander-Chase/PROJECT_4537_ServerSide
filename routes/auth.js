import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Role from "../models/Role.js";
import Story from "../models/Story.js";
import UserApiUsage from "../models/UserApiUsage.js";

const HOUR = "1h";

const CREDENTIALS = {
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.JWT_AUDIENCE,
  expiresIn: HOUR,
}

export const decodeToken = async (token) => 
{
  try
  {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, CREDENTIALS);
    return { success: true, decoded: decoded };
  } catch (error) {
    console.error('Token decoding error:', error);
    return { success: false, error: 'Invalid token' };
  }
}
  
const encodeToken = async (payload) =>
{
    try
    {
      const token = jwt.sign(payload, process.env.JWT_SECRET, CREDENTIALS);
      return token;
    } catch (error) {
      console.error('Token encoding error:', error);
      return { success: false, error: 'An error occurred while encoding token.' };
    }
}

export const login = async (email, password) =>
{
  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).exec();

    if (!user) // If user is not found
      return { success: false, error: 'Invalid credentials. User not found.' };

    // Compare the input password with the stored hash
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) 
      return { success: false, error: 'Invalid credentials. Incorrect password.' };

    const token = await this.encodeToken({ id: user._id, email: user.email, username: user.username });
    return { success: true, token: token};
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An error occurred during login.' };
  }
}

export const register = async (username, email, password) =>
{
  try {
    // Ensure the user doesn't already exist
    // Via email
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    }).exec();
    if (existingUser) 
      return { success: false, error: "User already exists" };

    // If password is not provided
    if (!password) throw new Error("Password is required");

    // Create a new user
    const user = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: password
    });

    // Create a new Role
    const roleObj = new Role({
      userId: `${user.id}`,
      role: "user"
    });

    // Create a new Story
    const storyObj = new Story({
      userId: `${user.id}`
    });

    // Create a new UserApiUsage
    const userApiUsageObj = new UserApiUsage({
      userId: `${user.id}`
    });

    // Save operation has a hash password middleware
    await user.save();

    // Save the role, story, and userApiUsage
    await roleObj.save();
    await storyObj.save();
    await userApiUsageObj.save();

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: error.message };
  }
}
