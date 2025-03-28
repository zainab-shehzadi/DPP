"use client"; 
import { useRouter } from 'next/navigation'; 
import Image from "next/image";
import { FaBell } from "react-icons/fa";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Sidebar from "@/components/Admin-sidebar";
import DateDisplay from '@/components/date';

export default function Dashboard() {
  const router = useRouter(); 
 
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword:"",
    email: "",
    role: "",
    position: "",
    DepartmentName: "",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [facilityName, setFacilityName] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [noOfBeds, setNoOfBeds] = useState("1");
    const [email, setEmail] = useState<string | null>(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const departmentPositions = {
    "Business Office": ["Office Manager", "Biller", "Payroll", "Reception", "Admissions"],
    "Director of Admissions": ["Liaison"],
    "IT Department": ["Director of Activities"],
    Activities: ["Director of Activities", "Activity Staff"],
    Maintenance: ["Director of Maintenance", "Maintenance Staff"],
    Dietary: ["Director of Dietary", "Dietitian", "Dietary Staff"],
    Therapy: ["Director of Therapy", "Therapy Staff"],
    Laundry: ["Laundry Supervisor"],
    Housekeeping: ["Housekeeping Supervisor"],
    "Case Management": ["Case Manager"],
    MDS: ["Director of MDS", "MDS Staff"],
    Nursing: ["Director of Nursing", "Assistant Director of Nursing", "Unit Manager"],
    Administration: ["Administrator", "Administrator in Training"],
    "Social Services": ["Social Services Director", "Social Services Staff"],
    "Staff Development Department": ["Staff Development Coordinator"],
    "Nursing Department": ["Nursing Development Coordinator"],
    "Quality Assurance Department": ["Nursing Development Coordinator"],
  };
  const roleCategories = {
    leadership: ["Director", "Manager", "Supervisor"],
    supporting: ["Staff", "Assistant", "Liaison"],
  };
  const leadershipRoles = roleCategories.leadership;
  const supportingRoles = roleCategories.supporting;


  const positions = formData.DepartmentName
    ? departmentPositions[formData.DepartmentName] || []
    : [];


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "DepartmentName") {
      setFormData((prev) => ({
        ...prev,
        position: "",
      }));
    }
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
const handleSubmit = async () => {
 

  if (
    !formData.firstName ||
    !formData.lastName ||
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword ||
    !formData.role ||
    !formData.position ||
    !formData.DepartmentName
  ) {
    toast.error("Please fill in all required fields!", { position: "top-right" });
    return;
  }
  if (formData.password !== formData.confirmPassword) {
    toast.error("Passwords do not match!", { position: "top-right" });
    return; 
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success("User successfully added!", { position: "top-right" });

      setFormData({
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        email: "",
        role: "",
        position: "",
        DepartmentName: "",
      });
      const { email } = formData;
       console.log("Checking Form Data Before Logging:", formData);
       setEmail(email);
      setIsModalOpen(true);
    } else {
      toast.error(`Error: ${data.message}`);
    }
  } catch (error) {
    
    toast.error("Error adding user. Please try again.");
  }
};


  const handleSubmit1 = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!facilityName || !facilityAddress || !noOfBeds) {
      toast.error("All fields are required!", { position: "top-right" });
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
  
      if (!response.ok) {
        throw new Error("Failed to save facility.");
      }

      const data = await response.json();
      toast.success("Facility saved successfully!", { position: "top-right" });
      setIsModalOpen(false);
      router.push("/AddNewUser"); 
    } catch (error) {
      console.error("Error saving facility:", error);
      toast.error("Failed to save facility. Please try again.", {
        position: "top-right",
      });
    }
  };
  // Sidebar toggle
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Mobile Toggle Button */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#002F6C] text-white">
        <div
          className="h-12 w-12 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/logo-dpp1.png')" }}
        ></div>
      </div>

      {/* Sidebar Component */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-8 w-full">
        <header className="flex items-center justify-between mb-6 w-full flex-wrap">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold">
            Hello, <span className="text-blue-900">User</span>
          </h2>
          <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
            <div className="flex items-center border border-gray-300 p-1 sm:p-2 rounded-md space-x-2">
              <Image
                src="/assets/image.png"
                width={28}
                height={28}
                className="rounded-full sm:w-10 sm:h-10 lg:w-12 lg:h-12"
                alt="User Profile"
              />
              <span className="text-gray-800 text-sm sm:text-base lg:text-lg">
                User
              </span>
            </div>
          </div>
        </header>
        <div className="flex justify-end pr-4 sm:pr-12 lg:pr-48 mb-4"><DateDisplay/></div>

<div className="w-full sm:w-3/4 h-6 sm:h-12 lg:h-10 bg-[#002F6C] mt-2 rounded-lg mx-auto mb-8"></div>
{/* Add User Form */}
        <div className="w-full sm:w-3/4 lg:w-3/3 mx-auto mt-6 sm:mt-8">
        
          <section className="bg-white p-4 sm:p-6 lg:p-8 ">
            <div className="text-center mb-10">
              <h3 className="font-bold text-2xl sm:text-2xl lg:text-3xl">
                Add User
              </h3>
              <p className="text-gray-900 text-sm sm:text-base lg:text-lg opacity-40 mb-4">
                Enter details to add a user.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10">
              {/* First Name */}
     
<div>
  <label className="block text-gray-700 font-medium">First Name</label>
  <input
    type="text"
    name="firstName" 
    value={formData.firstName}
    onChange={handleChange}
    placeholder="Your First Name"
    className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9] border"
  />
