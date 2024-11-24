import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Role from "../models/Role.js";
import UserApiUsage from "../models/UserApiUsage.js";
import { Messages } from "../constants/en.js";

// Constants
const HOUR = "1h";

// Credentials
// Azure, ENV variables
const CREDENTIALS = {
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.JWT_AUDIENCE,
  expiresIn: HOUR,
}

/**
 * Decodes token and returns decoded token
 * @param {string} token - token string
 * @returns json object to represent success and error, as well as decoded token
 */
export const decodeToken = async (token) => 
{
  try
  {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, CREDENTIALS);
    return { success: true, decoded: decoded };
  } catch (error) {
    return { success: false, error: Messages.TokenInvalid};
  }
}
  
/**
 * Encodes token with payload data and returns token
 * @param {obj} payload - payload object
 * @returns json object to represent success and error, as well as token
 */
const encodeToken = async (payload) =>
{
    try
    {
      const token = jwt.sign(payload, process.env.JWT_SECRET, CREDENTIALS);
      return token;
    } catch (error) {
      return { success: false, error: Messages.ErrorEncodingToken };
    }
}

/**
 * Authenticates user with email and password
 * @param {string} email - email, email to authenticate
 * @param {string} password - password, password to authenticate
 * @returns success status and token
 */
export const login = async (email, password) =>
{
  try {
    // Find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() }).exec();

    if (!user) // If user is not found
      return { success: false, error: Messages.UserNotFound };

    // Compare the input password with the stored hash
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) 
      return { success: false, error: Messages.IncorrectPWD  };

    // Get role
    const role = await Role.findOne({ userId: user._id }).exec();

    // Encode token
    const token = await encodeToken({ id: user._id, email: user.email, username: user.username, role: role.role });
    return { success: true, token: token};
  } catch (error) {
    return { success: false, error: Messages.LoginError };
  }
}

/**
 * Registers user with username, email, and password
 * @param {string} username - username to register
 * @param {string} email - email to register
 * @param {string} password - password to register
 * @returns json object to represent success and error
 */
export const register = async (username, email, password) =>
{
  try {
    // Ensure the user doesn't already exist
    // Via email
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    }).exec();
    if (existingUser) 
      return { success: false, error: Messages.UserExists };

    // If password is not provided
    if (!password) throw new Error(Messages.PasswordRequired);

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

    // Create a new UserApiUsage
    const userApiUsageObj = new UserApiUsage({
      userId: `${user.id}`
    });

    // Save operation has a hash password middleware
    await user.save();

    // Save the role and userApiUsage
    await roleObj.save();
    await userApiUsageObj.save();

    return { success: true };
  } catch (error) {
    console.error(Messages.RegisterationError, error);
    return { success: false, error: error.message };
  }
}
