import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Place this in .env
const SECRET_KEY = "secret";

export const authRoutes = {
    async isTokenValid(token) {
        try {
    
          jwt.verify(token, SECRET_KEY);
          return { success: true, valid: true };
        } catch (error) {
          console.error('Token validation error:', error);
          return { success: false, error: 'Invalid token' };
        }
    },

    async decodeToken(token)
    {
        try
        {
          const decoded = jwt.verify(token, SECRET_KEY);
          return { success: true, decoded: decoded };
        } catch (error) {
          console.error('Token decoding error:', error);
          return { success: false, error: 'Invalid token' };
        }
    },
    
    async login(email, password) {
        try {
          console.log('Login attempt:', { email, password });
    
          const user = await User.findOne({ email: email.trim().toLowerCase() }).exec();
          console.log('User found:', user);
    
          if (!user) {
            return { success: false, error: 'Invalid credentials. User not found.' };
          }
    
          // Compare the input password with the stored hash
          let isMatch = await bcrypt.compare(password, user.password);
          console.log('Input Password:', password);
          console.log('Stored Hashed Password:', user.password);
          console.log('Password comparison result:', isMatch);
    
          if (!isMatch) {
            return { success: false, error: 'Invalid credentials. Incorrect password.' };
          }
    
          const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    
          console.log('Login successful:', user.email);
          return { success: true, token };
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, error: 'An error occurred during login.' };
        }
      },

  async register(username, email, password) {
    try {
      console.log("Registering user:", { username, email, password }); // Debugging log

      // Ensure the user doesn't already exist
      const existingUser = await User.findOne({
        email: email.trim().toLowerCase(),
      }).exec();
      if (existingUser) {
        return { success: false, error: "User already exists" };
      }

      // Hash the password if it's defined
      if (!password) throw new Error("Password is required");

      // Hash is not required, MongoDB automatically hashes it for you

      // Create a new user
      const user = new User({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      });

      await user.save();

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: error.message };
    }
  },
};
