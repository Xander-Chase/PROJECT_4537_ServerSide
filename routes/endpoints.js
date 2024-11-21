import Endpoint from "../models/Endpoints";

// this contains
// creation of Endpoint
// incrementing the count of the endpoint...
// this checks first if the endpoint exists, if it does, it increments the count, if not, it creates the endpoint

const createEndpoint = async (method, endpoint) => 
{
    try
    {
        const newEndpoint = new Endpoint({ method, endpoint });
        await newEndpoint.save();
        return { success: true, endpoint: newEndpoint };
    } catch (error)
    {
        console.error('Create endpoint error:', error);
        return { success: false, error: 'An error occurred while creating endpoint.' };
    }
}

export const incrementEndpointCount = async (method, endpoint) => 
{
    try
    {
        const existingEndpoint = await Endpoint.findOne({ method, endpoint });
        if (existingEndpoint)
        {
            existingEndpoint.count += 1;
            await existingEndpoint.save();
            return { success: true, endpoint: existingEndpoint };
        }
        else
            return await createEndpoint(method, endpoint);
    }
    catch (error)
    {
        console.error('Increment endpoint count error:', error);
        return { success: false, error: 'An error occurred while incrementing endpoint count.' };
    }
}