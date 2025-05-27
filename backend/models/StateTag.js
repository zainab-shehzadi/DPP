const mongoose = require("mongoose");

// Inner tag schema for each tag entry (e.g., f582, f880)
const TagSchema = new mongoose.Schema({
  Tag: { type: String, required: true },
  Count: { type: Number, required: true },
  Description: { type: String, required: true },
}, { _id: false });


const StateDataSchema = new mongoose.Schema({
  type: Map,
  of: TagSchema,
}, { _id: false });


const StateTagSchema = new mongoose.Schema({
  stateData: {
    type: Map,
    of: StateDataSchema,
    default: {}
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
});

module.exports = mongoose.models.StateTag || mongoose.model("StateTag", StateTagSchema);
