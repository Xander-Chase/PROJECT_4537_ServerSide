import User from '../models/User.js';
import Role from '../models/Role.js';
import UserApiUsage from "../models/UserApiUsage.js"
import Story from "../models/Story.js";

export const getUserbyId = async (_id) =>
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
}

export const updateUser = async (_id, options) =>
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

// Purpose: Admin Page
export const getUserRoleById = async (_id) =>
{
    try
    {
        const role = await Role.findOne({ userId: _id });
        return { success: true, role: role };
    }
    catch (error)
    {
        console.error('Get role by id error:', error);
        return { success: false, error: 'An error occurred while fetching role.' };
    }
}

// Purpose: Login Page, Dashboard Page
export const getUserApiUsageById = async (_id) =>
{
    try
    {
        const apiUsage = await UserApiUsage.findOne({ userId: _id });
        return { success: true, apiUsage: apiUsage };
    }
    catch (error)
    {
        console.error('Get api usage by id error:', error);
        return { success: false, error: 'An error occurred while fetching api usage.' };
    }
}

// Purpose: Dashboard Page
export const getStoryById = async (_id) =>
{
    try
    {
        const story = await Story.findOne({ userId: _id });
        return { success: true, story: story };
    }
    catch (error)
    {
        console.error('Get story by id error:', error);
        return { success: false, error: 'An error occurred while fetching story.' };
    }
}