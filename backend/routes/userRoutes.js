const express = require("express");
const { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  verifyToken, 
  resetPassword ,
  getAllUsers,
  createUser,
  deleteUser,
  getUserRole,
  getUserByEmail,
  editUserByEmail
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const State = require("../models/StateTag"); 

const router = express.Router();

router.get("/get-access-token", async (req, res) => {
  try {
    const { email } = req.query; 
    console.log("Fetching tokens for email:", email);

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Fetch user from database
    const user = await User.findOne({ email });

    if (!user || !user.accessToken || !user.refreshToken) {
      return res.status(404).json({ error: "Access token or Refresh token not found" });
    }

    // ✅ Return both tokens
    res.status(200).json({ 
      accessToken: user.accessToken,
      refreshToken: user.refreshToken 
    });

  } catch (error) {
    console.error("Error fetching tokens:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/role", getUserRole);

router.post("/email", getUserByEmail);

router.post("/signup", registerUser);

router.post("/login", loginUser);

router.put("/email", editUserByEmail);

router.delete("/delete", deleteUser);

router.post("/forgot-password", forgotPassword);

router.post("/verify-token", verifyToken);

router.post("/reset-password", resetPassword);

router.get("/profile", protect, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}` });
});
router.post("/fetch", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error); // Log error for debugging
    res.status(500).json({ message: "Error fetching user data", error });
  }
});

router.put("/update", async (req, res) => {
  try {
    const { id } = req.body;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post('/add', createUser); 

router.get('/User123', getAllUsers); 

router.post("/state", async (req, res) => {
    try {
        const data = req.body; // Receive JSON data

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ message: "State and tags are required" });
        }

        // Convert JSON object into an array of state documents
        const formattedData = Object.entries(data).map(([state, tags]) => ({
            state,
            tags
        }));

        // Insert multiple states into MongoDB
        await State.insertMany(formattedData);

        return res.status(201).json({ message: "States added successfully!" });
    } catch (error) {
        console.error("Error inserting states:", error);
        return res.status(500).json({ message: "Error inserting states", error });
    }
});


router.post("/state/tags", async (req, res) => {
  try {
    const { stateName } = req.body; 
    if (!stateName) {
      return res.status(400).json({ error: "State name is required" });
    }
    const stateData = await State.findOne({ state: stateName });

    if (!stateData) {
      return res.status(404).json({ error: "State not found" });
    }
    res.status(200).json({ tags: stateData.tags });
  } catch (error) {
    console.error("❌ Error fetching state tags:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});


module.exports = router;
