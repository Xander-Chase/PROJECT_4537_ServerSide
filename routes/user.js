import User from '../models/User.js';
import Role from '../models/Role.js';
import UserApiUsage from "../models/UserApiUsage.js"
import Story from "../models/Story.js";

// Dont include stories
export const adminGetEntireUserById = async (_id) => 
{
    const data = await getEntireUserbyId(_id);
    if (data.success)
    {
        delete data.stories;
        return { success: true, user: data.user, role: data.role, apiUsage: data.apiUsage };
    }
    return { success: false, error: data.error };
}

export const getEntireUserbyId = async (_id) =>
{
    try
    {
        const userPayload = await getUserbyId(_id);
        const rolePayload = await getUserRoleById(_id);
        const apiUsagePayload = await getUserApiUsageById(_id);
        const storiesPayload = await getStoriesById(_id);
        return { success: true, 
            user: {
                _id: userPayload.user._id,
                username: userPayload.user.username,
                email: userPayload.user.email,
            }, 
            role: {
                role: rolePayload.role.role
            },
            apiUsage: {
                count: apiUsagePayload.apiUsage.count
            },
            stories: storiesPayload.stories
        };
    }
    catch (error)
    {
        console.error('Get user by id error:', error);
        return { success: false, error: 'An error occurred while fetching user.' };
    }
}
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
export const getStoriesById = async (_id) =>
{
    try
    {
        const stories = (await Story.find({ userId: _id })).map(
            story => {
                return {
                    _id: story._id,
                    title: story.title,
                    summary: story.summary,
                    content: story.content,
                    updated: story.updated
                };
        });
        return { success: true, stories: stories };
    }
    catch (error)
    {
        console.error('Get story by id error:', error);
        return { success: false, error: 'An error occurred while fetching story.' };
    }
}

export const createStory = async (_id, content) =>
{
    try
    {
        const newStory = new Story({ userId: _id, content: content });
        await newStory.save();
        return { success: true, story: newStory };
    }
    catch (error)
    {
        console.error('Create story error:', error);
        return { success: false, error: 'An error occurred while creating story.' };
    }
}