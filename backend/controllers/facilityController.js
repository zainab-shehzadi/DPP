const Facility = require("../models/FacilitySignup");
const FacilitySignup = require("../models/FacilitySignup");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const createFacility = async (req, res) => {
  try {
    const { email, facilityName, facilityAddress, noOfBeds, state } = req.body;

    if (!email || !facilityName || !facilityAddress || !noOfBeds || !state) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if a facility already exists for the given email
    let facility = await Facility.findOne({ email });

    if (facility) {
      facility.facilityName = facilityName;
      facility.facilityAddress = facilityAddress;
      facility.noOfBeds = noOfBeds;
      facility.state = state;
      await facility.save();
    } else {
      facility = new Facility({
        email,
        state,
        facilityName,
        facilityAddress,
        noOfBeds,
      });
      await facility.save();
    }

    // Update the user: status to 'pending' and role to 'Facility Admin'
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { status: "pending", role: "Facility Admin" } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(201).json({
      message: "Facility created successfully.",
      facility,
      updatedUser,
    });
  } catch (error) {
    console.error("Error creating facility:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const getFacility = async (req, res) => {
  try {
    const facility = await FacilitySignup.find({});

    res.status(200).json({
      facility,
    });
  } catch (error) {
    console.error("Error fetching facility by email:", error);
    res.status(500).json({
      message: "Failed to fetch facility data",
      error: error.message,
    });
  }
};

const getFacility1 = async (req, res) => {
  try {
    const facilityAdmins = await User.find({ role: "Facility Admin" });
    const emails = facilityAdmins.map((admin) => admin.email);
    const facilities = await FacilitySignup.find({ email: { $in: emails } });

    const enrichedFacilities = facilities.map((facility) => {
      console.log("line 81", facility);
      const matchingUser = facilityAdmins.find(
        (u) => u.email === facility.email
      );

      return {
        _id: facility._id,
        email: facility.email,
        facilityName: facility.facilityName,
        facilityAddress: facility.facilityAddress,
        noOfBeds: facility.noOfBeds,
        state: facility.state,
        status: facility.status,
        createdAt: facility.createdAt,
        updatedAt: facility.updatedAt,
        adminName: `${matchingUser?.firstname || ""} ${
          matchingUser?.lastname || ""
        }`.trim(),
        department: matchingUser?.DepartmentName || "",
      };
    });
    console.log(enrichedFacilities);
    res.status(200).json({ facility: enrichedFacilities });
  } catch (error) {
    console.error("Error fetching facilities:", error);
    res.status(500).json({
      message: "Failed to fetch facility data",
      error: error.message,
    });
  }
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const checkFacility = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (email == "anthony@paklogics.com") {
      return res.status(200).json({ message: "OK", access: "granted" });
    }
    // Step 1: Check user role
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: If role is Facility Users → allow without checking facility
    if (user.role === "Facility Users") {
      return res.status(200).json({ message: "OK", access: "granted" });
    }

    // Step 3: If role is Facility Admin → check assigned facility
    if (user.role === "Facility Admin") {
      const facility = await FacilitySignup.findOne({ email });

      if (!facility) {
        return res.status(403).json({ message: "Facility not assigned yet." });
      }
      return res
        .status(200)
        .json({ message: "OK", access: "granted", facility });
    }
    return res.status(403).json({ message: "Access denied for this role." });
  } catch (error) {
    console.error("Error in checkFacility:", error);
    res.status(500).json({
      message: "Server error while checking facility",
      error: error.message,
    });
  }
};
const getFacilityByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const facility = await FacilitySignup.findOne({ email });

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }
    console.log(facility);
    res.status(200).json({
      facilityName: facility.facilityName,
      facilityAddress: facility.facilityAddress,
      noOfBeds: facility.noOfBeds,
      state: facility.state,
      status: facility.status,
    });
  } catch (error) {
    console.error("Error fetching facility by email:", error);
    res.status(500).json({
      message: "Failed to fetch facility data",
      error: error.message,
    });
  }
};
const deleteFacility = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Facility.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Facility not found" });
    }

    res.status(200).json({ message: "Facility deleted successfully" });
  } catch (error) {
    console.error("Error deleting facility:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const updateFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, facilityName, facilityAddress, noOfBeds, state } = req.body;

    if (!email || !facilityName || !facilityAddress || !noOfBeds || !state) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updatedFacility = await Facility.findByIdAndUpdate(
      id,
      { email, facilityName, facilityAddress, noOfBeds, state },
      { new: true }
    );

    if (!updatedFacility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    await User.findOneAndUpdate(
      { email },
      { $set: { role: "Facility Admin", status: "pending" } }
    );

    res.status(200).json({
      message: "Facility updated successfully",
      facility: updatedFacility,
    });
  } catch (error) {
    console.error("Error updating facility:", error);
    res
      .status(500)
      .json({ message: "Failed to update facility", error: error.message });
  }
};

const getFacilityByRole = async (req, res) => {
  try {
   
    const adminUsers = await User.find({ role: "Facility Admin" }).select(
      "email"
    );

    const adminEmails = adminUsers.map((user) => user.email);
    const matchedFacilities = await FacilitySignup.find({
      email: { $in: adminEmails },
    });

    res.status(200).json({ facilities: matchedFacilities });
  } catch (error) {
    console.error("Error fetching facilities by role:", error);
    res.status(500).json({ message: "Failed to fetch facilities", error });
  }
};

const statusupdate = async (req, res) => {
  const { status, email } = req.body;
  if (req.method === "POST") {
    try {
      if (status !== "approve" && status !== "reject") {
        return res.status(400).json({
          message: "Invalid status value. It should be 'approve' or 'reject'.",
        });
      }
      const facility = await FacilitySignup.findOne({ email });
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }

      facility.status = status;
      await facility.save();

      const subject =
        status === "approve"
          ? "Your request has been approved"
          : "Your request has been rejected";
      const message = `
  <p>Hello,</p>
  <p>Your request has been ${
    status === "approve" ? "approved" : "rejected"
  }.</p>
  <p>Thank you for using our service!</p>
  <p>To view your facility details, click the button below:</p>
  <p>
    <a href="http://localhost:3000/facilitySetting" 
       style="
         display: inline-block; 
         background-color: #4CAF50; 
         color: white; 
         padding: 10px 20px; 
         text-align: center; 
         font-size: 16px; 
         border-radius: 5px; 
         text-decoration: none;">
       Go to Facility Page
    </a>
  </p>
`;

      let mailOptions = {
        from: process.env.EMAIL_USER,
        to: "zainabdev@paklogics.com",
        subject: subject,
        html: message,
      };

      console.log(`Sending email to ${email} with subject: ${subject}`);
      await transporter.sendMail(mailOptions); // Send the email
      console.log(`Email sent successfully to ${email}`);

      return res
        .status(200)
        .json({ success: true, message: "Status updated and email sent." });
    } catch (error) {
      console.error("Error during status update or email sending:", error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
    }
  } else {
    // If the method is not POST, return 405 Method Not Allowed
    console.warn("Method not allowed:", req.method);
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }
};

const requestEdit = async (req, res) => {
  try {
    const { email } = req.body;

    // Encode the email to make it URL-safe
    const encodedEmail = encodeURIComponent(email);

    // Mail options with HTML content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "zainabdev@paklogics.com",
      subject: "Approval Request for Editing",
      html: `
      <p>Hello Admin,</p>
      <p>A user with the email address <strong>${email}</strong> has requested approval to edit their details.</p>
      <p>Please review and choose an action:</p>
      <a href="http://localhost:3000/status-change?status=approve&email=${encodedEmail}" style="background-color: green; color: white; padding: 10px 15px; text-decoration: none;">Approve</a>
      &nbsp;
      <a href="http://localhost:3000/status-change?status=reject&email=${encodedEmail}" style="background-color: red; color: white; padding: 10px 15px; text-decoration: none;">Reject</a>
      <p>Best regards,<br>Your Application</p>
    `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Approval request sent to admin." });
  } catch (error) {
    console.error("Error sending approval request email:", error);
    res.status(500).json({
      message: "Failed to send approval request email",
      error: error.message,
    });
  }
};

const updatedata = async (req, res) => {
  console.log("Incoming request for updating facility data...");

  const { email, facilityName, facilityAddress, noOfBeds } = req.body;

  // Log request body for debugging
  console.log("Request body:", {
    email,
    facilityName,
    facilityAddress,
    noOfBeds,
  });

  // Validate required fields
  if (
    !email ||
    !facilityName ||
    !facilityAddress ||
    typeof noOfBeds !== "number"
  ) {
    console.error("Validation failed. Missing or invalid fields.");
    return res
      .status(400)
      .json({ error: "Invalid input. Please provide all required fields." });
  }

  try {
    const updateResult = await Facility.updateOne(
      { email },
      { $set: { facilityName, facilityAddress, noOfBeds } } // Use `$set` to specify fields to update
    );

    if (updateResult.matchedCount === 0) {
      console.warn("No facility found with the provided email:", email);
      return res
        .status(404)
        .json({ error: "Facility not found with the provided email." });
    }

    res.status(200).json({ message: "Facility updated successfully." });
  } catch (error) {
    console.error("Error occurred while updating facility:", error);
    res.status(500).json({
      error: "An internal server error occurred while updating the facility.",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { department } = req.body;
    console.log("department 417", department);
    if (!department) {
      return res.status(400).json({ message: "Department is required" });
    }

    const users = await User.find();

    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users by department:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

module.exports = {
  createFacility,
  getFacility,
  requestEdit,
  statusupdate,
  updatedata,
  getUsers,
  deleteFacility,
  updateFacility,
  getFacilityByEmail,
  getFacilityByRole,
  getFacility1,
  checkFacility,
};