</div>

{/* Last Name */}
<div>
  <label className="block text-gray-700 font-medium">Last Name</label>
  <input
    type="text"
    name="lastName" 
    value={formData.lastName}
    onChange={handleChange}
    placeholder="Your Last Name"
    className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9] border"
  />
</div>


              <div>
  <label className="block text-gray-700 font-medium">Password</label>
  <input
    type="password"
    name="password"
    value={formData.password}
    onChange={handleChange}
    placeholder="Your password"
    className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9] border"
  />
</div>

{/* Confirm Password */}
<div>
  <label className="block text-gray-700 font-medium">Confirm Password</label>
  <input
    type="password"
    name="confirmPassword"
    value={formData.confirmPassword}
    onChange={handleChange}
    placeholder="Your confirm password"
    className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9] border"
  />
</div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email Address"
                  className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9] border"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-gray-700 font-medium">Department</label>
                <select
                  name="DepartmentName"
                  value={formData.DepartmentName}
                  onChange={handleChange}
                  className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9] border"
                >
                  <option value="" disabled>
                    Select a Department
                  </option>
                  {Object.keys(departmentPositions).map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <label className="block text-gray-700 font-medium">Position</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9] border"
                  disabled={!positions.length}
                >
                  <option value="" disabled>
                    {positions.length ? "Select a Position" : "Select a Department First"}
                  </option>
                  {positions.map((pos, index) => (
                    <option key={index} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="block text-gray-700 font-medium">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-2 w-full p-2 rounded-md bg-[#F9F9F9] border"
                >
                  <option value="" disabled>
                    Select a Role
                  </option>
                  <optgroup label="Leadership Roles">
                    {leadershipRoles.map((role, index) => (
                      <option key={index} value={role}>
                        {role}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Supporting Roles">
                    {supportingRoles.map((role, index) => (
                      <option key={index} value={role}>
                        {role}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>


            </div>
              
            {/* Submit Button */}
            <div className="text-center">
              <button
                onClick={handleSubmit}
                className="bg-[#002F6C] text-white px-6 py-2 rounded-lg"
              >
                Send Invite
              </button>
            </div>
          </section>
        </div>


        {isModalOpen && (
  <div
    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
    onClick={handleModalClose}
  >
    <div
      className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg space-y-6"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Facility Detail
      </h2>

      <form onSubmit={handleSubmit1} className="space-y-4">
        {/* Facility Name (Dropdown) */}
        <div>
          <label className="block text-gray-700 font-medium">Facility Name</label>
          <select
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Facility Name</option>
            <option value="facility1">Facility1</option>
            <option value="facility2">Facility2</option>
            <option value="facility3">Facility3</option>
            <option value="facility4">Facility4</option>
          </select>
        </div>

        {/* Facility Address (Dropdown) */}
        <div>
          <label className="block text-gray-700 font-medium">Facility Address</label>
          <select
            value={facilityAddress}
            onChange={(e) => setFacilityAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Facility Address</option>
            <option value="address1">Address1</option>
            <option value="address2">Address2</option>
            <option value="address3">Address3</option>
            <option value="address4">Address4</option>
          </select>
        </div>

        {/* No of Beds (Dropdown) */}
        <div>
          <label className="block text-gray-700 font-medium">No. of Beds</label>
          <select
            value={noOfBeds}
            onChange={(e) => setNoOfBeds(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select No of Beds</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-900 text-white w-full py-3 rounded-md "
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      </div>
    </div>
  );
}
