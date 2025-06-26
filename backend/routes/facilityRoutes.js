
const express = require("express");
const {getUsers,getFacilityByRole,checkFacility,getFacility1, getFacilityByEmail,createFacility, getFacility,requestEdit, statusupdate,updatedata , deleteFacility , updateFacility } = require("../controllers/facilityController"); // Import the correct function
const { RegionalAdminRequestApi, getAllRegionalAdminRequests,getFacilityCodes, 
    updateRequestStatus,getRequestsGroupedByFacilityCode,  getRequestsByFacilityCode, getRegionalAdminRequestById, 
    getApprovedFacilities , linkRegionalAdmin, getRegionalAdminFacilities , getFacilityAdmins, assignAdminToFacility ,createFacilityWithAdmin} = require("../controllers/RegionalAdminRequestController"); 

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
router.post("/facility-admins", getFacilityByRole);

router.post("/regional-admin", protect , RegionalAdminRequestApi)
router.post('/requests', getAllRegionalAdminRequests);
router.post('/facility/:facilityCode', getRequestsByFacilityCode);
router.get('/request/:id', getRegionalAdminRequestById);
router.put('/request/:id/status', updateRequestStatus);
router.get('/grouped', getRequestsGroupedByFacilityCode);
router.post('/facility-codes', getFacilityCodes);
router.post('/approved-facilities', getApprovedFacilities)
router.post("/link-regional-admin", linkRegionalAdmin )
router.post("/regional-admin-facilities", protect, getRegionalAdminFacilities )
router.post('/get-all-facility-admins', getFacilityAdmins)
router.post("/assign-admin-to-facility", assignAdminToFacility)
router.post("/create-facility-with-existing-admin", createFacilityWithAdmin)

module.exports = router;
