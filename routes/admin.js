import User from '../models/User.js';
import Endpoint from '../models/Endpoints.js';
import Role from '../models/Role.js';
import UserApiUsage from "../models/UserApiUsage.js"
import Story from '../models/Story.js';

export const getAll = async () => {
    try {
        const users = await User.find().exec();
        const endpoints = await Endpoint.find().exec();
        const roles = await Role.find().exec();
        const apiUsage = await UserApiUsage.find().exec();
        return { success: true, users, endpoints, roles, apiUsage };
    } catch (error) {
        console.error('Get all error:', error);
        return { success: false, error: 'An error occurred while fetching data.' };
    }
}

export const deleteUserById = async (_id) => 
{
    try
    {
        await User.findByIdAndDelete(_id);
        await Role.findOneAndDelete({ userId: _id });
        await UserApiUsage.findOneAndDelete({ userId: _id });
        await Story.findOneAndDelete({ userId: _id });
        
        return { success: true };
    }
    catch (error)
    {
        console.error('Delete user by id error:', error);
        return { success: false, error: 'An error occurred while deleting user.' };
    }
}
