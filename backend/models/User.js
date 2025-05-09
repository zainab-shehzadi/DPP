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
      enum: [
        "business_office",
        "admissions",
        "activities",
        "maintenance",
        "dietary",
        "therapy",
        "laundry",
        "housekeeping",
        "case_management",
        "mds",
        "nursing_department",
        "administration",
        "social_services",
        "staff_development",
      ],
    },
    
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    role: {
      type: String,
      enum: ["Facility Admin", "Facility Users", "Regional Admin"],
      required: true,
    },
    
    
    Position: {
      type: String,
    
    },
     priceType: {
      type: String,
      enum: ["Basic", "Pro", "Enterprise"], 
      required: [false, "Price type is required"]
    },
    priceCycle: {
      type: String,
      enum: ["Annual", "Bi-Annual"],
      required: [false, "Price cycle is required"]
    },
    resetPasswordSlug: String,
    resetPasswordExpires: Date,

    accessToken: {
      type: String,
      default: null, 
    },

    refreshToken: {
      type: String,
      default: null,
    },
    tokenExpiry: {
      type: Date, 
    },
    status: { 
      type: String, 
      enum: ["onboarding", "pending", "verified"], 
      default: null, 
    },
    profileImage: { type: String, default: null } 

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
