import User from '../models/User.js';
import Endpoint from '../models/Endpoints.js';
import Role from '../models/Role.js';
import UserApiUsage from "../models/UserApiUsage.js"
import Story from '../models/Story.js';
import { adminGetEntireUserById} from './user.js';
import { Messages } from '../constants/en.js';

// This function is used to get all users, roles, and api usage data.
export const getAll = async () => {
    try {
        // Find all users
        const allUsers = await User.find().exec();
        let userData = [];
        for (let user of allUsers)
        {
            // For each user, get their role and api usage data
            const payload = await adminGetEntireUserById(user._id);
            if (!payload.success)
                throw new Error(payload.error);

            // modify the data to be more readable
            userData.push({
                user: payload.user,
                role: payload.role,
                apiUsage: payload.apiUsage,
            });
        }

        // Get all endpoints
        const endpoints = await Endpoint.find().exec();

        // Return the data
        return { success: true, endpoints, data: userData};
    } catch (error) {
        return { success: false, error: Messages.ErrorGetAllData };
    }
}

/**
 * Deletes user by user id, deletes its role, api usage, and stories
 * @param {string} _id - string, represents userid
 * @returns - json object to represent success and error
 */
export const deleteUserById = async (_id) => 
{
    try
    {
        await User.findByIdAndDelete(_id);
        await Role.findOneAndDelete({ userId: _id });
        await UserApiUsage.findOneAndDelete({ userId: _id });
        await Story.findOneAndDelete({ userId: _id });
        
        // Return success
        return { success: true };
    }
    catch (error)
    {
        return { success: false, error: Messages.ErrorDeletingUser };
    }
}
