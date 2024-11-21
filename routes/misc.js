import Story from "../models/Story.js";
import UserApiUsage from "../models/UserApiUsage.js";

// Update a story by userId
// Update user api usage by Id

// this will update, title, summary, and content
// for content, it handles 
// adding an element
// deleting an element
export const updateStoryByUserId = async (_id, options) => 
{
    try
    {
        const updatedStory = await Story.findOneAndUpdate({ userId: _id }, options, { new: true });
        return { success: true, story: updatedStory };
    } catch (error)
    {
        console.error('Update story by id error:', error);
        return { success: false, error: 'An error occurred while updating story.' };
    }
}

// this will update the api usage, its just decrementing the api usage count by 1, you dont need options
export const decreaseApiUsageByUserId = async (_id) =>
{
    try
    {
        const apiUsage = await UserApiUsage.findOne({ userId: _id });
        apiUsage.count -= 1;
        await apiUsage.save();
        return { success: true, apiUsage: apiUsage };
    } catch (error)
    {
        console.error('Update api usage by id error:', error);
        return { success: false, error: 'An error occurred while updating api usage.' };
    }
}