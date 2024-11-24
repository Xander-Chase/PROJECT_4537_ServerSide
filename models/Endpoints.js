import mongoose from 'mongoose';

// Collection name for Endpoints
const COLLECTIONNAME = "Endpoints";

// Schema for Endpoints
const EndpointSchema = new mongoose.Schema({
  method: { type: String, required: true}, // ex. "GET", "POST", "PUT", "DELETE"
  endpoint: { type: String, required: true}, // ex. "/api/v1/users"
  count: {type: Number, default: 1} // Number of times this endpoint has been accessed
});

// Model for Endpoints, to be used in controllers
const Endpoint = mongoose.model(COLLECTIONNAME, EndpointSchema);

// Export the model
export default Endpoint;