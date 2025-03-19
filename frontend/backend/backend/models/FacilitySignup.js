const mongoose = require("mongoose");

const facilitySignupSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    facilityName: {
      type: String,
      required: [true, "Facility Name is required"],
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
      enum: ["pending", "approve", "reject"], // Only accept these values
      default: "pending", // Default value is pending
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model("FacilitySignup", facilitySignupSchema);
