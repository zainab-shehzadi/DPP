const mongoose = require("mongoose");

const StateTagSchema = new mongoose.Schema({
  stateData: {
    type: Map,
    of: Object, 
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.models.StateTag || mongoose.model("StateTag", StateTagSchema);
