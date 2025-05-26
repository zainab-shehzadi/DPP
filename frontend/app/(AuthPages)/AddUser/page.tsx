"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { use, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Sidebar from "@/components/Sidebar";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { departmentLabels, departmentPositions, roles } from "@/constants/dpp";
import Cookies from "js-cookie";
export default function Dashboard() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState("Facility Users");
  const [loading, setLoading] = useState(true);
  const [facilityAdmins, setFacilityAdmins] = useState([]);
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [noOfBeds, setNoOfBeds] = useState("1");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const positions = departmentName
    ? departmentPositions[departmentName] || []
    : [];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleModalClose = () => setIsModalOpen(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  const handleSubmit = async () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !role ||
      !position ||
      !departmentName ||
      !facilityName
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      const response = await fetch(
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
            role: "Facility Users",
            position,
            DepartmentName: departmentName,
            facilityName,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("User successfully added!");
        router.push("/AddNewUser");
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      toast.error("Error adding user. Please try again.");
    }
  };
  useEffect(() => {
    const fetchFacilityAdmins = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/facility-admins`
        );

        const data = await res.json();
        console.log(data);
        if (res.ok) {
          setFacilityAdmins(data?.facilities?.map((f) => f.facilityName));
        } else {
          toast.error("Failed to fetch facility admins:", data.message);
        }
      } catch (error: any) {
        toast.error("Error fetching facility admins:", error);
      }
    };
    fetchFacilityAdmins();
  }, []);
  const handleFacilitySubmit = async (e) => {
    e.preventDefault();

    if (!facilityName || !facilityAddress || !noOfBeds) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/facility/info`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            facilityName,
            facilityAddress,
            noOfBeds: parseInt(noOfBeds, 10),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save facility");

      toast.success("Facility saved successfully!");
      setIsModalOpen(false);
      router.push("/AddNewUser");
    } catch (error) {
      toast.error("Failed to save facility. Please try again.");
    }
  };
  const name = Cookies.get("name");
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
          <div className="lg:ml-64 p-4 sm:p-8 w-full">
            <header className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Hello, <span className="text-blue-900">{name}</span>
              </h2>
              <div className="flex items-center border border-gray-300 p-2 rounded-md">
                <Image
                  src="/assets/image.png"
                  width={40}
                  height={40}
                  alt="User Profile"
                  className="rounded-full"
                />
                <span className="ml-2 text-gray-800">User </span>
              </div>
            </header>

            <div className="w-full h-[60px] bg-[#002F6C] h-10 rounded-lg mb-8"></div>

            <section className="bg-white p-6 rounded-md shadow">
              <h1 className="text-3xl font-bold mb-1 text-center">Add User</h1>
              <h3 className="text-xl text-[#6f7174]  text-center mb-10">
                Enter detail to add user
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="p-2 border rounded "
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="p-2 border rounded "
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2 border rounded "
                />

                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="p-2 border rounded w-full pr-10"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </span>
                </div>

                <select
                  value={departmentName}
                  onChange={(e) => {
                    setDepartmentName(e.target.value);
                    setPosition("");
                  }}
                  className="p-2 border rounded "
                >
                  <option value="">Select Department</option>
                  {Object.keys(departmentPositions).map((key) => (
                    <option key={key} value={key}>
                      {departmentLabels[key]}
                    </option>
                  ))}
                </select>

                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="p-2 border rounded "
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

                <select
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full p-2 border rounded bg-[#F9F9F9]"
                >
                  <option value="">Select Facility Name</option>
                  {facilityAdmins.map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={handleSubmit}
                  className="bg-[#002F6C] text-white px-6 py-2 rounded-lg"
                >
                  Save User
                </button>
              </div>
            </section>

            {/* {isModalOpen && (
              <div
                className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
                onClick={handleModalClose}
              >
                <div
                  className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-xl font-semibold text-center mb-6">
                    Facility Detail
                  </h2>
                  <form onSubmit={handleFacilitySubmit} className="space-y-4">
                    <select
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      className="w-full p-2 border rounded bg-[#F9F9F9]"
                    >
                      <option value="">Select Facility Name</option>
                      <option value="facility1">Facility 1</option>
                      <option value="facility2">Facility 2</option>
                      <option value="facility3">Facility 3</option>
                    </select>
                    <input
                      type="text"
                      value={facilityAddress}
                      onChange={(e) => setFacilityAddress(e.target.value)}
                      placeholder="Enter Facility Address"
                      className="w-full p-2 border rounded bg-[#F9F9F9]"
                    />

                    <select
                      value={noOfBeds}
                      onChange={(e) => setNoOfBeds(e.target.value)}
                      className="w-full p-2 border rounded bg-[#F9F9F9]"
                    >
                      <option value="">Select No of Beds</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                    <button
                      type="submit"
                      className="w-full bg-blue-900 text-white py-3 rounded-md"
                    >
                      Submit
                    </button>
                  </form>
                </div>
              </div>
            )} */}
          </div>
        </>
      )}
    </div>
  );
}
