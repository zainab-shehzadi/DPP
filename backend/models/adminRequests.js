// models/RegionalAdminRequest.js
const mongoose = require("mongoose");

const RegionalAdminRequestSchema = new mongoose.Schema({
  facilityAdmin: {
    _id: mongoose.Schema.Types.ObjectId,
    firstname: String,
    lastname: String,
    email: String,
    facilityCode: String,
    facilityName: String,
    facilityAddress: String,
    departmentName: String,
    position: String,
    status: String,
    priceType: String,
    priceCycle: String,
  },
  requestType: {
    type: String,
    default: "Regional Admin Creation",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "approve", "rejected"],
    default: "pending",
  },
});

module.exports = mongoose.model("RegionalAdminRequest", RegionalAdminRequestSchema);
