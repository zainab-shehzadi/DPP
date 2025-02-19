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

const router = express.Router();

router.get("/get-access-token", async (req, res) => {
  try {
    const { email } = req.query; // ✅ Get email from query params
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
router.get("/role/:email", getUserRole);

router.get("/email/:email", getUserByEmail);

router.post("/signup", registerUser);

router.post("/login", loginUser);

router.put("/email/:email", editUserByEmail);

router.delete("/:id", deleteUser);

router.post("/forgot-password", forgotPassword);

router.post("/verify-token", verifyToken);

router.post("/reset-password", resetPassword);

router.get("/profile", protect, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}` });
});

router.get("/fetch/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data", error });
  }
});
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
});

router.post('/add', createUser); 

router.get('/User123', getAllUsers); 
module.exports = router;
