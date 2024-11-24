import { Messages } from "../constants/en.js";
import Endpoint from "../models/Endpoints.js";

// this contains
// creation of Endpoint
// incrementing the count of the endpoint...
// this checks first if the endpoint exists, if it does, it increments the count, if not, it creates the endpoint

/**
 * Creates endpoint to database
 * @param {string} method 
 * @param {string} endpoint 
 * @returns json object to represent success and error, as well as the new endpoint
 */
const createEndpoint = async (method, endpoint) => 
{
    try
    {
        // Create new endpoint
        const newEndpoint = new Endpoint({ method, endpoint });

        // Save new endpoint
        await newEndpoint.save();
        return { success: true, endpoint: newEndpoint };
    } catch (error)
    {
        return { success: false, error: Messages.ErrorCreatingEndpoint };
    }
}

/**
 * Increments the count of the endpoint when called
 * @param {string} method 
 * @param {string} endpoint 
 * @returns json object to represent success and error, as well as the endpoint
 */
const incrementEndpointCount = async (method, endpoint) => 
{
    try
    {
        // Find existing endpoint
        const existingEndpoint = await Endpoint.findOne({ method, endpoint });
        if (existingEndpoint)
        {
            // Increment count
            existingEndpoint.count += 1;

            // Save existing endpoint
            await existingEndpoint.save();
            return { success: true, endpoint: existingEndpoint };
        }
        else
            return await createEndpoint(method, endpoint);
    }
    catch (error)
    {
        return { success: false, error: Messages.ErrorIncrementingEndpoint };
    }
}

// export the function
export default incrementEndpointCount;