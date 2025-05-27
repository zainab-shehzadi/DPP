
const express = require("express");
const {getUsers,getFacilityByRole,checkFacility,getFacility1, getFacilityByEmail,createFacility, getFacility,requestEdit, statusupdate,updatedata , deleteFacility , updateFacility } = require("../controllers/facilityController"); // Import the correct function
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create-facility", createFacility); 
router.get("/facilities", getFacility); 
router.post("/facilities1", getFacility1);
router.post("/check-facility123", checkFacility);
router.post("/fetch", getFacilityByEmail); 
router.post("/status-update", statusupdate);    
router.post('/request-edit', requestEdit);
router.put('/update', updatedata);
router.get("/get-all", protect , getUsers)
router.delete("/facilities/:id", deleteFacility);
router.put("/facilities/:id", updateFacility);
router.get("/facility-admins", getFacilityByRole);
module.exports = router;
