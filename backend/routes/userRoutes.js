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
  editUserByEmail,
  updateProfileImage,
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
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No state data received." });
    }

    const currentDate = new Date();

    const stateData = {};
    for (const [state, tags] of Object.entries(data)) {
      if (
        tags &&
        typeof tags === "object" &&
        Object.keys(tags).length > 0
      ) {
        stateData[state] = tags;
      }
    }

    if (Object.keys(stateData).length === 0) {
      return res.status(400).json({ message: "No valid state tag data found." });
    }

    const newStateDoc = new State({
      stateData,
      date: currentDate
    });

    await newStateDoc.save();

    res.status(201).json({ message: "States added successfully!" });
  } catch (error) {
    console.error("❌ Error inserting states:", error); // LOG actual error
    res.status(500).json({
      message: "Error inserting states",
      error: error.message || error
    });
  }
});

// router.post("/state/tags", async (req, res) => {
//   try {
//     const { stateName } = req.body;

//     if (!stateName) {
//       return res.status(400).json({ error: "State name is required" });
//     }

//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

//     const stateDoc = await State.findOne({
//       date: { $gte: startOfMonth, $lt: endOfMonth }
//     }).sort({ date: -1 });

//     if (!stateDoc) {
//       return res.status(404).json({ error: "No data found for current month" });
//     }

//     if (!stateDoc.stateData.has(stateName)) {
//       return res.status(404).json({ error: `No tag found for state: ${stateName}` });
//     }

//     const tagObject = stateDoc.stateData.get(stateName); // ✅ Corrected

//     res.status(200).json({
//       state: stateName,
//       tag: tagObject,
//       date: stateDoc.date
//     });

//   } catch (error) {
//     console.error("❌ Error fetching state tag:", error);
//     res.status(500).json({
//       error: "Internal server error",
//       details: error.message
//     });
//   }
// });

router.post("/state/tags", async (req, res) => {
  try {
    const { stateName, days = 30 } = req.body;

    if (!stateName) {
      return res.status(400).json({ error: "State name is required" });
    }

    const now = new Date();
    let startDate;
    let expectedMonths;

    if (days === 30) {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      expectedMonths = 1;
    } else if (days === 60) {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      expectedMonths = 2;
    } else if (days === 90) {
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      expectedMonths = 3;
    } else if (days === 180) {
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      expectedMonths = 6;
    } else {
      return res.status(400).json({ error: "Unsupported days value." });
    }

    // Fetch documents within date range
    const docs = await State.find({
      date: { $gte: startDate, $lte: now }
    }).sort({ date: -1 });

    const availableMonths = docs.length;
    const mergedTags = {};

    for (const doc of docs) {
      const tagMap = doc.stateData?.get(stateName);
      if (tagMap) {
        for (const [tag, count] of Object.entries(tagMap)) {
          mergedTags[tag] = (mergedTags[tag] || 0) + count;
        }
      }
    }

    if (Object.keys(mergedTags).length === 0) {
      return res.status(404).json({ error: `No tags found for state: ${stateName}` });
    }


    res.status(200).json({
      state: stateName,
      tag: mergedTags,
      periodStart: startDate,
      periodEnd: now,
    
    });

  } catch (error) {
    console.error("❌ Error fetching state tag:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
});


router.post('/upload-profile-image', updateProfileImage);

router.post('/get-profile-image', async (req, res) => {
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
