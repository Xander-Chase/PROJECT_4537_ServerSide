import mongoose from 'mongoose';

const COLLECTIONNAME = "Endpoints";


const EndpointSchema = new mongoose.Schema({
  method: { type: String, required: true},
  endpoint: { type: String, required: true},
  count: {type: Number, default: 1}
});

const Endpoint = mongoose.model(COLLECTIONNAME, EndpointSchema);
export default Endpoint;