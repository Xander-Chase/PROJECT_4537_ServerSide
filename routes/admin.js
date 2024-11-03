// Rename this to "customerRoutes"

import User from '../models/User.js';

export const adminRoutes = {

    async getAllUsers() {

        try {
            const users = await User.find().exec();
            return { success: true, users };
        } catch (error) {
            console.error('Get all users error:', error);
            return { success: false, error: 'An error occurred while fetching users.' };
        }
    }
}

export const userRoutes = {

    async getUserbyId(_id)
    {
        try
        {
            const user = await User.findById(_id);
            return { success: true, user: user };
        }
        catch (error)
        {
            console.error('Get user by id error:', error);
            return { success: false, error: 'An error occurred while fetching user.' };
        }
    },

    async updateUser(_id, user, options)
    {
        try
        {
            const updatedUser = await User.findByIdAndUpdate(_id, options);
            return { success: true, user: updatedUser };
        }
        catch (error)
        {
            console.error('Update user by id error:', error);
            return { success: false, error: 'An error occurred while updating user.' };
        }
    }
}