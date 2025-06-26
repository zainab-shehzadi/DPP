const RegionalAdminRequest = require("../models/adminRequests");
const FacilitySignup = require("../models/FacilitySignup");
const User = require("../models/User");

// Create a new regional admin request
const RegionalAdminRequestApi = async (req, res) => {
  try {
    const { facilityAdmin, requestType, requestedAt, status } = req.body;

    if (!facilityAdmin || !facilityAdmin.email) {
      return res
        .status(400)
        .json({ message: "Missing facility admin details." });
    }

    // Check if a request with the same facility admin and request type already exists and is not rejected
    const existingRequest = await RegionalAdminRequest.findOne({
      "facilityAdmin.email": facilityAdmin.email,
      requestType,
      status: { $ne: "rejected" }, // optional: only block if it's not rejected
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Request has already been submitted and is in process.",
        data: existingRequest,
      });
    }

    // Create new request if no existing one found
    const newRequest = new RegionalAdminRequest({
      facilityAdmin,
      requestType,
      requestedAt,
      status,
    });

    await newRequest.save();

    return res.status(201).json({
      message: "Request submitted successfully.",
      data: newRequest,
    });
  } catch (error) {
    console.error("Error creating regional admin request:", error);
    res
      .status(500)
      .json({ message: "Server error. Could not submit request." });
  }
};

const getAllRegionalAdminRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "facilityCode",
      sortOrder = "asc",
      status,
      facilityCode,
      search,
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (facilityCode) {
      filter["facilityAdmin.facilityCode"] = facilityCode;
    }

    if (search) {
      filter.$or = [
        { "facilityAdmin.firstname": { $regex: search, $options: "i" } },
        { "facilityAdmin.lastname": { $regex: search, $options: "i" } },
        { "facilityAdmin.email": { $regex: search, $options: "i" } },
        { "facilityAdmin.facilityCode": { $regex: search, $options: "i" } },
        { "facilityAdmin.facilityName": { $regex: search, $options: "i" } },
        { "facilityAdmin.departmentName": { $regex: search, $options: "i" } },
      ];
    }

    let sortObj = {};

    switch (sortBy) {
      case "facilityCode":
        sortObj["facilityAdmin.facilityCode"] = sortOrder === "desc" ? -1 : 1;
        break;
      case "requestedAt":
        sortObj.requestedAt = sortOrder === "desc" ? -1 : 1;
        break;
      case "status":
        sortObj.status = sortOrder === "desc" ? -1 : 1;
        break;
      case "facilityName":
        sortObj["facilityAdmin.facilityName"] = sortOrder === "desc" ? -1 : 1;
        break;
      case "adminName":
        sortObj["facilityAdmin.firstname"] = sortOrder === "desc" ? -1 : 1;
        break;
      default:
        sortObj["facilityAdmin.facilityCode"] = 1;
    }

    const totalRequests = await RegionalAdminRequest.countDocuments(filter);

    const requests = await RegionalAdminRequest.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const totalPages = Math.ceil(totalRequests / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    return res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalRequests,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        sortBy,
        sortOrder,
        status: status || "all",
        facilityCode: facilityCode || "",
        search: search || "",
      },
    });
  } catch (error) {
    console.error("Error fetching regional admin requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch requests.",
    });
  }
};

const getRequestsByFacilityCode = async (req, res) => {
  try {
    const { facilityCode } = req.params;
    const { sortOrder = "asc" } = req.query;

    if (!facilityCode) {
      return res.status(400).json({
        success: false,
        message: "Facility code is required.",
      });
    }

    const requests = await RegionalAdminRequest.find({
      "facilityAdmin.facilityCode": facilityCode,
    })
      .sort({
        requestedAt: sortOrder === "desc" ? -1 : 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      data: requests,
      count: requests.length,
      facilityCode,
    });
  } catch (error) {
    console.error("Error fetching requests by facility code:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch requests.",
    });
  }
};

const getRegionalAdminRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await RegionalAdminRequest.findById(id).lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Error fetching request by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch request.",
    });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approve", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'pending', 'approve', or 'rejected'.",
      });
    }

    const updatedRequest = await RegionalAdminRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Request ${status} successfully.`,
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not update request.",
    });
  }
};

const getRequestsGroupedByFacilityCode = async (req, res) => {
  try {
    const { status } = req.query;

    let matchStage = {};
    if (status && status !== "all") {
      matchStage.status = status;
    }

    const groupedRequests = await RegionalAdminRequest.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$facilityAdmin.facilityCode",
          facilityName: { $first: "$facilityAdmin.facilityName" },
          facilityAddress: { $first: "$facilityAdmin.facilityAddress" },
          requests: { $push: "$$ROOT" },
          totalRequests: { $sum: 1 },
          pendingRequests: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          approvedRequests: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejectedRequests: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: groupedRequests,
      totalFacilities: groupedRequests.length,
    });
  } catch (error) {
    console.error("Error getting grouped requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch grouped requests.",
    });
  }
};

const getFacilityCodes = async (req, res) => {
  try {
    const facilityCodes = await RegionalAdminRequest.distinct(
      "facilityAdmin.facilityCode"
    );

    const facilityInfo = await RegionalAdminRequest.aggregate([
      {
        $group: {
          _id: "$facilityAdmin.facilityCode",
          facilityName: { $first: "$facilityAdmin.facilityName" },
          facilityAddress: { $first: "$facilityAdmin.facilityAddress" },
          requestCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: facilityInfo,
      facilityCodes: facilityCodes.sort(),
    });
  } catch (error) {
    console.error("Error fetching facility codes:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not fetch facility codes.",
    });
  }
};

const getApprovedFacilities = async (req, res) => {
  try {
    const facilityAdmins = await User.find({ role: "Facility Admin" });
    const emails = facilityAdmins.map((admin) => admin.email);

    const approvedFacilities = await RegionalAdminRequest.find({
      status: "approve",
    });

    const enrichedFacilities = approvedFacilities.map((facility) => {
      const matchingUser = facilityAdmins.find(
        (u) => u.email === facility?.facilityAdmin?.email
      );
      console.log("matched 335", matchingUser);
      return {
        _id: facility._id,
        email: facility.email,
        facilityName: facility.facilityAdmin.facilityName,
        facilityAddress: facility.facilityAdmin.facilityAddress,
        noOfBeds: facility.facilityAdmin.noOfBeds,
        state: facility.facilityAdmin.state,
        facilityCode: facility.facilityAdmin.facilityCode,
        status: facility.facilityAdminstatus,
        createdAt: facility.facilityAdmin.createdAt,
        updatedAt: facility.facilityAdmin.updatedAt,
        adminName: `${matchingUser?.firstname || ""} ${
          matchingUser?.lastname || ""
        }`.trim(),
        department: matchingUser?.DepartmentName || "",
        adminId: matchingUser?._id,
      };
    });

    console.log("Approved facilities:", enrichedFacilities);
    res.status(200).json({ facilities: enrichedFacilities });
  } catch (error) {
    console.error("Error fetching approved facilities:", error);
    res.status(500).json({
      message: "Failed to fetch approved facilities",
      error: error.message,
    });
  }
};

const linkRegionalAdmin = async (req, res) => {
  try {
    const { regionalAdminEmail, facilityIds } = req.body;

    if (!regionalAdminEmail || !facilityIds || !Array.isArray(facilityIds)) {
      return res.status(400).json({
        message: "Regional admin email and facility IDs array are required",
      });
    }

    // Find the regional admin user
    const regionalAdmin = await User.findOne({
      email: regionalAdminEmail,
      role: "Regional Admin",
    });

    if (!regionalAdmin) {
      return res.status(404).json({
        message: "Regional admin not found",
      });
    }

    // Verify all facilities exist and are approved
    const facilities = await RegionalAdminRequest.find({
      _id: { $in: facilityIds },
      status: "approve",
    });

    if (facilities.length !== facilityIds.length) {
      return res.status(400).json({
        message: "Some facilities not found or not approved",
      });
    }

    // Get the facility admin emails for these facilities
    const facilityEmails = facilities.map((f) => f.email);

    // Find the facility admins
    const facilityAdmins = await User.find({
      email: { $in: facilityEmails },
      role: "Facility Admin",
    });

    // Update regional admin with assigned facilities
    await User.findByIdAndUpdate(regionalAdmin._id, {
      $set: {
        assignedFacilities: facilityIds,
        assignedFacilityAdmins: facilityAdmins.map((admin) => admin._id),
      },
    });

    // Update each facility admin to link them with this regional admin
    await User.updateMany(
      { _id: { $in: facilityAdmins.map((admin) => admin._id) } },
      { $set: { regionalAdmin: regionalAdmin._id } }
    );

    // Optional: Create a log/tracking document for this relationship
    // You might want to create a separate collection for tracking these relationships

    res.status(200).json({
      message: "Regional admin linked with facilities successfully",
      regionalAdmin: {
        id: regionalAdmin._id,
        email: regionalAdmin.email,
        name: `${regionalAdmin.firstname} ${regionalAdmin.lastname}`,
        assignedFacilities: facilityIds.length,
        linkedFacilityAdmins: facilityAdmins.length,
      },
    });
  } catch (error) {
    console.error("Error linking regional admin:", error);
    res.status(500).json({
      message: "Failed to link regional admin with facilities",
      error: error.message,
    });
  }
};

const getRegionalAdminFacilities = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "Super Admin") {
      const regionalAdmins = await User.find({ role: "Regional Admin" });

      if (!regionalAdmins || regionalAdmins.length === 0) {
        return res.status(404).json({ message: "Regional admins not found" });
      }

      return res.status(200).json({ regionalAdmins });
    }

    if (user.role === "Regional Admin") {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const regionalAdmin = await User.findOne({
        email,
        role: "Regional Admin",
      }).populate("assignedFacilities");
      console.log("regionalAdmin", regionalAdmin.assignedFacilities);

      if (!regionalAdmin) {
        return res.status(404).json({ message: "Regional admin not found" });
      }

      const facilities = await RegionalAdminRequest.find({
        _id: { $in: regionalAdmin.assignedFacilities || [] },
        status: "approve",
      });

      console.log("facility checking", facilities);

      const facilityEmails = facilities.map((f) => f.facilityAdmin.email);
      console.log("facilityEmail", facilityEmails);

      // const facilityAdmins = await User.find({
      //   email: { $in: facilityEmails },
      //   role: "Facility Admin",
      // }).populate("assignedFacilities");

      // console.log("facility admins", facilityAdmins)

      const enrichedFacilities = facilities.map((facility) => {
        // const matchingAdmin = facilityAdmins.find(
        //   (admin) => admin.email === facility.email
        // );
        return {
          _id: facility._id,
          facilityName: facility?.facilityAdmin.facilityName,
          facilityCode: facility?.facilityAdmin.facilityCode,
          facilityAddress: facility?.facilityAdmin.facilityAddress,
          noOfBeds: facility?.facilityAdmin.noOfBeds,
          state: facility?.facilityAdmin.state,
          status: facility?.facilityAdmin.status,
          adminName: facility
            ? `${facility?.facilityAdmin?.firstname} ${facility?.facilityAdmin?.lastname}`
            : "N/A",
          adminEmail: facility?.facilityAdmin?.email,
        };
      });

      console.log("encri", enrichedFacilities);

      return res.status(200).json({
        regionalAdmin: {
          name: `${regionalAdmin.firstname} ${regionalAdmin.lastname}`,
          email: regionalAdmin.email,
          id: regionalAdmin._id,
        },
        facilities: enrichedFacilities,
        totalFacilities: enrichedFacilities.length,
      });
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    console.error("Error fetching regional admin facilities:", error);
    return res.status(500).json({
      message: "Failed to fetch regional admin facilities",
      error: error.message,
    });
  }
};

const getFacilityAdmins = async (req, res) => {
  try {
    const facilityAdmins = await User.find({ role: "Facility Admin" });

    return res
      .status(200)
      .json({ message: "Facility admin fetched Successfully", facilityAdmins });
  } catch (error) {
    console.error("Error fetching regional admin facilities:", error);
    return res.status(500).json({
      message: "Failed to fetch regional admin facilities",
      error: error.message,
    });
  }
};

const checkFacilityUpdated = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Special case
    if (email === "anthony@paklogics.com") {
      const facility = await FacilitySignup.findOne({ email });
      if (!facility) {
        return res.status(403).json({ message: "Facility not assigned yet." });
      }

      return res
        .status(200)
        .json({ message: "OK", access: "granted", facility });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "Facility Users") {
      return res.status(200).json({ message: "OK", access: "granted" });
    }

    if (user.role === "Facility Admin") {
      const facility = await FacilitySignup.findOne({ email });

      if (!facility) {
        return res.status(403).json({ message: "Facility not assigned yet." });
      }

      return res
        .status(200)
        .json({ message: "OK", access: "granted", facility });
    }

    if (user.role === "Regional Admin") {
      // Check if regional admin has assigned facilities
      if (!user.assignedFacilities || user.assignedFacilities.length === 0) {
        return res
          .status(403)
          .json({ message: "No facilities assigned to this regional admin." });
      }

      // Get the facilities assigned to this regional admin
      const facilities = await FacilitySignup.find({
        _id: { $in: user.assignedFacilities },
        status: "approve",
      });

      return res.status(200).json({
        message: "OK",
        access: "granted",
        role: "Regional Admin",
        facilities: facilities,
        totalFacilities: facilities.length,
      });
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

const assignAdminToFacility = async (req, res) => {
  const { adminId, facilityId, facilityName } = req.body;
  console.log("facilityId", facilityId);

  try {
    if (!adminId || !facilityId) {
      return res.status(400).json({
        message: "Admin ID and Facility ID are required",
      });
    }

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role !== "Facility Admin") {
      return res.status(400).json({
        message: "User is not a Facility Admin",
      });
    }
    const facility = await FacilitySignup.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }
    console.log("facility", facility);

    const updatedAdmin = await User.findByIdAndUpdate(
      adminId,
      {
        facilityName: facilityName || facility.facilityName,
        facilityId: facilityId,
      },
      { new: true, runValidators: true }
    );

    await FacilitySignup.findByIdAndUpdate(facilityId, {
      adminId: adminId,
      email: admin.email,
      facilityCode: facility.facilityCode,
      facilityName: facility.facilityName,
      facilityAddress: facility.facilityAddress,
      noOfBeds: facility.noOfBeds,
      state: facility.state,
    });

    res.status(200).json({
      message: "Admin successfully assigned to facility",
      admin: {
        id: updatedAdmin._id,
        name: `${updatedAdmin.firstname} ${updatedAdmin.lastname}`,
        email: updatedAdmin.email,
        facilityName: updatedAdmin.facilityName,
        facilityId: updatedAdmin.facilityId,
      },
      facility: {
        email: facility.email,
        id: facility._id,
        name: facility.facilityName,
        adminAssigned: true,
      },
    });
  } catch (error) {
    console.error("Error assigning admin to facility:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const createFacilityWithAdmin = async (req, res) => {
  const {
    email,
    facilityName,
    facilityAddress,
    noOfBeds,
    state,
    facilityCode,
    adminId,
  } = req.body;

  try {
    if (
      !facilityName ||
      !facilityAddress ||
      !noOfBeds ||
      !state ||
      !facilityCode
    ) {
      return res.status(400).json({
        message: "All facility fields are required",
      });
    }

    const existingFacility = await FacilitySignup.findOne({
      $or: [{ facilityName: facilityName }, { facilityCode: facilityCode }],
    });

    if (existingFacility) {
      return res.status(400).json({
        message: "Facility already exists",
      });
    }

    let adminInfo = null;
    if (adminId) {
      const admin = await User.findById(adminId);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      adminInfo = {
        adminId: adminId,
        adminEmail: admin.email,
        adminName: `${admin.firstname} ${admin.lastname}`,
      };
    }
    // const facility = await FacilitySignup.create({
    //   facilityName,
    //   facilityAddress,
    //   noOfBeds: parseInt(noOfBeds),
    //   state,
    //   facilityCode: facilityCode.toUpperCase(),
    //   email: email || (adminInfo ? adminInfo.adminEmail : null),
    //   ...adminInfo,
    //   createdAt: new Date(),
    // });

    if (adminId && adminInfo) {
      await User.findByIdAndUpdate(
        adminId,
        {
          facilityName: facilityName,
          status: "active",
        },
        { new: true }
      );
    }
    let facility = null;
    if (
      adminId &&
      facilityName &&
      facilityAddress &&
      noOfBeds &&
      state &&
      facilityCode
    ) {
      facility = await FacilitySignup.findOneAndUpdate(
        { email: adminInfo?.adminEmail },
        {
          email: adminInfo.adminEmail,
          facilityName: facilityName,
          state: state,
          facilityAddress: facilityAddress,
          noOfBeds: noOfBeds,
          facilityCode,
          facilityCode,
        },
        { new: true, upsert: true }
      );
    }

    res.status(201).json({
      message: "Facility Updated successfully",
      facility: {
        id: facility._id,
        facilityName: facility.facilityName,
        facilityAddress: facility.facilityAddress,
        facilityCode: facility.facilityCode,
        noOfBeds: facility.noOfBeds,
        state: facility.state,
        email: facility.email,
        adminAssigned: !!adminId,
        adminInfo: adminInfo,
      },
    });
  } catch (error) {
    console.error("Error creating facility:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  RegionalAdminRequestApi,
  getAllRegionalAdminRequests,
  getRequestsByFacilityCode,
  getRegionalAdminRequestById,
  updateRequestStatus,
  getRequestsGroupedByFacilityCode,
  getFacilityCodes,
  getApprovedFacilities,
  linkRegionalAdmin,
  getRegionalAdminFacilities,
  checkFacilityUpdated,
  getFacilityAdmins,
  assignAdminToFacility,
  createFacilityWithAdmin,
};
