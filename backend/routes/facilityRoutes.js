
const express = require("express");
const facilityController = require("../controllers/facilityController");
const { getFacilityByEmail,requestEdit, statusupdate,updatedata  } = require("../controllers/facilityController"); // Import the correct function

const router = express.Router();

// Route to create a facility
router.post("/info", facilityController.createFacility); // POST /api/facility/info

// Route to fetch facility by ID
router.get("/:email", getFacilityByEmail); // GET /api/facility/:id


// Route to update the status
router.post("/status-update", statusupdate);
// Route to send email for approval request
router.post('/request-edit', requestEdit);
router.put('/update', updatedata);

module.exports = router;
