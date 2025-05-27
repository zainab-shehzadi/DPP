const express = require("express");
const {
  registerUser,
  loginUser,
  updatePassowrd,
  forgotPassword,
  verifyToken,
  resetPassword,
  getAllUsers,
  createUser,
  deleteUser,
  getUserRole,
  getUserByEmail,
  editUserByEmail,
  updateProfileImage,
  getMe,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const State = require("../models/StateTag");
const StateTag = require("../models/StateTag");
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
      return res
        .status(404)
        .json({ error: "Access token or Refresh token not found" });
    }

    // ✅ Return both tokens
    res.status(200).json({
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/me", protect, getMe);
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


router.put("/change-password", protect, updatePassowrd);
router.put("/update", async (req, res) => {
  try {
    const { id } = req.body;
    const updateData = req.body;
    console.log("update ", updateData);
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/add", createUser);
router.post("/User123", getAllUsers);
router.post("/state", async (req, res) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No state data received." });
    }

    const currentDate = new Date();

    const stateData = {};
    for (const [state, tags] of Object.entries(data)) {
      if (tags && typeof tags === "object" && Object.keys(tags).length > 0) {
        stateData[state] = tags;
      }
    }

    if (Object.keys(stateData).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid state tag data found." });
    }

    const newStateDoc = new State({
      stateData,
      date: currentDate,
    });

    await newStateDoc.save();

    res.status(201).json({ message: "States added successfully!" });
  } catch (error) {
    console.error("❌ Error inserting states:", error); // LOG actual error
    res.status(500).json({
      message: "Error inserting states",
      error: error.message || error,
    });
  }
});
router.post("/state/tags", async (req, res) => {
  try {
    const { stateName, days = 30 } = req.body;
    console.log("📥 Request Body:", req.body);

    if (!stateName) {
      return res.status(400).json({ error: "State name is required" });
    }

    const now = new Date();
    let startDate, expectedMonths;

    switch (days) {
      case 30:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        expectedMonths = 1;
        break;
      case 60:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        expectedMonths = 2;
        break;
      case 90:
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        expectedMonths = 3;
        break;
      case 180:
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        expectedMonths = 6;
        break;
      default:
        return res.status(400).json({ error: "Unsupported days value." });
    }

    const docs = await StateTag.find({
      date: { $gte: startDate, $lte: now },
    }).sort({ date: -1 });

    console.log("📄 Docs Found:", docs.length);

    const mergedTags = {};

    for (const doc of docs) {
      const tagMap = doc.stateData?.get(stateName); // still fine

      if (!tagMap) {
        console.log(
          `⚠️ No tagMap for state: ${stateName} in document ${doc._id}`
        );
        continue;
      }
      console.log(
        "🧪 tagMap type:",
        typeof tagMap,
        Array.isArray(tagMap),
        tagMap
      );

      const plainTagMap = JSON.parse(JSON.stringify(tagMap));

      for (const [tagKey, tagObj] of Object.entries(plainTagMap)) {
        if (!mergedTags[tagKey]) {
          mergedTags[tagKey] = {
            Tag: tagObj.Tag,
            Count: tagObj.Count,
            Description: tagObj.Description,
          };
        } else {
          mergedTags[tagKey].Count += tagObj.Count;
        }
      }
    }

    console.log("✅ Final Merged Tags:", mergedTags);

    if (Object.keys(mergedTags).length === 0) {
      return res
        .status(404)
        .json({ error: `No tags found for state: ${stateName}` });
    }

    return res.status(200).json({
      state: stateName,
      tag: mergedTags,
      periodStart: startDate,
      periodEnd: now,
      availableMonths: docs.length,
      expectedMonths,
    });
  } catch (error) {
    console.error("❌ Error fetching state tag:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});
router.post("/upload-profile-image", protect, updateProfileImage);

router.post("/get-profile-image", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.profileImage) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.status(200).json({ profileImage: user.profileImage });
  } catch (error) {
    console.error("Error fetching profile image:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
