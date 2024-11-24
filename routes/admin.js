import User from '../models/User.js';
import Endpoint from '../models/Endpoints.js';
import Role from '../models/Role.js';
import UserApiUsage from "../models/UserApiUsage.js"
import Story from '../models/Story.js';
import { adminGetEntireUserById} from './user.js';

export const getAll = async () => {
    try {
        const allUsers = await User.find().exec();
        let userData = [];
        for (let user of allUsers)
        {
            const payload = await adminGetEntireUserById(user._id);
            if (!payload.success)
                throw new Error(payload.error);
            userData.push({
                user: payload.user,
                role: payload.role,
                apiUsage: payload.apiUsage,
            });
        }
            
        const endpoints = await Endpoint.find().exec();
        return { success: true, endpoints, data: userData};
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
