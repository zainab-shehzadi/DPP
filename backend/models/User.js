const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "First name is required"],
    },
    lastname: {
      type: String,
      required: [true, "Last name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    DepartmentName: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: [
        "Director", 
        "Manager", 
        "Supervisor", 
        "Staff", 
        "Assistant", 
        "Liaison"
      ], 
      required: true,
    },
    Position: {
      type: String,
    
    },
     // New fields for pricing information
     priceType: {
      type: String,
      enum: ["Basic", "Pro", "Enterprise"], // Assuming these are the options for price type
      required: [false, "Price type is required"]
    },
    priceCycle: {
      type: String,
      enum: ["Annual", "Bi-annual"], // Example cycles
      required: [false, "Price cycle is required"]
    },
    resetPasswordSlug: String,
    resetPasswordExpires: Date,

    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
