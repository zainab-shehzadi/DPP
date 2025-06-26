"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  User,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Menu,
  X,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import axios from "axios";
import Cookies from "js-cookie";
import { departmentLabels, departmentPositions } from "@/constants/dpp";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
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

const FacilityAdminCreationFlow = () => {
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  // User Details State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [position, setPosition] = useState("");
  const [admins, setAdmins] = useState([]);

  // Facility Assignment State
  const [facilityOption, setFacilityOption] = useState("");
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [availableFacilities, setAvailableFacilities] = useState([]);
  console.log("available facilities 56", availableFacilities);

  // New Facility State
  const [newFacilityName, setNewFacilityName] = useState("");
  const [newFacilityAddress, setNewFacilityAddress] = useState("");
  const [newFacilityState, setNewFacilityState] = useState("");
  const [newFacilityBeds, setNewFacilityBeds] = useState("");
  const [facilityCode, setFacilityCode] = useState("");
  const [facilityAssignmentOption, setFacilityAssignmentOption] = useState("");
  const positions = departmentName
    ? departmentPositions[departmentName] || []
    : [];

  const fetchRegionalAdmins = async () => {
    setLoadingFacilities(true);
    try {
      const token = Cookies.get("token");
      console.log("token", token);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/get-all-facility-admins`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setAdmins(response.data.facilityAdmins || []);
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

  const fetchFacilities = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/facilities1`,
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
      if (res.ok) {
        setFacilities(data?.facility || []);
        const unassignedFacilities = data?.facility.map((f) => f.facilityName);
        setAvailableFacilities(unassignedFacilities);
      } else {
        toast.error(data.message || "Failed to load facilities");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const validateStep1 = () => {
    if (facilityOption === "existing") {
      return selectedAdminId;
    } else if (facilityOption === "new") {
      return (
        firstName &&
        lastName &&
        email &&
        password &&
        confirmPassword &&
        departmentName &&
        position &&
        password === confirmPassword &&
        password.length >= 8
      );
    }
    return false;
  };

  // const validateStep2 = () => {
  //   if (facilityOption === "existing") {
  //     return selectedFacilityId;
  //   } else if (facilityOption === "new") {
  //     return (
  //       newFacilityName &&
  //       newFacilityAddress &&
  //       newFacilityState &&
  //       newFacilityBeds &&
  //       facilityCode
  //     );
  //   }
  //   return false;
  // };

  // Update the validateStep2 function
  const validateStep2 = () => {
    if (facilityAssignmentOption === "existing") {
      return selectedFacilityId;
    } else if (facilityAssignmentOption === "new") {
      return (
        newFacilityName &&
        newFacilityAddress &&
        newFacilityState &&
        newFacilityBeds &&
        facilityCode
      );
    }
    return false;
  };

  // Update the handleSubmit function touse facilityAssignmentOption instead of facilityOption for facility logic

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

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) {
      toast.error("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    try {
      if (facilityOption === "existing") {
        const selectedFacility = facilities.find(
          (f) => f.facilityName === selectedFacilityId
        );

        const selectedAdmin = admins.find((a) => a?._id === selectedAdminId);
        if (!selectedFacility && selectedAdmin) {
          const existingAdminandnewfaciltyResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/create-facility-with-existing-admin`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("token")}`,
              },
              body: JSON.stringify({
                adminId: selectedAdmin?._id,
                email,
                facilityName: newFacilityName,
                facilityAddress: newFacilityAddress,
                noOfBeds: parseInt(newFacilityBeds, 10),
                state: newFacilityState,
                facilityCode: facilityCode,
              }),
            }
          );

          const assignmentData =
            await existingAdminandnewfaciltyResponse.json();

          if (!existingAdminandnewfaciltyResponse.ok) {
            toast.error(
              assignmentData.message || "Failed to assign admin to facility"
            );
            return;
          }
        }

        if (facilityOption === "existing" &&  selectedAdmin && selectedFacility) {
          console.log("running 287")
        const assignmentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/assign-admin-to-facility`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
            body: JSON.stringify({
              adminId: selectedAdminId,
              facilityId: selectedFacility?._id,
              facilityName: selectedFacility?.facilityName,
            }),
          }
        );

        const assignmentData = await assignmentResponse.json();

        if (!assignmentResponse.ok) {
          toast.error(
            assignmentData.message || "Failed to assign admin to facility"
          );
          return;
        }}

        toast.success("Admin successfully assigned to facility!");
      } else if (facilityOption === "new") {
        // Scenario 2: Create new admin and new facility

        // Step 1: Create the new facility admin user
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
              role: "Facility Admin",
              position,
              DepartmentName: departmentName,
              facilityName: newFacilityName, // Pass facility name to user creation
            }),
          }
        );

        const userData = await userResponse.json();

        if (!userResponse.ok) {
          toast.error(userData.message || "Failed to create user");
          return;
        }

        // Step 2: Create the new facility
        const facilityResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/create-facility`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
            body: JSON.stringify({
              email,
              facilityName: newFacilityName,
              facilityAddress: newFacilityAddress,
              noOfBeds: parseInt(newFacilityBeds, 10),
              state: newFacilityState,
              facilityCode: facilityCode,
              adminId: userData?._id, // Link the created user to the facility
            }),
          }
        );

        const facilityData = await facilityResponse.json();

        if (!facilityResponse.ok) {
          toast.error(facilityData.message || "Failed to create facility");
          return;
        }

        // Step 3: Update the user with the facility ID (optional, depending on your backend structure)
        const updateUserResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/update-user-facility`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
            body: JSON.stringify({
              userId: userData._id,
              facilityId: facilityData.facility?._id,
              facilityName: newFacilityName,
            }),
          }
        );

        toast.success(
          "Facility Admin created and facility assigned successfully!"
        );
      }

      setCurrentStep(1);
      setFirstName("");
      setLastName("");
      setEmail("");
      setFacilityCode("");
      setPassword("");
      setConfirmPassword("");
      setDepartmentName("");
      setPosition("");
      setFacilityOption("");
      setSelectedAdminId("");
      setSelectedFacilityId("");
      setNewFacilityName("");
      setNewFacilityAddress("");
      setNewFacilityState("");
      setNewFacilityBeds("");

      // Refresh the data
      router.push("/AddNewAdmin");
      await fetchRegionalAdmins();
      await fetchFacilities();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Facility Admin Assignment
      </h3>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
                setDepartmentName("");
                setPosition("");
              }}
              className="text-blue-600"
            />
            <span className="text-gray-700">
              Assign to Existing Facility Admin
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
            <span className="text-gray-700">Create New Facility Admin</span>
          </label>
        </div>

        {facilityOption === "existing" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Facility Admin *
            </label>
            <select
              value={selectedAdminId}
              onChange={(e) => setSelectedAdminId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a Facility Admin</option>
              {admins.map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.firstname} {admin.lastname} ({admin.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {facilityOption === "new" && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">
              User Information
            </h4>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  value={departmentName}
                  onChange={(e) => {
                    setDepartmentName(e.target.value);
                    setPosition("");
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {Object.keys(departmentPositions).map((key) => (
                    <option key={key} value={key}>
                      {departmentLabels[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position *
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!positions.length}
                >
                  <option value="">
                    {positions.length
                      ? "Select Position"
                      : "Select Department First"}
                  </option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Facility Assignment
      </h3>

      <div className="space-y-4">
        {/* Radio buttons for facility selection - available for both existing and new admin */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="facilityAssignment"
              value="existing"
              checked={facilityAssignmentOption === "existing"}
              onChange={(e) => {
                setFacilityAssignmentOption(e.target.value);
                setSelectedFacilityId("");
                setNewFacilityName("");
                setNewFacilityAddress("");
                setNewFacilityState("");
                setNewFacilityBeds("");
                setFacilityCode("");
              }}
              className="text-blue-600"
            />
            <span className="text-gray-700">Assign to Existing Facility</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="facilityAssignment"
              value="new"
              checked={facilityAssignmentOption === "new"}
              onChange={(e) => {
                setFacilityAssignmentOption(e.target.value);
                setSelectedFacilityId("");
              }}
              className="text-blue-600"
            />
            <span className="text-gray-700">Create New Facility</span>
          </label>
        </div>

        {facilityAssignmentOption === "existing" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Facilities *
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a facility</option>
              {availableFacilities.map((facility, index) => (
                <option key={index} value={facility}>
                  {facility}
                </option>
              ))}
            </select>
          </div>
        )}

        {facilityAssignmentOption === "new" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility Name *
              </label>
              <input
                type="text"
                value={newFacilityName}
                onChange={(e) => setNewFacilityName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter facility name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Beds *
              </label>
              <input
                type="number"
                min="1"
                value={newFacilityBeds}
                onChange={(e) => setNewFacilityBeds(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter number of beds"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility Address *
              </label>
              <input
                type="text"
                value={newFacilityAddress}
                onChange={(e) => setNewFacilityAddress(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter complete address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <select
                value={newFacilityState}
                onChange={(e) => setNewFacilityState(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select State</option>
                {usStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility Code *
              </label>
              <input
                type="text"
                value={facilityCode}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^A-Za-z]/g, "")
                    .slice(0, 3);
                  setFacilityCode(value.toUpperCase());
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Facility Code (3 letters, e.g., BAY)"
                maxLength={3}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Review & Confirm
      </h3>

      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Admin Details</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {facilityOption === "existing" ? (
              <>
                <p>
                  <strong>Type:</strong> Existing Admin Assignment
                </p>
                {(() => {
                  const selectedAdmin = admins.find(
                    (a) => a._id === selectedAdminId
                  );
                  return selectedAdmin ? (
                    <>
                      <p>
                        <strong>Admin:</strong> {selectedAdmin.firstname}{" "}
                        {selectedAdmin.lastname}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedAdmin.email}
                      </p>
                    </>
                  ) : null;
                })()}
              </>
            ) : (
              <>
                <p>
                  <strong>Type:</strong> New Admin Creation
                </p>
                <p>
                  <strong>Name:</strong> {firstName} {lastName}
                </p>
                <p>
                  <strong>Email:</strong> {email}
                </p>
                <p>
                  <strong>Department:</strong>{" "}
                  {departmentLabels[departmentName]}
                </p>
                <p>
                  <strong>Position:</strong> {position}
                </p>
                <p>
                  <strong>Role:</strong> Facility Admin
                </p>
              </>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-2">
            Facility Assignment
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            {facilityOption === "existing" && selectedFacilityId ? (
              (console.log("selectedFacilityId", selectedFacilityId),
              (() => {
                const selectedFacility = availableFacilities.find(
                  (f) => f._id === selectedFacilityId
                );

                return selectedFacilityId ? (
                  <>
                    <p>
                      <strong>Assignment Type:</strong> Existing Facility
                    </p>

                    <p>
                      <strong>Facility Code</strong> {selectedFacilityId}
                    </p>
                  </>
                ) : null;
              })())
            ) : (
              <>
                <p>
                  <strong>Assignment Type:</strong> New Facility
                </p>
                <p>
                  <strong>Facility Name:</strong> {newFacilityName}
                </p>
                <p>
                  <strong>Address:</strong> {newFacilityAddress}
                </p>
                <p>
                  <strong>State:</strong> {newFacilityState}
                </p>
                <p>
                  <strong>Beds:</strong> {newFacilityBeds}
                </p>
                <p>
                  <strong>Facility Code:</strong> {facilityCode}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md"
      >
        <Menu size={24} />
      </button>

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8 mt-12 lg:mt-0">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
              Add Facility Admin
            </h1>
            <p className="text-gray-600 text-center">
              Create a new facility admin and assign them to a facility
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Step 1 */}
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > 1 ? (
                    <CheckCircle size={20} />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                  Admin Info
                </span>
              </div>

              <ChevronRight className="text-gray-400" size={20} />

              {/* Step 2 */}
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 2
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > 2 ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Building2 size={20} />
                  )}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                  Facility
                </span>
              </div>

              <ChevronRight className="text-gray-400" size={20} />

              {/* Step 3 */}
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 3
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <CheckCircle size={20} />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                  Review
                </span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
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
                  currentStep === 1 ? !validateStep1() : !validateStep2()
                }
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  (currentStep === 1 ? !validateStep1() : !validateStep2())
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
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  loading || !validateStep1() || !validateStep2()
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} className="mr-1" />
                    Create Admin & Assign Facility
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityAdminCreationFlow;
