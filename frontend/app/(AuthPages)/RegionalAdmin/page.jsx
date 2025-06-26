"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  ChevronRight,
  ChevronLeft,
  User,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { departmentLabels, departmentPositions } from "@/constants/dpp";
import { toast } from "react-toastify";
import axios from "axios";

const usStates = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const RegionalAdminCreationFlow = () => {
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [position, setPosition] = useState("");
  const [admins, setAdmins] = useState([]);
  const [availableFacilities, setAvailableFacilities] = useState([]);
  const [facilityOption, setFacilityOption] = useState("");

  console.log("admins", admins);

  const validateStep1 = () => {
    if (facilityOption === "existing") {
      return selectedAdminId !== "";
    } else if (facilityOption === "new") {
      return (
        firstName &&
        lastName &&
        email &&
        password &&
        confirmPassword &&
        password === confirmPassword &&
        password.length >= 8
      );
    }
    return false;
  };

  const validateStep2 = () => {
    return selectedFacilities.length > 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const fetchApprovedFacilities = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/approved-facilities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({}),
        }
      );
      const data = await res.json();
      console.log("approved facilities", data);

      if (res.ok) {
        setAvailableFacilities(data?.facilities || []);
      } else {
        toast.error(data.message || "Failed to fetch facilities");
      }
    } catch (error) {
      toast.error("Something went wrong while fetching facilities");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedFacilities();
  }, []);

  const fetchRegionalAdmins = async () => {
    setLoadingFacilities(true);
    try {
      const token = Cookies.get("token");
      console.log("token", token);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/regional-admin-facilities`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setAdmins(response.data.regionalAdmins || []);
      }
    } catch (error) {
      console.error("Error fetching regional admins:", error);
      toast.error("Failed to fetch regional admins");
    } finally {
      setLoadingFacilities(false);
    }
  };

  useEffect(() => {
    fetchRegionalAdmins();
  }, []);

  const handleSubmitExistingAdmin = async () => {
    if (!selectedAdminId || selectedFacilities.length === 0) {
      toast.error("Please select a regional admin and at least one facility!");
      return;
    }

    setLoading(true);
    try {
      const selectedAdmin = admins.find(
        (admin) => admin._id === selectedAdminId
      );

      const linkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/link-regional-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({
            regionalAdminEmail: selectedAdmin.email,
            facilityIds: selectedFacilities,
          }),
        }
      );

      const linkData = await linkResponse.json();

      if (!linkResponse.ok) {
        toast.error(
          linkData.message || "Failed to assign facilities to Regional Admin"
        );
        return;
      }

      toast.success("Facilities assigned to Regional Admin successfully!");
      resetForm();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNewAdmin = async () => {
    if (!validateStep1() || !validateStep2()) {
      toast.error("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    try {
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            role: "Regional Admin",
            position,
            DepartmentName: "business_office",
            assignedFacilities: selectedFacilities,
          }),
        }
      );

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        toast.error(userData.message || "Failed to create user");
        return;
      }

      // Link Regional Admin with selected facilities
      const linkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/link-regional-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({
            regionalAdminEmail: email,
            facilityIds: selectedFacilities,
          }),
        }
      );

      const linkData = await linkResponse.json();

      if (!linkResponse.ok) {
        toast.error(
          linkData.message || "Failed to link facilities with Regional Admin"
        );
        return;
      }

      toast.success(
        "Regional Admin created and linked with facilities successfully!"
      );
      resetForm();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (facilityOption === "existing") {
      handleSubmitExistingAdmin();
    } else {
      handleSubmitNewAdmin();
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDepartmentName("");
    setPosition("");
    setSelectedFacilities([]);
    setSelectedAdminId("");
    setFacilityOption("");
  };

  const handleFacilitySelectionChange = (event, facilityId) => {
    if (event.target.checked) {
      setSelectedFacilities((prevSelected) => [...prevSelected, facilityId]);
    } else {
      setSelectedFacilities((prevSelected) =>
        prevSelected.filter((id) => id !== facilityId)
      );
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Regional Admin Assignment
      </h3>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="facilityOption"
              value="existing"
              checked={facilityOption === "existing"}
              onChange={(e) => {
                setFacilityOption(e.target.value);
                setSelectedAdminId("");
                setFirstName("");
                setLastName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-blue-600"
            />
            <span className="text-gray-700">
              Assign to Existing Regional Admin
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="facilityOption"
              value="new"
              checked={facilityOption === "new"}
              onChange={(e) => {
                setFacilityOption(e.target.value);
                setSelectedAdminId("");
              }}
              className="text-blue-600"
            />
            <span className="text-gray-700">Create New Regional Admin</span>
          </label>
        </div>

        {facilityOption === "existing" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Regional Admin *
            </label>
            <select
              value={selectedAdminId}
              onChange={(e) => setSelectedAdminId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a Regional Admin</option>
              {admins.map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.firstname} {admin.lastname} ({admin.email})
                </option>
              ))}
            </select>
            {admins.length === 0 && !loadingFacilities && (
              <p className="text-amber-600 text-sm mt-1">
                No regional admins available. Please create a new regional
                admin.
              </p>
            )}
            {loadingFacilities && (
              <p className="text-blue-600 text-sm mt-1">
                Loading regional admins...
              </p>
            )}
          </div>
        )}

        {facilityOption === "new" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Enter password (min 8 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Assign Approved Facilities
      </h3>
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> Only approved facilities are shown below.
            Selected facilities will be managed by the{" "}
            {facilityOption === "existing" ? "selected" : "new"} Regional Admin.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Approved Facilities * (Choose one or more)
          </label>
          <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
            {availableFacilities.map((facility) => (
              <div
                key={facility?._id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
              >
                <input
                  type="checkbox"
                  id={facility?._id}
                  value={facility?._id}
                  checked={selectedFacilities.includes(facility?._id)}
                  onChange={(e) =>
                    handleFacilitySelectionChange(e, facility?._id)
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={facility?._id}
                  className="flex-1 text-gray-700 cursor-pointer"
                >
                  <div>
                    <span className="font-medium">{facility.facilityName}</span>
                    {facility.facilityCode && (
                      <span className="text-gray-500 ml-2">
                        ({facility.facilityCode})
                      </span>
                    )}
                    <div className="text-sm text-gray-500">
                      Admin: {facility.adminName || "Not assigned"}
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      Status: Approved ✓
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>

          {selectedFacilities.length > 0 && (
            <p className="text-blue-600 text-sm mt-2">
              {selectedFacilities.length} approved facility(ies) selected
            </p>
          )}

          {availableFacilities.length === 0 && (
            <p className="text-amber-600 text-sm mt-1">
              No approved facilities available. Please ensure facilities are
              approved first.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const selectedAdmin =
      facilityOption === "existing"
        ? admins.find((admin) => admin._id === selectedAdminId)
        : null;

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          Review & Confirm
        </h3>

        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          {/* Admin Details */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">
              {facilityOption === "existing"
                ? "Selected Regional Admin"
                : "New Regional Admin Details"}
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              {facilityOption === "existing" && selectedAdmin ? (
                <>
                  <p>
                    <strong>Name:</strong> {selectedAdmin.firstname}{" "}
                    {selectedAdmin.lastname}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedAdmin.email}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Name:</strong> {firstName} {lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {email}
                  </p>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-2">
              Assigned Approved Facilities
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <strong>
                Selected Facilities ({selectedFacilities.length}):
              </strong>
              <ul className="list-disc pl-6 mt-2">
                {selectedFacilities.map((facilityId) => {
                  const facility = availableFacilities.find(
                    (f) => f._id === facilityId
                  );
                  return (
                    <li key={facilityId} className="mb-1">
                      {facility ? (
                        <div>
                          <span className="font-medium">
                            {facility.facilityName}
                          </span>
                          {facility.facilityCode && (
                            <span className="text-gray-500">
                              {" "}
                              ({facility.facilityCode})
                            </span>
                          )}
                          <div className="text-xs text-gray-500">
                            Admin: {facility.adminName || "Not assigned"}
                          </div>
                        </div>
                      ) : (
                        "Unknown Facility"
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {loading ? (
        <div className="flex items-center justify-center w-full h-screen ma-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="max-w-4xl mx-auto p-6 bg-white">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                Regional Admin Management
              </h1>
              <p className="text-gray-600 text-center">
                Create a new regional admin or assign facilities to existing
                regional admin
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                  currentStep === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <ChevronLeft size={20} className="mr-1" />
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !validateStep1()) ||
                    (currentStep === 2 && !validateStep2())
                  }
                  className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                    (currentStep === 1 && !validateStep1()) ||
                    (currentStep === 2 && !validateStep2())
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Next
                  <ChevronRight size={20} className="ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !validateStep1() || !validateStep2()}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                    loading || !validateStep1() || !validateStep2()
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {facilityOption === "existing"
                        ? "Assigning..."
                        : "Creating..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} className="mr-1" />
                      {facilityOption === "existing"
                        ? "Assign Facilities"
                        : "Create Regional Admin"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RegionalAdminCreationFlow;
