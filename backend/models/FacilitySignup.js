const mongoose = require("mongoose");

const facilitySignupSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],

    },
    facilityName: {
      type: String,
      required: [true, "Facility Name is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    facilityAddress: {
      type: String,
      required: [true, "Facility Address is required"],
    },
    noOfBeds: {
      type: Number,
      required: [true, "Number of Beds is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approve", "reject"], 
      default: "pending", 
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("FacilitySignup", facilitySignupSchema);
