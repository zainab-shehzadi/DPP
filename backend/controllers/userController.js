const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Admin = require("../models/adminModel");
const path = require("path");
const resetCodeTemplate = require("../utils/emailTemplates/verifycode");

const updateProfileImage = async (req, res) => {
  try {
    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({
        status: "error",
        message: "Profile image is required",
      });
    }

    const isBase64 = /^data:image\/(png|jpeg|jpg|webp);base64,/.test(
      profileImage
    );
    if (!isBase64) {
      return res.status(400).json({
        status: "error",
        message: "Invalid image format (must be base64)",
      });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    user.profileImage = profileImage;
    await user.save();

    console.log("✅ Profile image updated successfully");
    return res.status(200).json({
      status: "success",
      message: "Profile image updated successfully",
      profileImage: user.profileImage,
    });
  } catch (error) {
    if (error.type === "entity.too.large") {
      return res.status(413).json({
        status: "error",
        message: "Image size exceeds 1MB. Please upload a smaller image.",
      });
    }

    console.error("❌ Error updating image:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

const generate6DigitToken = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  const {
    DepartmentName,
    firstName,
    lastName,
    position,
    email,
    role,
    password,
    facilityName,
  } = req.body;

  try {
    if (!firstName || !lastName || !email || !role || !password ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      DepartmentName,
      Position: position,
      firstname: firstName,
      lastname: lastName,
      email,
      role,
      password: hashedPassword,
      facilityName,
      status: "onboarding",
    });
    console.log("User created successfully:", user);

    if (user) {
      res.status(201).json({
        _id: user.id,
        DepartmentName: user.DepartmentName,
        Position: user.Position,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        facilityName: user.facilityName,
        status: user.status,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// const registerUser = async (req, res) => {
//   const {
//     DepartmentName,
//     firstName,
//     lastName,
//     position,
//     email,
//     role,
//     password,
//     confirmPassword,
//   } = req.body;

//   try {
//     if (
//       !DepartmentName ||
//       !position ||
//       !firstName ||
//       !lastName ||
//       !email ||
//       !role ||
//       !password ||
//       !confirmPassword
//     ) {
//       console.log("Validation failed: Missing required fields.");
//       return res.status(400).json({ message: "All fields are required" });
//     }
//     // Check if passwords match
//     if (password !== confirmPassword) {
//       console.log("Validation failed: Passwords do not match.");
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     // Check if the user already exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       console.log("Validation failed: User already exists with email:", email);
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = await User.create({
//       DepartmentName,
//       Position: position,
//       firstname: firstName,
//       lastname: lastName,
//       email,
//       role,
//       password: hashedPassword,
//       status: "onboarding",
//     });
//     if (user) {
//       res.status(201).json({
//         _id: user.id,
//         DepartmentName: user.DepartmentName,
//         Position: user.Position,
//         firstname: user.firstname,
//         lastname: user.lastname,
//         email: user.email,
//         role: user.role,
//         status: user.status,
//         token: generateToken(user.id),
//       });
//     } else {
//       console.log("User creation failed: Invalid user data.");
//       res.status(400).json({ message: "Invalid user data" });
//     }
//   } catch (error) {
//     console.error("Error creating user:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Check email in both User and Admin collections
    const [user, admin] = await Promise.all([
      User.findOne({ email }),
      Admin.findOne({ email }),
    ]);

    if (user && (await bcrypt.compare(password, user.password))) {
      const responseData = {
        _id: user.id,
        name: user.firstname, // ✅ Fix: Ensure 'name' field is included
        email: user.email,
        role: user.role,
        DepartmentName: user.DepartmentName,
        priceType: user.priceType || null,
        priceCycle: user.priceCycle || null,
        token: generateToken(user.id),
      };

      return res.status(200).json(responseData);
    }

    if (admin && (await bcrypt.compare(password, admin.password))) {
      const responseData = {
        email: admin.email,
        name: admin.name || "Admin", // ✅ Fix: Ensure name is properly assigned
        role: "admin",
        token: generateToken(admin.id),
      };
      return res.status(200).json(responseData);
    }

    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user._id; // populated by auth middleware
    const user = await User.findById(userId); // exclude sensitive fields

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = generate6DigitToken();
    console.log(resetToken);
    user.resetPasswordSlug = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Send email with the reset token
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verification Code",
      html: resetCodeTemplate({
        name: user.firstname || email,
        code: resetToken,
      }),
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Verification code sent successfully!" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
};
const verifyToken = async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ message: "Email and token are required." });
  }

  try {
    // Find the user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure the token is valid and not expired
    if (!user.resetPasswordSlug || user.resetPasswordSlug !== token) {
      return res.status(400).json({ message: "Invalid token." });
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Token has expired." });
    }

    // Update user's status to "verified"
    user.status = "verified";
    await user.save();

    // Token is valid, status updated successfully
    res.status(200).json({
      message: "Token verified successfully!",
      userStatusUpdated: user.status, // Confirm status update
    });
  } catch (error) {
    console.error("Error in verifyToken:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Failed to verify token." });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email and new password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset-related fields
    user.password = hashedPassword;
    user.resetPasswordSlug = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" }); // Always return JSON
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};
const createUser = async (req, res) => {
  try {
    const { firstname, lastname, email, role, position, DepartmentName } =
      req.body;

    console.log("Incoming request body:", req.body);

    if (!firstname || !lastname || !email || !role || !position) {
      console.error("Validation Error: Missing required fields", {
        firstname,
        lastname,
        email,
        role,
        position,
      });
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn("Validation Error: Email already exists", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("12345678", saltRounds);

    const user = new User({
      firstname,
      lastname,
      email,
      role,
      Position: position,
      password: hashedPassword,
      DepartmentName: DepartmentName,
    });

    await user.save();

    console.log("User successfully saved:", user);

    res.status(201).json({
      message: "User successfully added",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        Position: user.Position,
      },
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res
      .status(500)
      .json({ message: "Error adding user", error: error.message });
  }
};

const updatePassowrd = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate that both currentPassword and newPassword are provided
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user ID missing." });
    }

    // Find the user by ID
    const user = await User.findById(userId);

    // If the user is not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided current password with the stored password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    // If the current password doesn't match the stored password
    if (!passwordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    // Respond with a success message
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    // Log the error and respond with a generic error message
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;

    console.log("Received DELETE request for ID:", id);

    // Find and delete the user
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      console.log(`User with ID ${id} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`User with ID ${id} deleted successfully`);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      firstName: user.firstname,
      lastName: user.lastname,
      gender: user.gender,
      Position: user.Position,
      role: user.role,
      DepartmentName: user.DepartmentName,
    });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({
      message: "Failed to fetch user data",
      error: error.message,
    });
  }
};
const getUserRole = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found for email:", email); // Debugging log
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User role fetched:", user.role); // Debugging log
    res.status(200).json({ role: user.role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user role", error: error.message });
  }
};
const editUserByEmail = async (req, res) => {
  try {
    const { email, firstname, lastname, Position, DepartmentName } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        firstname,
        lastname,
        // role,
        Position,
        DepartmentName,
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found with email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Updated user data:", updatedUser);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error.message);
    return res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfileImage,
  forgotPassword,
  resetPassword,
  updatePassowrd,
  verifyToken,
  getAllUsers,
  createUser,
  deleteUser,
  getUserRole,
  getUserByEmail,
  editUserByEmail,
  getMe,
};
