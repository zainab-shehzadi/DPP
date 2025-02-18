"use client"; // <-- Mark this file as a client component
import { useRouter } from 'next/navigation'; // Import the useRouter hook
import Image from "next/image";
import { FaBell } from "react-icons/fa";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role: "",
    position: "",
    DepartmentName: "",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Department-to-Positions Mapping
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
  const router = useRouter(); // Initialize the router
  // Leadership and Supporting Roles
  const roleCategories = {
    leadership: ["Director", "Manager", "Supervisor"],
    supporting: ["Staff", "Assistant", "Liaison"],
  };

  const leadershipRoles = roleCategories.leadership;
  const supportingRoles = roleCategories.supporting;

  // Derived positions based on selected department
  const positions = formData.DepartmentName
    ? departmentPositions[formData.DepartmentName] || []
    : [];

  // State change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset position if department changes
    if (name === "DepartmentName") {
      setFormData((prev) => ({
        ...prev,
        position: "",
      }));
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/add`,
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
        toast.success("User successfully added.!", { position: "top-right" });
        
        setFormData({
          firstname: "",
          lastname: "",
          email: "",
          role: "",
          position: "",
          DepartmentName: "",
        });
        router.push("/AddNewUser"); // Change the route as necessary
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Error adding user. Please try again.");
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
          style={{ backgroundImage: "url('/assets/logo.avif')" }}
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
            <FaBell className="text-gray-500 text-base sm:text-lg lg:text-xl" />
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
{/* Date Display */}
<div className="flex justify-end pr-4 sm:pr-12 md:pr-24 lg:pr-48 mb-4">
  <div className="border border-black px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-md text-xs sm:text-sm md:text-base bg-white">
    <span className="text-black">30 November 2024</span>
  </div>
</div>



{/* Progress Bar */}
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
                  name="firstname"
                  value={formData.firstname}
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
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Your Last Name"
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
      </div>
    </div>
  );
}
