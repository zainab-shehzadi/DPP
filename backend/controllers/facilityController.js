const Facility = require("../models/FacilitySignup");
const FacilitySignup = require('../models/FacilitySignup');
const nodemailer = require('nodemailer');


// Create a new facility
const createFacility = async (req, res) => {
  try {
    const {email, facilityName, facilityAddress, noOfBeds } = req.body;

    // Validate required fields
    if (!email || !facilityName || !facilityAddress || !noOfBeds) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save facility to the database
    const facility = new Facility({
      email,
      facilityName,
      facilityAddress,
      noOfBeds,
    });

    await facility.save();
    res.status(201).json({ message: "Facility saved successfully.", facility });
  } catch (error) {
    console.error("Error saving facility:", error);
    res.status(500).json({ message: "Failed to save facility.", error: error.message });
  }
};


const getFacilityByEmail = async (req, res) => {
  try {
    const { email } = req.params; // Destructure email from request parameters

    console.log("Fetching facility for email:", email); // Debugging log

    // Fetch facility from the database using email
    const facility = await FacilitySignup.findOne({ email });

    // Check if facility exists
    if (!facility) {
      console.log("Facility not found for email:", email); // Debugging log
      return res.status(404).json({ message: "Facility not found" });
    }

    console.log("Facility details fetched:", facility); // Debugging log
    res.status(200).json({
      facilityName: facility.facilityName,
      facilityAddress: facility.facilityAddress,
      noOfBeds: facility.noOfBeds,
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


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Gmail SMTP server
  port: 465, // or 587 for TLS
  secure: true, // true for port 465, false for port 587
  auth: {
      user: process.env.EMAIL_USER, // your Gmail address
      pass: process.env.EMAIL_PASSWORD, // your Gmail password or app password
  },
});

const statusupdate = async (req, res) => {
  const { status, email } = req.body; // Get status and email from the request body
console.log(email);
  if (req.method === 'POST') {
    try {
      console.log('Received request to update status:', { status, email });

      // Check if the status is valid
      if (status !== "approve" && status !== "reject") {
        return res.status(400).json({ message: "Invalid status value. It should be 'approve' or 'reject'." });
      }

      // 1. Update the user status in the database
      const facility = await FacilitySignup.findOne({ email });  // Find the facility by email
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }

      facility.status = status; // Update the status
      await facility.save(); // Save the updated document

      // 2. Send an email to the user
      const subject = status === 'approve' ? 'Your request has been approved' : 'Your request has been rejected';
      const message = `
  <p>Hello,</p>
  <p>Your request has been ${status === 'approve' ? 'approved' : 'rejected'}.</p>
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
  to: "zainabdev@paklogics.com", // Corrected the email address
  subject: subject,
  html: message,
};

      console.log(`Sending email to ${email} with subject: ${subject}`);
      await transporter.sendMail(mailOptions); // Send the email
      console.log(`Email sent successfully to ${email}`);

      return res.status(200).json({ success: true, message: 'Status updated and email sent.' });
    } catch (error) {
      console.error('Error during status update or email sending:', error);
      return res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
    }
  } else {
    // If the method is not POST, return 405 Method Not Allowed
    console.warn('Method not allowed:', req.method);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
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
      to: 'zainabdev@paklogics.com',
      subject: 'Approval Request for Editing',
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
    res.status(200).json({ message: 'Approval request sent to admin.' });
  } catch (error) {
    console.error('Error sending approval request email:', error);
    res.status(500).json({ message: 'Failed to send approval request email', error: error.message });
  }
};

const updatedata = async (req, res) => {
  console.log("Incoming request for updating facility data...");

  const { email, facilityName, facilityAddress, noOfBeds } = req.body;

  // Log request body for debugging
  console.log("Request body:", { email, facilityName, facilityAddress, noOfBeds });

  // Validate required fields
  if (!email || !facilityName || !facilityAddress || typeof noOfBeds !== "number") {
    console.error("Validation failed. Missing or invalid fields.");
    return res.status(400).json({ error: "Invalid input. Please provide all required fields." });
  }

  try {
    console.log("Attempting to update facility in the database...");

    // Update facility in the database
    const updateResult = await Facility.updateOne(
      { email },
      { $set: { facilityName, facilityAddress, noOfBeds } } // Use `$set` to specify fields to update
    );

    // Log update result for debugging
    console.log("Update result:", updateResult);

    // Check if a document was updated
    if (updateResult.matchedCount === 0) {
      console.warn("No facility found with the provided email:", email);
      return res.status(404).json({ error: "Facility not found with the provided email." });
    }

    console.log("Facility updated successfully.");
    res.status(200).json({ message: "Facility updated successfully." });
  } catch (error) {
    console.error("Error occurred while updating facility:", error);
    res.status(500).json({ error: "An internal server error occurred while updating the facility." });
  }
};


module.exports = {
  createFacility,
  getFacilityByEmail,
  requestEdit,
  statusupdate,
  updatedata,
};

