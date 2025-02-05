const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");


const generate6DigitToken = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generates a random 6-digit number
};
// Function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token validity
  });
};

// Register User and Store in Database
const registerUser = async (req, res) => {
  const {
    DepartmentName,
    firstName,
    lastName,
    position,
    email,
    role,
    password,
    confirmPassword,
  } = req.body;


  console.log("Position being sent:", position);

  try {
    console.log("Incoming data:", {
      DepartmentName,
      firstName,
      lastName,
      position,
      email,
      role,
      password,
      confirmPassword,
    });
    

    // Validate all required fields
    if (
      !DepartmentName ||
      !position ||
      !firstName ||
      !lastName ||
      !email ||
      !role ||
      !password ||
      !confirmPassword
    ) {
      console.log("Validation failed: Missing required fields.");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      console.log("Validation failed: Passwords do not match.");
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("Validation failed: User already exists with email:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Password hashed successfully.");

    // Create and store the user in the database
    console.log("Creating user in the database...");
    const user = await User.create({
      DepartmentName,
      Position: position, // Map `position` to `Position` in schema
      firstname: firstName,
      lastname: lastName,
      email,
      role,
      password: hashedPassword,
    });

    // Respond with the created user data
    if (user) {
      console.log("User created successfully:", {
        _id: user.id,
        DepartmentName: user.DepartmentName,
        Position: user.Position,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      });
      res.status(201).json({
        _id: user.id,
        DepartmentName: user.DepartmentName,
        Position: user.Position,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        token: generateToken(user.id), // Assuming a JWT token generator
      });
    } else {
      console.log("User creation failed: Invalid user data.");
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check for user in the database
//     const user = await User.findOne({ email });

//     if (user && (await bcrypt.compare(password, user.password))) {
//       // Create the response data
//       const responseData = {
//         _id: user.id,
//         email: user.email,
//         role: user.role, // Include the user's role
//         DepartmentName : user.DepartmentName,
//         token: generateToken(user.id), // Generate JWT token
//       };

//       // Log the response data to the console
//       console.log("Response Data: ", responseData); // This will show the data in the server console

//       // Send the response with user data
//       res.status(200).json(responseData);
//     } else {
//       // If credentials are invalid, send an error
//       res.status(401).json({ message: "Invalid email or password" });
//     }
//   } catch (error) {
//     // Handle any errors during the process
//     res.status(500).json({ message: error.message });
//   }
// };


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user in the database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create the response data
      const responseData = {
        _id: user.id,
        email: user.email,
        role: user.role, // Include the user's role
        DepartmentName: user.DepartmentName,
        priceType: user.priceType || null, // Include priceType, null if not found
        priceCycle: user.priceCycle || null, // Include priceCycle, null if not found
        token: generateToken(user.id), // Generate JWT token
      };

      // Log the response data to the console
      console.log("Response Data: ", responseData); // This will show the data in the server console

      // Send the response with user data and pricing details
      res.status(200).json(responseData);
    } else {
      // If credentials are invalid, send an error
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: error.message });
  }
};

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

    // Generate a 6-digit token
    const resetToken = generate6DigitToken();
    console.log(resetToken);
    // Save the plain token and expiration in the user document
    user.resetPasswordSlug = resetToken; // Save plain token directly
    user.resetPasswordExpires = Date.now() + 3600000; // Valid for 1 hour
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
      subject: "Password Reset Verification Code",
      html: `<p>Your verification code is:</p>
             <h3>${resetToken}</h3>
             <p>This code is valid for 1 hour. If you did not request this, please ignore this email.</p>`,
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
    return res.status(400).json({ message: "Email and token are required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the provided token matches the stored token and if it hasn't expired
    if (
      user.resetPasswordSlug !== token ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Token is valid, proceed to reset password
    res.status(200).json({ message: "Token verified successfully!" });
  } catch (error) {
    console.error("Error in verifyToken:", error);
    res.status(500).json({ message: "Failed to verify token" });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required" });
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


// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude the password field
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};


const createUser = async (req, res) => {
  try {
    const { firstname, lastname, email, role, position, DepartmentName } = req.body;

    console.log("Incoming request body:", req.body);

    if (!firstname || !lastname || !email || !role || !position) {
      console.error("Validation Error: Missing required fields", { firstname, lastname, email, role, position });
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn("Validation Error: Email already exists", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the default password "123" using bcrypt
    const saltRounds = 10; // You can adjust the salt rounds as needed
    const hashedPassword = await bcrypt.hash("123", saltRounds);

    const user = new User({
      firstname,
      lastname,
      email,
      role,
      Position: position, // Map `position` to `Position` in schema
      password: hashedPassword, // Store the hashed password
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
    res.status(500).json({ message: "Error adding user", error: error.message });
  }
};


// Controller Function to Delete a User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

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
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};


// Controller to fetch user details by email
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    console.log("Fetching user for email:", email); // Debugging log

    // Fetch user from the database
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found for email:", email); // Debugging log
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User details fetched:", user); // Debugging log
    res.status(200).json({
      firstName: user.firstname,
      lastName: user.lastname,
      gender: user.gender, // Assuming gender is in the schema
      position: user.Position,
      role: user.role,
    
      departmentName: user.DepartmentName, // Added DepartmentName
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
    const { email } = req.params;

    console.log("Fetching role for email:", email); // Debugging log

    // Fetch user by email instead of ID
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found for email:", email); // Debugging log
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User role fetched:", user.role); // Debugging log
    res.status(200).json({ role: user.role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    res.status(500).json({ message: "Failed to fetch user role", error: error.message });
  }
};


const editUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { firstname, lastname, role, Position, DepartmentName } = req.body;

    // Log the incoming data for debugging
    console.log("Received data for update:", { email, firstname, lastname, role, Position, DepartmentName });

    // Find and update the user in the database
    const updatedUser = await User.findOneAndUpdate(
      { email }, // Search by email
      {
        firstname,  // Update first name
        lastname,   // Update last name
        role,       // Update role
        Position,   // Update position
        DepartmentName, // Update department name
      },
      { new: true } // Return the updated user document
    );

    // If the user is not found, send a 404 error
    if (!updatedUser) {
      console.log("User not found with email:", email); // Debugging log
      return res.status(404).json({ message: "User not found" });
    }

    // Log the updated user data for debugging
    console.log("Updated user data:", updatedUser); 

    // Respond with the updated user
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error.message); // Debugging log
    return res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};



module.exports =
 { registerUser,
   loginUser,
   forgotPassword,
   resetPassword,
   verifyToken,
   getAllUsers ,
   createUser,
   deleteUser,
   getUserRole,
   getUserByEmail,
   editUserByEmail
  };
