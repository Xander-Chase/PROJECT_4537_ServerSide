import User from '../models/User.js';
import Role from '../models/Role.js';
import UserApiUsage from "../models/UserApiUsage.js"
import Story from "../models/Story.js";
import { Messages } from '../constants/en.js';

/**
 * Get all users, roles, and api usage data.
 * @param {string} _id - user id
 * @returns json object to represent success and error, as well as the user, role, and api usage
 */
export const adminGetEntireUserById = async (_id) => 
{
    // Get all user data
    const data = await getEntireUserbyId(_id);
    if (data.success)
    {
        // Delete stories from data
        delete data.stories;

        // Return the data
        return { success: true, user: data.user, role: data.role, apiUsage: data.apiUsage };
    }
    return { success: false, error: data.error };
}

/**
 * Get the user's entire info
 * @param {string} _id - user id
 * @returns json object to represent success and error, as well as the user, role, api usage, and stories
 */
export const getEntireUserbyId = async (_id) =>
{
    try
    {
        // Get user, role, api usage, and stories
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
        return { success: false, error: Messages.ErrorFetchingUser };
    }
}

/**
 * Fetch user by id
 * @param {string} _id - user id
 * @returns gets user data
 */
export const getUserbyId = async (_id) =>
{
    try
    {
        // Find user by id
        const user = await User.findById(_id);
        return { success: true, user: user };
    }
    catch (error)
    {
        return { success: false, error: Messages.ErrorFetchingUser };
    }
}

/**
 * Update user by id
 * @param {string} _id - user id
 * @param {obj} options - options to update
 * @returns json object to represent success and error, as well as the updated user
 */
export const updateUser = async (_id, options) =>
{
    try
    {
        // Update user by id
        const updatedUser = await User.findByIdAndUpdate(_id, options);
        return { success: true, user: updatedUser };
    }
    catch (error)
    {
        return { success: false, error: Messages.ErrorUpdatingUser };
    }
}

// Purpose: Admin Page
/**
 * Get User's Role by ID
 * @param {string} _id - user id
 * @returns json object to represent success and error, as well as the role
 */
export const getUserRoleById = async (_id) =>
{
    try
    {
        // Find role by user id
        const role = await Role.findOne({ userId: _id });
        return { success: true, role: role };
    }
    catch (error)
    {
        return { success: false, error: Messages.ErrorFetchingRole };
    }
}

// Purpose: Login Page, Dashboard Page
/**
 * Get User's API Usage by user ID
 * @param {string} _id - user id
 * @returns json object to represent success and error, as well as the api usage
 */
export const getUserApiUsageById = async (_id) =>
{
    try
    {
        // Find api usage by user id
        const apiUsage = await UserApiUsage.findOne({ userId: _id });
        return { success: true, apiUsage: apiUsage };
    }
    catch (error)
    {
        return { success: false, error: Messages.ErrorFetchingApiUsage };
    }
}

// Purpose: Dashboard Page
/**
 * Get all stories by user id
 * @param {string} _id - user id
 * @returns json object to represent success and error, as well as the stories
 */
export const getStoriesById = async (_id) =>
{
    try
    {
        // Find all stories by user id
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
        return { success: false, error: Messages.ErrorFetchingStory };
    }
}

/**
 * Update user's role by id
 * @param {string} _id - user id
 * @param {list} content - list of storyContentObjects
 * @returns json object to represent success and error, as well as the updated role
 */
export const createStory = async (_id, content) =>
{
    try
    {
        // Create new story
        const newStory = new Story({ userId: _id, content: content });
        await newStory.save();
        return { success: true, story: newStory };
    }
    catch (error)
    {
        return { success: false, error: Messages.ErrorCreatingStory };
    }
}