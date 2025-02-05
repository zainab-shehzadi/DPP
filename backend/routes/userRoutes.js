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

const router = express.Router();
router.get("/role/:email", getUserRole);
// Route to get user by email
router.get("/email/:email", getUserByEmail);
// User Signup Route
router.post("/signup", registerUser);
// User Login Route
router.post("/login", loginUser);

router.put("/email/:email", editUserByEmail);
//delete password
router.delete("/:id", deleteUser);
//Forgot Password Route
router.post("/forgot-password", forgotPassword);

//Verify Token Route
router.post("/verify-token", verifyToken);

router.post("/reset-password", resetPassword);
//Protected Route Example (only accessible with a valid token)
router.get("/profile", protect, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}` });
});

router.post('/add', createUser); // Route to add a new user

router.get('/User123', getAllUsers); // Get all users
module.exports = router;
