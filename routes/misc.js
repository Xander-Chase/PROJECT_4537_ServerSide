import { Messages } from "../constants/en.js";
import Story from "../models/Story.js";
import UserApiUsage from "../models/UserApiUsage.js";

// Update a story by userId
// Update user api usage by Id

// this will update, title, summary, and content
// for content, it handles 
// adding an element

/**
 * Updates story by user id
 * @param {string} _id - user id
 * @param {obj} options - options to update
 * @returns json object to represent success and error, as well as the updated story
 */
export const updateStoryByUserId = async (_id, options) => 
{
    try
    {
        // Find story by user id
        const updatedStory = await Story.findOneAndUpdate({ userId: _id }, options, { new: true });
        return { success: true, story: updatedStory };
    } catch (error)
    {
        return { success: false, error: Messages.ErrorUpdatingStory };
    }
}

/**
 * Updates story by story id
 * @param {string} _id - story id
 * @param {obj} options - options to update
 * @returns json object to represent success and error, as well as the updated story
 */
export const updateStoryById = async (_id, options) =>
{
    try
    {
        // Find story by story id
        const updatedStory = await Story.findOneAndUpdate({ _id: _id }, options, { new: true });
        return { success: true, story: updatedStory };
    } catch (error)
    {
        return { success: false, error: Messages.ErrorUpdatingStory };
    }
}

/**
 * Deletes story by story id
 * @param {string} _id - story id
 * @returns success status and error
 */
export const deleteStoryByStoryId = async (_id) =>
{
    try
    {
        await Story.deleteOne({_id: _id});
        return { success: true };
    }
    catch (error)
    {
        return { success: false, error: Messages.ErrorDeletingStory };
    }
}

// this will update the api usage, its just decrementing the api usage count by 1, you dont need options

/**
 * Decreases the api usage count by 1
 * @param {string} _id - user id
 * @returns json object to represent success and error, as well as the updated api usage
 */
export const decreaseApiUsageByUserId = async (_id) =>
{
    try
    {
        // Find api usage by user id
        const apiUsage = await UserApiUsage.findOne({ userId: _id });
        apiUsage.count -= 1;
        await apiUsage.save();
        return { success: true, apiUsage: apiUsage };
    } catch (error)
    {
        return { success: false, error: Messages.ErrorDecreasingApiUsage };
    }
}