
const express = require("express");
const facilityController = require("../controllers/facilityController");
const { getFacilityByEmail,requestEdit, statusupdate,updatedata  } = require("../controllers/facilityController"); // Import the correct function

const router = express.Router();

router.post("/info", facilityController.createFacility); 
router.post("/fetch", getFacilityByEmail); 
router.post("/status-update", statusupdate);
router.post('/request-edit', requestEdit);
router.put('/update', updatedata);

module.exports = router;
