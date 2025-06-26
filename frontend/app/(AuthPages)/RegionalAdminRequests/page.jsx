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
import { toast } from "react-toastify";

const RegionalAdminRequest = () => {
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Current Facility Admin Info
  const [currentFacilityAdmin, setCurrentFacilityAdmin] = useState(null);
  const [facilityAdminLoading, setFacilityAdminLoading] = useState(true);

  // User Details State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [position, setPosition] = useState("");
  const [facilityData, setfacilityData] = useState("");

  // Fetch facility data based on email
  const fetchFacilityData = async (userEmail) => {
    if (!userEmail) {
      console.log("No email provided, skipping facility fetch");
      return;
    }

    try {
      console.log("Fetching facility data for email:", userEmail);

      const facilityRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/check-facility123`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        }
      );

      if (!facilityRes.ok) {
        throw new Error("Failed to fetch facility information");
      }

      const data = await facilityRes.json();
      console.log("Facility data received:", data);

      setfacilityData(data.facility);
      setDepartmentName(data.user?.DepartmentName || "");
    } catch (error) {
      console.error("Error fetching facility info:", error);
      toast.error("Failed to load facility information");
    }
  };

  // First useEffect: Fetch current facility admin info
  useEffect(() => {
    const fetchCurrentFacilityAdmin = async () => {
      try {
        setFacilityAdminLoading(true);
        const token = Cookies.get("token");

        const response = await fetch("http://localhost:5000/api/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch facility admin information");
        }

        const data = await response.json();
        console.log("Current facility admin data:", data);

        setCurrentFacilityAdmin(data.user);
        const userEmail = data?.user?.email;
        setEmail(userEmail);

        // Pre-fill some fields if needed
        setDepartmentName(data.user.DepartmentName || "");

        // Fetch facility data immediately after setting email
        if (userEmail) {
          await fetchFacilityData(userEmail);
        }
      } catch (error) {
        console.error("Error fetching facility admin info:", error);
        toast.error("Failed to load facility admin information");
      } finally {
        setFacilityAdminLoading(false);
      }
    };

    fetchCurrentFacilityAdmin();
  }, []);
  
  // Optional: Separate useEffect to handle email changes (if email can be changed later)
  useEffect(() => {
    if (email && email !== currentFacilityAdmin?.email) {
      console.log("Email changed, fetching facility data for:", email);
      const timer = setTimeout(() => {
        fetchFacilityData(email);
      }, 500); // Reduced timeout for better UX

      return () => clearTimeout(timer);
    }
  }, [email, currentFacilityAdmin?.email]);

  // const handleSubmit = async () => {
  //   if (!currentFacilityAdmin) {
  //     toast.error("Facility admin information not loaded!");
  //     return;
  //   }

  //   if (!facilityData) {
  //     toast.error("Facility information not loaded!");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const requestData = {
  //       facilityAdmin: {
  //         _id: currentFacilityAdmin._id,
  //         firstname: currentFacilityAdmin.firstname,
  //         lastname: currentFacilityAdmin.lastname,
  //         email: currentFacilityAdmin.email,
  //         facilityCode: facilityData.facilityCode,
  //         facilityName: facilityData.facilityName,
  //         facilityAddress: facilityData.facilityAddress,
  //         departmentName: currentFacilityAdmin.DepartmentName,
  //         position: currentFacilityAdmin.Position,
  //         status: currentFacilityAdmin.status,
  //         priceType: currentFacilityAdmin.priceType,
  //         priceCycle: currentFacilityAdmin.priceCycle,
  //       },
  //       requestType: "Regional Admin Creation",
  //       requestedAt: new Date().toISOString(),
  //       status: "pending",
  //     };

  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/regional-admin`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${Cookies.get("token")}`,
  //         },
  //         body: JSON.stringify(requestData),
  //       }
  //     );

  //     const responseData = await response.json();

  //     if (!response.ok) {
  //       toast.error(responseData.message || "Failed to submit request");
  //       return;
  //     }

  //     toast.success(
  //       "Regional Admin request submitted successfully! Waiting for Super Admin approval."
  //     );
  //     setCurrentStep(1);
  //     setFirstName("");
  //     setLastName("");
  //     setPassword("");
  //     setConfirmPassword("");
  //     setDepartmentName(currentFacilityAdmin?.DepartmentName || "");
  //     setPosition("");
  //     setSelectedFacilities([]);
  //   } catch (error) {
  //     console.error("Error submitting request:", error);
  //     toast.error(`Error: ${error.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!currentFacilityAdmin) {
      toast.error("Facility admin information not loaded!");
      return;
    }

    if (!facilityData) {
      toast.error("Facility information not loaded!");
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        facilityAdmin: {
          _id: currentFacilityAdmin._id,
          firstname: currentFacilityAdmin.firstname,
          lastname: currentFacilityAdmin.lastname,
          email: currentFacilityAdmin.email,
          facilityCode: facilityData.facilityCode,
          facilityName: facilityData.facilityName,
          facilityAddress: facilityData.facilityAddress,
          departmentName: currentFacilityAdmin.DepartmentName,
          position: currentFacilityAdmin.Position,
          status: currentFacilityAdmin.status,
          priceType: currentFacilityAdmin.priceType,
          priceCycle: currentFacilityAdmin.priceCycle,
        },
        requestType: "Regional Admin Creation",
        requestedAt: new Date().toISOString(),
        status: "pending",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/regional-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        toast.error(responseData.message || "Failed to submit request");
        return;
      }

      toast.success(
        "Regional Admin request submitted successfully! Waiting for Super Admin approval."
      );

      // Reset form if needed
      setCurrentStep(1);
      setFirstName("");
      setLastName("");
      setPassword("");
      setConfirmPassword("");
      setDepartmentName(currentFacilityAdmin?.DepartmentName || "");
      setPosition("");
      setSelectedFacilities([]);

      // Mark as submitted
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderFacilityAdminInfo = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h4 className="font-semibold text-blue-800 mb-2">Facility Information</h4>
      {currentFacilityAdmin && facilityData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Name:</span>{" "}
            {currentFacilityAdmin?.firstname} {currentFacilityAdmin?.lastname}
          </div>
          <div>
            <span className="font-medium">Email:</span>{" "}
            {currentFacilityAdmin?.email}
          </div>
          <div>
            <span className="font-medium">Facility Code:</span>{" "}
            {facilityData?.facilityCode || "Loading..."}
          </div>
          <div>
            <span className="font-medium">Facility Name:</span>{" "}
            {facilityData?.facilityName || "Loading..."}
          </div>
          <div>
            <span className="font-medium">Facility Address:</span>{" "}
            {facilityData?.facilityAddress || "Loading..."}
          </div>
          <div>
            <span className="font-medium">Department:</span>{" "}
            {currentFacilityAdmin?.DepartmentName}
          </div>
          <div>
            <span className="font-medium">Position:</span>{" "}
            {currentFacilityAdmin?.Position}
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span
              className={`ml-1 px-2 py-1 rounded-full text-xs ${
                currentFacilityAdmin?.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : currentFacilityAdmin?.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {currentFacilityAdmin?.status}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">Loading facility information...</div>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Request for Regional Admin
      </h3>

      {renderFacilityAdminInfo()}

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          disabled={
            loading || facilityAdminLoading || !facilityData || submitted
          }
          className="bg-blue-900 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Submitting Request...</span>
            </>
          ) : submitted ? (
            <>
              <CheckCircle size={20} />
              <span>Request Submitted</span>
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              <span>Submit Request to Super Admin</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (facilityAdminLoading) {
    return (
      <div className="flex flex-col lg:flex-row">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <div className="flex items-center justify-center w-full h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">
                Request Regional Admin Creation
              </h1>
              <p className="text-gray-600 text-center">
                Submit a request to Super Admin for creating a new regional
                admin
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              {renderStep1()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RegionalAdminRequest;
