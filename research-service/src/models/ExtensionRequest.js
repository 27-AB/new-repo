// research-service/src/models/ExtensionRequest.js
const extensionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Research' },
  requestedBy: mongoose.Schema.Types.ObjectId,
  oldEndDate: Date,
  newEndDate: Date,
  justification: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminComments: String
});