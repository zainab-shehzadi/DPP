const mongoose = require("mongoose");

const StateTagSchema = new mongoose.Schema({
    state: { type: String, required: true, unique: true },
    tags: { type: Object, required: true }
});


module.exports = mongoose.models.StateTag || mongoose.model("StateTag", StateTagSchema);
