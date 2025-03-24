const mongoose = require("mongoose");

const StateTagSchema = new mongoose.Schema({
  stateData: {
    type: Map,
    of: Object, // accepts key-value object like { F001: 5, F002: 8 }
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.models.StateTag || mongoose.model("StateTag", StateTagSchema);
